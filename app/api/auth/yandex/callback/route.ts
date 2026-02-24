import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/services/email'
import { registerReferral } from '@/lib/actions/referrals'
import { ensureBonusAccountExists } from '@/lib/actions/bonuses'
import { logUserAuth } from '@/lib/actions/admin-user-extra'

// Интерфейсы для ответов Yandex API
interface YandexTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

interface YandexUserInfo {
  id: string
  login: string
  client_id: string
  display_name?: string
  real_name?: string
  first_name?: string
  last_name?: string
  sex?: string
  default_email?: string
  emails?: string[]
  default_avatar_id?: string
  is_avatar_empty?: boolean
  birthday?: string
  default_phone?: {
    id: number
    number: string
  }
}

/**
 * Yandex OAuth Callback Endpoint
 * Обрабатывает callback от Yandex OAuth и создает/входит в аккаунт пользователя
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('[Yandex Callback] Received callback:', { 
      hasCode: !!code, 
      hasState: !!state,
      error 
    })

    // Проверка на ошибки от Yandex
    if (error) {
      console.error('[Yandex Callback] OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=yandex_auth_failed`
      )
    }

    // Проверка наличия code
    if (!code) {
      console.error('[Yandex Callback] No authorization code provided')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=no_code`
      )
    }

    // Декодируем state для получения redirect URL и реферального кода
    let redirectTo = '/dashboard'
    let refCode: string | null = null
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
        redirectTo = stateData.redirect || '/dashboard'
        refCode = stateData.ref || null
      } catch (e) {
        console.warn('[Yandex Callback] Failed to decode state:', e)
      }
    }
    
    console.log('[Yandex Callback] State decoded:', { redirectTo, refCode: refCode || 'NONE' })

    // ============================================
    // ШАГ 1: Обмен code на access_token
    // ============================================
    const clientId = process.env.YANDEX_CLIENT_ID
    const clientSecret = process.env.YANDEX_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/yandex/callback`

    if (!clientId || !clientSecret) {
      console.error('[Yandex Callback] Client credentials not configured')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=config_error`
      )
    }

    console.log('[Yandex Callback] Exchanging code for token')

    const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[Yandex Callback] Token exchange failed:', tokenResponse.status, errorText)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=token_exchange_failed`
      )
    }

    const tokenData: YandexTokenResponse = await tokenResponse.json()
    console.log('[Yandex Callback] Token received successfully')

    // ============================================
    // ШАГ 2: Получение данных пользователя
    // ============================================
    console.log('[Yandex Callback] Fetching user info')

    const userInfoResponse = await fetch('https://login.yandex.ru/info?format=json', {
      headers: {
        'Authorization': `OAuth ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('[Yandex Callback] User info fetch failed:', userInfoResponse.status, errorText)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=user_info_failed`
      )
    }

    const userInfo: YandexUserInfo = await userInfoResponse.json()
    console.log('[Yandex Callback] User info received:', { 
      id: userInfo.id, 
      email: userInfo.default_email,
      name: userInfo.real_name || userInfo.display_name
    })

    // ============================================
    // ШАГ 3: Создание/вход в Supabase
    // ============================================
    const supabase = await createClient()

    // Формируем email для Yandex пользователей
    // Если есть настоящий email от Yandex - используем его, иначе создаем виртуальный
    const yandexEmail = userInfo.default_email || `yandex_${userInfo.id}@yandex.local`
    
    // Формируем полное имя
    const fullName = userInfo.real_name || 
                     userInfo.display_name || 
                     [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ') ||
                     userInfo.login

    // Создаем детерминированный пароль на основе client secret и yandex id
    const deterministicPassword = crypto
      .createHash('sha256')
      .update(`${clientSecret}:${userInfo.id}`)
      .digest('hex')

    // ============================================
    // ШАГ 4: Проверяем существование по yandex_id
    // ============================================
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, yandex_id')
      .eq('yandex_id', userInfo.id)
      .single()

    console.log('[Yandex Callback] Profile lookup by yandex_id:', { 
      found: !!existingProfile, 
      error: profileError?.message,
      yandex_id: userInfo.id
    })

    let userId: string
    let isNewUser = false

    if (existingProfile) {
      // ============================================
      // СЛУЧАЙ 1: Пользователь найден по yandex_id
      // ============================================
      console.log('[Yandex Callback] Existing user found by yandex_id:', { 
        id: existingProfile.id, 
        email: existingProfile.email
      })
      userId = existingProfile.id
      
      // Убедимся что бонусный аккаунт существует
      await ensureBonusAccountExists(userId)
      
      // Обновляем данные профиля
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          email: yandexEmail,
        })
        .eq('id', userId)

      // Входим с детерминированным паролем
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: yandexEmail,
        password: deterministicPassword
      })

      if (signInError || !signInData.session) {
        console.error('[Yandex Callback] Failed to sign in:', signInError?.message)
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=signin_failed`
        )
      }

      console.log('[Yandex Callback] Existing user signed in successfully')

      // Логируем вход
      await logUserAuth(userId).catch(e => console.error('Auth logging failed:', e))

      // Редиректим с установленной сессией
      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo}`)
      
      // Устанавливаем cookies для сессии
      response.cookies.set('sb-access-token', signInData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: signInData.session.expires_in || 3600
      })
      
      response.cookies.set('sb-refresh-token', signInData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 дней
      })

      return response
    }

    // ============================================
    // ШАГ 5: Проверяем существование в auth.users по email
    // ============================================
    console.log('[Yandex Callback] User not found by yandex_id, checking auth.users by email')
    
    const { data: existingAuthData, error: existingAuthError } = await supabase.auth.signInWithPassword({
      email: yandexEmail,
      password: deterministicPassword
    })

    if (existingAuthData?.user && existingAuthData?.session) {
      // ============================================
      // СЛУЧАЙ 2: Пользователь существует в auth.users, но yandex_id не заполнен
      // ============================================
      console.log('[Yandex Callback] User found in auth.users without yandex_id')
      
      userId = existingAuthData.user.id

      // Убедимся что бонусный аккаунт существует
      await ensureBonusAccountExists(userId)

      // Обновляем профиль, добавляя yandex_id
      await supabase
        .from('profiles')
        .update({
          yandex_id: userInfo.id,
          full_name: fullName,
          email: yandexEmail,
        })
        .eq('id', userId)

      console.log('[Yandex Callback] Profile updated with yandex_id')

      // Логируем вход
      await logUserAuth(userId).catch(e => console.error('Auth logging failed:', e))

      // Редиректим с существующей сессией
      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo}`)
      
      response.cookies.set('sb-access-token', existingAuthData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: existingAuthData.session.expires_in || 3600
      })
      
      response.cookies.set('sb-refresh-token', existingAuthData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })

      return response
    }

    // ============================================
    // СЛУЧАЙ 3: Новый пользователь - создаем аккаунт
    // ============================================
    console.log('[Yandex Callback] New user, creating account')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: yandexEmail,
      password: deterministicPassword,
      options: {
        data: {
          full_name: fullName,
          yandex_id: userInfo.id,
          provider: 'yandex'
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      }
    })

    if (authError || !authData.user) {
      console.error('[Yandex Callback] Failed to create user:', authError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=signup_failed`
      )
    }

    userId = authData.user.id
    isNewUser = true
    console.log('[Yandex Callback] User created:', userId)

    // Создаем профиль
    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: yandexEmail,
        full_name: fullName,
        yandex_id: userInfo.id,
        role: 'user',
        subscription_status: 'inactive',
        subscription_tier: 'free'
      })

    if (createProfileError) {
      console.error('[Yandex Callback] Failed to create profile:', createProfileError)
      // Продолжаем выполнение, профиль может создаться через trigger
    } else {
      console.log('[Yandex Callback] Profile created successfully')
      
      // Убедимся что бонусный аккаунт создан
      const bonusResult = await ensureBonusAccountExists(userId)
      if (bonusResult.success) {
        console.log('[Yandex Callback] Bonus account ensured, created:', bonusResult.created)
      } else {
        console.error('[Yandex Callback] Failed to ensure bonus account:', bonusResult.error)
      }
      
      // Регистрация реферала (если есть код)
      if (refCode) {
        console.log('[Yandex Callback] Processing referral code:', refCode)
        const referralResult = await registerReferral(refCode, userId)
        if (referralResult.success) {
          console.log('[Yandex Callback] Referral registered successfully')
        } else {
          console.error('[Yandex Callback] Referral registration failed:', referralResult.error)
        }
      }
    }

    // Отправляем приветственное письмо (если настроен реальный email)
    if (userInfo.default_email) {
      sendWelcomeEmail({
        to: userInfo.default_email,
        userName: fullName
      }).catch(err => {
        console.error('[Yandex Callback] Failed to send welcome email:', err)
      })
    }

    // Ждем немного, чтобы auth.users обновился
    await new Promise(resolve => setTimeout(resolve, 500))

    // Создаем сессию для нового пользователя
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: yandexEmail,
      password: deterministicPassword
    })

    if (signInError || !signInData.session) {
      console.error('[Yandex Callback] Failed to create session for new user:', signInError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=session_failed`
      )
    }

    console.log('[Yandex Callback] New user session created successfully')

    // Логируем вход
    await logUserAuth(userId).catch(e => console.error('Auth logging failed:', e))

    // Редиректим нового пользователя
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo}`)
    
    response.cookies.set('sb-access-token', signInData.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: signInData.session.expires_in || 3600
    })
    
    response.cookies.set('sb-refresh-token', signInData.session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response

  } catch (error) {
    console.error('[Yandex Callback] Unexpected error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=unexpected_error`
    )
  }
}

