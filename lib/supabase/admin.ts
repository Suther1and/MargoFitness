import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Service role клиент — обходит RLS, использовать ТОЛЬКО в server actions и server components
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4enJlbndra250bmhtZGltaGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0NjI5MywiZXhwIjoyMDgyMDIyMjkzfQ.bqBsOHpVm4GKNlKHTftS3dB1T4eoRGAS2I7Oih5ilXo'

  if (!url || !key) {
    throw new Error('Supabase URL and Service Role Key are required for createAdminClient')
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
