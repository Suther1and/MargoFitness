import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Клиентский Supabase клиент (для использования в "use client" компонентах)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

