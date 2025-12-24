/**
 * API Route: Получить продукты по длительности
 * GET /api/products/by-duration?duration=1
 * GET /api/products/by-duration?duration=all (все продукты)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionsByDuration } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const durationParam = searchParams.get('duration') || '1'

    // Если запрашивают все продукты
    if (durationParam === 'all') {
      const supabase = await createClient()
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'subscription_tier')
        .eq('is_active', true)
        .order('tier_level', { ascending: true })
        .order('duration_months', { ascending: true })

      if (error) {
        throw error
      }

      return NextResponse.json(products || [])
    }

    // Иначе по конкретной длительности
    const duration = parseInt(durationParam)

    if (![1, 3, 6, 12].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 1, 3, 6, 12, or "all"' },
        { status: 400 }
      )
    }

    const products = await getSubscriptionsByDuration(duration)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error in products/by-duration API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

