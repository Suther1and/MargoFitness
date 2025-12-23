/**
 * API Route: Отмена подписки
 * POST /api/payments/cancel-subscription
 * 
 * Отключает автопродление подписки
 * Доступ сохраняется до конца оплаченного периода
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Получить текущего пользователя
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получить профиль
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Проверка: должна быть активная подписка
    if (profile.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      )
    }

    // Отключить автопродление
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        auto_renew_enabled: false,
        subscription_status: 'canceled', // Помечаем как canceled
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error canceling subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    // Получить дату окончания для информации
    const expiresAt = profile.subscription_expires_at 
      ? new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU')
      : 'неизвестно'

    return NextResponse.json({
      success: true,
      message: `Подписка отменена. Доступ сохранится до ${expiresAt}`,
      expiresAt: profile.subscription_expires_at
    })

  } catch (error) {
    console.error('Error in cancel subscription API:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

