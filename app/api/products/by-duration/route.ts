/**
 * API Route: Получить продукты по длительности
 * GET /api/products/by-duration?duration=1
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionsByDuration } from '@/lib/actions/products'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const duration = parseInt(searchParams.get('duration') || '1')

    if (![1, 3, 6, 12].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 1, 3, 6, or 12 months' },
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

