/**
 * Cron Job: Автоматическое продление подписок
 * GET /api/cron/renew-subscriptions
 * 
 * Запускается ежедневно для проверки и продления подписок
 * Для настройки в Vercel Cron Jobs или другом планировщике
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { autoRenewSubscription } from '@/lib/services/subscription-manager'

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации cron job
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // В production проверяем секрет
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Создать service role клиент (обходит RLS)
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Получить все подписки, которые нужно продлить сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, payment_method_id, next_billing_date, failed_payment_attempts')
      .eq('subscription_status', 'active')
      .eq('auto_renew_enabled', true)
      .not('payment_method_id', 'is', null)
      .gte('next_billing_date', today.toISOString())
      .lt('next_billing_date', tomorrow.toISOString())

    if (error) {
      console.error('Error fetching profiles for renewal:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions to renew today',
        processed: 0
      })
    }

    // Обработать каждую подписку
    const results = {
      success: [] as string[],
      failed: [] as string[],
      errors: [] as string[]
    }

    for (const profile of profiles) {
      try {
        console.log(`[Cron] Processing renewal for user ${profile.email}`)
        
        const result = await autoRenewSubscription(profile.id)
        
        if (result.success) {
          results.success.push(profile.email)
          console.log(`[Cron] ✓ Renewed subscription for ${profile.email}`)
        } else {
          results.failed.push(profile.email)
          results.errors.push(`${profile.email}: ${result.error}`)
          console.error(`[Cron] ✗ Failed to renew for ${profile.email}:`, result.error)
        }
      } catch (error: any) {
        results.failed.push(profile.email)
        results.errors.push(`${profile.email}: ${error.message}`)
        console.error(`[Cron] ✗ Exception for ${profile.email}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${profiles.length} subscriptions`,
      stats: {
        total: profiles.length,
        successful: results.success.length,
        failed: results.failed.length
      },
      details: {
        successful: results.success,
        failed: results.failed,
        errors: results.errors
      }
    })

  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

