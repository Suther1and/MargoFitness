import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/services/email'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { BONUS_CONSTANTS } from '@/types/database'

// Admin client для backend операций
const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.error('[Telegram Auth] SUPABASE_SERVICE_ROLE_KEY not found!')
    return null
  }
  
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

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
    
    // Даем время триггеру создать бонусный аккаунт и реферальный код (увеличено)
    console.log('[Telegram Auth] Waiting for DB triggers...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('[Telegram Auth] Starting referral processing')
    
    const supabaseAdmin = getAdminClient()
    
    if (!supabaseAdmin) {
      console.error('[Telegram Auth] Cannot process referral - SERVICE_ROLE_KEY missing')
      // Триггер должен создать бонусный аккаунт, но реферал не обработается
    } else {
      console.log('[Telegram Auth] Processing new user setup with admin client')
      
      // Проверяем бонусный аккаунт через admin client
      const { data: bonusAccount } = await supabaseAdmin
        .from('user_bonuses')
        .select('id, balance')
        .eq('user_id', userId)
        .single()

      if (!bonusAccount) {
        console.log('[Telegram Auth] Creating bonus account manually')
        const refCodeGen = Math.random().toString(36).substring(2, 10).toUpperCase()
        
        await supabaseAdmin.from('user_bonuses').insert({
          user_id: userId,
          balance: 250,
        })

        await supabaseAdmin.from('referral_codes').insert({
          user_id: userId,
          code: refCodeGen,
        })

        await supabaseAdmin.from('bonus_transactions').insert({
          user_id: userId,
          amount: 250,
          type: 'welcome',
          description: 'Приветственный бонус',
        })
      }
      
      // Регистрация реферала через admin client
      if (telegramData.ref_code) {
        console.log('[Telegram Auth] Processing referral code:', telegramData.ref_code)
        
        const { data: refCodeData } = await supabaseAdmin
          .from('referral_codes')
          .select('user_id')
          .eq('code', telegramData.ref_code)
          .single()

        if (refCodeData && refCodeData.user_id !== userId) {
          const { data: existing } = await supabaseAdmin
            .from('referrals')
            .select('id')
            .eq('referred_id', userId)
            .single()

          if (!existing) {
            await supabaseAdmin.from('referrals').insert({
              referrer_id: refCodeData.user_id,
              referred_id: userId,
              status: 'registered',
            })

            await supabaseAdmin.from('bonus_transactions').insert({
              user_id: userId,
              amount: BONUS_CONSTANTS.REFERRED_USER_BONUS,
              type: 'referral_bonus',
              description: 'Бонус за регистрацию по приглашению',
              related_user_id: refCodeData.user_id,
            })

            const { data: currentBalance } = await supabaseAdmin
              .from('user_bonuses')
              .select('balance')
              .eq('user_id', userId)
              .single()

            if (currentBalance) {
              await supabaseAdmin
                .from('user_bonuses')
                .update({ balance: currentBalance.balance + BONUS_CONSTANTS.REFERRED_USER_BONUS })
                .eq('user_id', userId)
            }

            console.log('[Telegram Auth] Referral processed successfully')
          }
        }
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

