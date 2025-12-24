import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { exchangeCode } = await request.json()

    if (!exchangeCode) {
      return NextResponse.json(
        { error: 'Exchange code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Проверяем код обмена
    const { data: codeData, error: codeError } = await supabase
      .from('auth_exchange_codes')
      .select('*')
      .eq('code', exchangeCode)
      .eq('used', false)
      .single()

    if (codeError || !codeData) {
      console.error('[Telegram Exchange] Invalid or expired code')
      return NextResponse.json(
        { error: 'Invalid or expired exchange code' },
        { status: 401 }
      )
    }

    // Проверяем время истечения
    const expiresAt = new Date(codeData.expires_at)
    if (expiresAt < new Date()) {
      console.error('[Telegram Exchange] Code expired')
      return NextResponse.json(
        { error: 'Exchange code expired' },
        { status: 401 }
      )
    }

    // Помечаем код как использованный
    await supabase
      .from('auth_exchange_codes')
      .update({ used: true })
      .eq('code', exchangeCode)

    // Создаем сессию для пользователя
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `telegram_${codeData.user_id}@telegram.local`,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
      }
    })

    if (sessionError || !sessionData) {
      console.error('[Telegram Exchange] Failed to create session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    console.log('[Telegram Exchange] Session created for user:', codeData.user_id)

    return NextResponse.json({
      success: true,
      actionLink: sessionData.properties.action_link
    })

  } catch (error) {
    console.error('[Telegram Exchange] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

