import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/services/email'
import { registerReferral } from '@/lib/actions/referrals'
import { ensureBonusAccountExists } from '@/lib/actions/bonuses'

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
  ref_code?: string // Реферальный код
}

function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...dataWithoutHash } = data
  
  const dataCheckString = Object.keys(dataWithoutHash)
    .sort()
    .map(key => `${key}=${dataWithoutHash[key as keyof typeof dataWithoutHash]}`)
    .join('\n')
  
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest()
  
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')
  
  return computedHash === hash
}

export async function POST(request: Request) {
  try {
    const telegramData: TelegramAuthData = await request.json()

    console.log('[Telegram Auth] Request received:', {
      id: telegramData.id,
      username: telegramData.username,
      hasRefCode: !!telegramData.ref_code,
      refCode: telegramData.ref_code || 'NONE'
    })

    if (!telegramData.id || !telegramData.hash || !telegramData.auth_date) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 400 }
      )
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (!botToken) {
      console.error('Telegram bot token not configured')
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      )
    }

    if (!verifyTelegramAuth(telegramData, botToken)) {
      console.error('Invalid Telegram authentication hash')
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      )
    }

    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - telegramData.auth_date > 86400) {
      console.error('Telegram authentication data expired')
      return NextResponse.json(
        { error: 'Authentication data expired' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const telegramEmail = `telegram_${telegramData.id}@telegram.local`
    const fullName = [telegramData.first_name, telegramData.last_name]
      .filter(Boolean)
      .join(' ')
    const deterministicPassword = crypto
      .createHash('sha256')
      .update(`${botToken}:${telegramData.id}`)
      .digest('hex')

    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, telegram_id')
      .eq('telegram_id', telegramData.id.toString())
      .single()

    let userId: string
    let isNewUser = false

    if (existingProfile) {
      userId = existingProfile.id
      
      // Убедимся что бонусный аккаунт существует
      await ensureBonusAccountExists(userId)
      
      await supabase
        .from('profiles')
        .update({
          full_name: fullName || existingProfile.email?.split('@')[0],
          telegram_username: telegramData.username || null,
        })
        .eq('id', userId)

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: telegramEmail,
        password: deterministicPassword
      })

      if (signInError || !signInData.session) {
        console.error('Telegram auth sign in failed:', signInError?.message)
        return NextResponse.json(
          { error: 'Не удалось войти в систему' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        isNewUser: false,
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at
        },
        user: signInData.user
      })
    }

    const { data: existingAuthData, error: existingAuthError } = await supabase.auth.signInWithPassword({
      email: telegramEmail,
      password: deterministicPassword
    })

    if (existingAuthData?.user && existingAuthData?.session) {
      userId = existingAuthData.user.id

      // Убедимся что бонусный аккаунт существует
      await ensureBonusAccountExists(userId)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_id: telegramData.id.toString(),
          telegram_username: telegramData.username || null,
          full_name: fullName || null,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update profile with telegram_id:', updateError)
      }

      return NextResponse.json({
        success: true,
        isNewUser: false,
        session: {
          access_token: existingAuthData.session.access_token,
          refresh_token: existingAuthData.session.refresh_token,
          expires_at: existingAuthData.session.expires_at
        },
        user: existingAuthData.user
      })
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: telegramEmail,
      password: deterministicPassword,
      options: {
        data: {
          full_name: fullName,
          telegram_id: telegramData.id.toString(),
          telegram_username: telegramData.username,
          provider: 'telegram'
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      }
    })

    if (authError || !authData.user) {
      console.error('Failed to create Telegram user:', authError)
      return NextResponse.json(
        { error: 'Не удалось создать аккаунт пользователя' },
        { status: 500 }
      )
    }

    userId = authData.user.id

    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: telegramEmail,
        full_name: fullName,
        telegram_id: telegramData.id.toString(),
        telegram_username: telegramData.username || null,
        role: 'user',
        subscription_status: 'inactive',
        subscription_tier: 'free'
      })

    if (createProfileError) {
      console.error('Failed to create Telegram profile:', createProfileError)
      // Продолжаем - профиль может создаться через триггер
    }
    
    // Даем время триггеру создать бонусный аккаунт
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('[Telegram Auth] Ensuring bonus account for new user')
    
    // Убедимся что бонусный аккаунт создан
    const bonusResult = await ensureBonusAccountExists(userId)
    if (bonusResult.success) {
      console.log('[Telegram Auth] Bonus account ensured, created:', bonusResult.created)
    } else {
      console.error('[Telegram Auth] Failed to ensure bonus account:', bonusResult.error)
    }
    
    // Регистрация реферала (если есть код)
    if (telegramData.ref_code) {
      console.log('[Telegram Auth] Processing referral code:', telegramData.ref_code)
      const referralResult = await registerReferral(telegramData.ref_code, userId)
      if (referralResult.success) {
        console.log('[Telegram Auth] Referral registered successfully')
      } else {
        console.error('[Telegram Auth] Referral registration failed:', referralResult.error)
      }
    }

    if (fullName) {
      sendWelcomeEmail({
        to: telegramEmail,
        userName: fullName
      }).catch(err => {
        console.error('Failed to send welcome email:', err)
      })
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: telegramEmail,
      password: deterministicPassword
    })

    if (signInError || !signInData.session) {
      console.error('Failed to create session for new Telegram user:', signInError)
      return NextResponse.json(
        { error: 'Не удалось создать сессию' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isNewUser: true,
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at: signInData.session.expires_at
      },
      user: signInData.user
    })

  } catch (error) {
    console.error('Telegram auth unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

