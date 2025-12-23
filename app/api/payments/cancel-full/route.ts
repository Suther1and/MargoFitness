/**
 * API Route: Полная отмена подписки
 * POST /api/payments/cancel-full
 * 
 * Отменяет подписку и сбрасывает все поля к дефолтным значениям
 * Админ может отменить подписку любого пользователя, пользователь - только свою
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получить userId из body (опционально, для админов)
    const body = await request.json().catch(() => ({}))
    const targetUserId = body.userId

    // Проверить роль текущего пользователя
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = currentProfile?.role === 'admin'

    // Определить чью подписку отменяем
    let userIdToCancel = user.id

    if (targetUserId) {
      // Если указан targetUserId, проверить что текущий пользователь - админ
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only admins can cancel other users subscriptions' },
          { status: 403 }
        )
      }
      userIdToCancel = targetUserId
    }

    // Полностью сбросить подписку к дефолтным значениям
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_tier: 'free',
        subscription_expires_at: null,
        payment_method_id: null,
        auto_renew_enabled: false,
        subscription_duration_months: 1,
        next_billing_date: null,
        failed_payment_attempts: 0,
        last_payment_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userIdToCancel)

    if (updateError) {
      console.error('Error canceling subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: targetUserId && isAdmin
        ? 'Подписка пользователя отменена администратором.'
        : 'Подписка полностью отменена. Все данные сброшены к дефолтным значениям.',
      userId: userIdToCancel
    })

  } catch (error) {
    console.error('Error in cancel-full API:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

