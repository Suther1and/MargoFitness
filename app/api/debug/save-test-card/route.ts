/**
 * API Route: Сохранить тестовую карту (только для development)
 * POST /api/debug/save-test-card
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  // Только для development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

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

    // Использовать service role для обновления
    const supabaseAdmin = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Сохранить тестовый payment_method_id
    const testPaymentMethodId = `test_card_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        payment_method_id: testPaymentMethodId,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('[Debug] Error saving test card:', error)
      return NextResponse.json(
        { error: 'Failed to save test card' },
        { status: 500 }
      )
    }

    console.log(`[Debug] Saved test payment method ${testPaymentMethodId} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Тестовая карта сохранена',
      paymentMethodId: testPaymentMethodId
    })

  } catch (error) {
    console.error('[Debug] Error in save-test-card:', error)
    return NextResponse.json(
      { error: 'Failed to save test card' },
      { status: 500 }
    )
  }
}

