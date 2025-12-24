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

    // Проверяем, существует ли уже пользователь с таким Telegram ID
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('telegram_id', telegramData.id.toString())
      .single()

    let userId: string

    if (existingProfile) {
      // Пользователь уже существует - создаем сессию
      console.log('[Telegram Auth] Existing user found:', existingProfile.id)
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

    } else {
      // Новый пользователь - создаем аккаунт
      console.log('[Telegram Auth] Creating new user')
      
      // Создаем пользователя через обычный signUp (не требует admin прав)
      // Генерируем случайный пароль (пользователь его не узнает, всегда входит через Telegram)
      const randomPassword = crypto.randomBytes(32).toString('hex')
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: telegramEmail,
        password: randomPassword,
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

      // Если пользователь уже существует в auth.users (но не в profiles)
      if (authError?.message?.includes('already registered') || authError?.code === 'user_already_exists') {
        console.log('[Telegram Auth] User exists in auth.users but not in profiles, fetching user')
        
        // Ищем пользователя в auth.users через email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          console.error('[Telegram Auth] Failed to list users:', listError)
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          )
        }
        
        const existingUser = users?.find(u => u.email === telegramEmail)
        
        if (existingUser) {
          userId = existingUser.id
          console.log('[Telegram Auth] Found existing user, restoring profile:', userId)
          
          // Восстанавливаем профиль
          await supabase
            .from('profiles')
            .upsert({
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
        } else {
          console.error('[Telegram Auth] User exists but not found in list')
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          )
        }
      } else if (authError || !authData.user) {
        console.error('[Telegram Auth] Failed to create user:', authError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      } else {
        userId = authData.user.id
        console.log('[Telegram Auth] User created:', userId)

        // Создаем профиль
        const { error: profileError } = await supabase
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

        if (profileError) {
          console.error('[Telegram Auth] Failed to create profile:', profileError)
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
      }
    }

    // Создаем JWT токен для авторизации
    // Генерируем одноразовый код для обмена на сессию
    const exchangeCode = crypto.randomBytes(32).toString('hex')
    
    // Сохраняем код в базу данных с временем жизни 5 минут
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    
    // Используем таблицу для хранения одноразовых кодов
    // (эту таблицу нужно будет создать в миграции)
    await supabase
      .from('auth_exchange_codes')
      .insert({
        code: exchangeCode,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    console.log('[Telegram Auth] Success, returning exchange code')

    // Возвращаем код для обмена
    return NextResponse.json({
      success: true,
      exchangeCode,
      userId
    })

  } catch (error) {
    console.error('[Telegram Auth] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

