/**
 * API Route: Переключение автопродления
 * POST /api/payments/toggle-auto-renew
 * 
 * Включает или отключает автоматическое продление подписки
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

    // Получить параметры
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Parameter "enabled" must be boolean' },
        { status: 400 }
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

    // Проверка: должна быть активная подписка или canceled (можно включить обратно)
    if (profile.subscription_status !== 'active' && profile.subscription_status !== 'canceled') {
      return NextResponse.json(
        { error: 'No valid subscription' },
        { status: 400 }
      )
    }

    // Если включаем - должна быть привязанная карта
    if (enabled && !profile.payment_method_id) {
      return NextResponse.json(
        { error: 'No payment method saved. Please make a payment first to enable auto-renewal.' },
        { status: 400 }
      )
    }

    // Обновить статус
    const updates: any = {
      auto_renew_enabled: enabled,
      updated_at: new Date().toISOString()
    }

    // Примечание: Отключение автопродления НЕ меняет статус подписки
    // Подписка остается active до subscription_expires_at
    // Статус 'canceled' используется только при явной отмене с возвратом средств

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error toggling auto-renew:', updateError)
      return NextResponse.json(
        { error: 'Failed to update auto-renewal setting' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      autoRenewEnabled: enabled,
      message: enabled 
        ? 'Автопродление включено. Подписка будет автоматически продлеваться.'
        : 'Автопродление отключено. Подписка завершится в конце периода.'
    })

  } catch (error) {
    console.error('Error in toggle auto-renew API:', error)
    return NextResponse.json(
      { error: 'Failed to toggle auto-renewal' },
      { status: 500 }
    )
  }
}

