/**
 * Debug route для проверки продуктов
 * GET /api/debug/products
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Получить все продукты
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('id, name, type, tier_level, duration_months, price, discount_percentage, is_active')
    .order('tier_level', { ascending: true })
  
  // Получить продукты с duration_months
  const { data: durationProducts, error: durationError } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .not('duration_months', 'is', null)
  
  // Получить старые продукты (без duration_months)
  const { data: oldProducts, error: oldError } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .is('duration_months', null)
  
  return NextResponse.json({
    total: allProducts?.length || 0,
    withDuration: durationProducts?.length || 0,
    withoutDuration: oldProducts?.length || 0,
    allProducts: allProducts || [],
    durationProducts: durationProducts || [],
    oldProducts: oldProducts || [],
    errors: {
      all: allError?.message,
      duration: durationError?.message,
      old: oldError?.message
    }
  })
}

