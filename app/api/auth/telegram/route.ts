import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/services/email'

// Интерфейс данных от Telegram
interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Функция проверки подлинности данных от Telegram
function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...dataWithoutHash } = data
  
  // Создаем строку проверки
  const dataCheckString = Object.keys(dataWithoutHash)
    .sort()
    .map(key => `${key}=${dataWithoutHash[key as keyof typeof dataWithoutHash]}`)
    .join('\n')
  
  // Вычисляем secret key
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest()
  
  // Вычисляем hash
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')
  
  // Сравниваем hash
  return computedHash === hash
}

export async function POST(request: Request) {
  try {
    const telegramData: TelegramAuthData = await request.json()
    
    console.log('[Telegram Auth] Received data:', { 
      id: telegramData.id, 
      username: telegramData.username 
    })

    // Проверяем наличие необходимых данных
    if (!telegramData.id || !telegramData.hash || !telegramData.auth_date) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 400 }
      )
    }

    // Получаем bot token из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (!botToken) {
      console.error('[Telegram Auth] Bot token not configured')
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      )
    }

    // Проверяем подлинность данных
    if (!verifyTelegramAuth(telegramData, botToken)) {
      console.error('[Telegram Auth] Invalid hash')
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      )
    }

    // Проверяем время авторизации (не старше 24 часов)
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - telegramData.auth_date > 86400) {
      console.error('[Telegram Auth] Auth data too old')
      return NextResponse.json(
        { error: 'Authentication data expired' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Формируем email на основе Telegram ID
    // Используем формат: telegram_{id}@telegram.local
    const telegramEmail = `telegram_${telegramData.id}@telegram.local`
    
    // Формируем полное имя
    const fullName = [telegramData.first_name, telegramData.last_name]
      .filter(Boolean)
      .join(' ')
    
    // Создаем детерминированный пароль на основе bot token и telegram id
    // Это позволит нам всегда входить с одним и тем же паролем
    const deterministicPassword = crypto
      .createHash('sha256')
      .update(`${botToken}:${telegramData.id}`)
      .digest('hex')

    // ============================================
    // ШАГ 1: Проверяем существование по telegram_id
    // ============================================
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, telegram_id')
      .eq('telegram_id', telegramData.id.toString())
      .single()

    console.log('[Telegram Auth] Profile lookup by telegram_id:', { 
      found: !!existingProfile, 
      error: profileError?.message,
      telegram_id: telegramData.id.toString()
    })

    let userId: string
    let isNewUser = false

    if (existingProfile) {
      // ============================================
      // СЛУЧАЙ 1: Пользователь найден по telegram_id
      // ============================================
      console.log('[Telegram Auth] Existing user found by telegram_id:', { 
        id: existingProfile.id, 
        email: existingProfile.email,
        telegram_id: existingProfile.telegram_id
      })
      userId = existingProfile.id
      
      // Обновляем данные профиля
      await supabase
        .from('profiles')
        .update({
          full_name: fullName || existingProfile.email?.split('@')[0],
          avatar_url: telegramData.photo_url || null,
          telegram_username: telegramData.username || null,
        })
        .eq('id', userId)

      // Входим с детерминированным паролем
      console.log('[Telegram Auth] Attempting signIn with:', { 
        email: telegramEmail
      })
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: telegramEmail,
        password: deterministicPassword
      })

      if (signInError || !signInData.session) {
        console.error('[Telegram Auth] Failed to sign in:', { 
          error: signInError?.message,
          code: signInError?.status
        })
        return NextResponse.json(
          { error: 'Не удалось войти в систему' },
          { status: 500 }
        )
      }

      console.log('[Telegram Auth] Existing user signed in successfully')

      // Возвращаем токены сессии
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

    // ============================================
    // ШАГ 2: Проверяем существование в auth.users по email
    // ============================================
    console.log('[Telegram Auth] User not found by telegram_id, checking auth.users by email')
    
    // Пытаемся войти - если пользователь существует, вход будет успешным
    const { data: existingAuthData, error: existingAuthError } = await supabase.auth.signInWithPassword({
      email: telegramEmail,
      password: deterministicPassword
    })

    if (existingAuthData?.user && existingAuthData?.session) {
      // ============================================
      // СЛУЧАЙ 2: Пользователь существует в auth.users, но telegram_id не заполнен
      // ============================================
      console.log('[Telegram Auth] User found in auth.users without telegram_id:', {
        id: existingAuthData.user.id,
        email: telegramEmail
      })
      
      userId = existingAuthData.user.id

      // Обновляем профиль, добавляя telegram_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_id: telegramData.id.toString(),
          telegram_username: telegramData.username || null,
          full_name: fullName || null,
          avatar_url: telegramData.photo_url || null,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('[Telegram Auth] Failed to update profile with telegram_id:', updateError)
      } else {
        console.log('[Telegram Auth] Profile updated with telegram_id')
      }

      // Возвращаем существующую сессию
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

    // ============================================
    // СЛУЧАЙ 3: Новый пользователь - создаем аккаунт
    // ============================================
    console.log('[Telegram Auth] New user, creating account')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: telegramEmail,
      password: deterministicPassword,
      options: {
        data: {
          full_name: fullName,
          avatar_url: telegramData.photo_url,
          telegram_id: telegramData.id.toString(),
          telegram_username: telegramData.username,
          provider: 'telegram'
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      }
    })

    if (authError || !authData.user) {
      console.error('[Telegram Auth] Failed to create user:', authError)
      return NextResponse.json(
        { error: 'Не удалось создать аккаунт пользователя' },
        { status: 500 }
      )
    }

    userId = authData.user.id
    console.log('[Telegram Auth] User created:', userId)

    // Создаем профиль
    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: telegramEmail,
        full_name: fullName,
        avatar_url: telegramData.photo_url || null,
        telegram_id: telegramData.id.toString(),
        telegram_username: telegramData.username || null,
        role: 'user',
        subscription_status: 'inactive',
        subscription_tier: 'free'
      })

    if (createProfileError) {
      console.error('[Telegram Auth] Failed to create profile:', createProfileError)
      // Продолжаем выполнение, профиль может создаться через trigger
    }

    // Отправляем приветственное письмо (если настроен email)
    if (fullName) {
      sendWelcomeEmail({
        to: telegramEmail,
        userName: fullName
      }).catch(err => {
        console.error('[Telegram Auth] Failed to send welcome email:', err)
      })
    }

    // Ждем немного, чтобы auth.users обновился
    await new Promise(resolve => setTimeout(resolve, 500))

    // Создаем сессию для нового пользователя
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: telegramEmail,
      password: deterministicPassword
    })

    if (signInError || !signInData.session) {
      console.error('[Telegram Auth] Failed to create session for new user:', signInError)
      return NextResponse.json(
        { error: 'Не удалось создать сессию' },
        { status: 500 }
      )
    }

    console.log('[Telegram Auth] New user session created successfully')

    // Возвращаем токены сессии + флаг что это новый пользователь
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
    console.error('[Telegram Auth] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

