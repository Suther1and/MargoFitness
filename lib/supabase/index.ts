// Экспорты для удобства
// Используйте прямые импорты для лучшей производительности:
// import { createClient } from "@/lib/supabase/client"
// import { createClient } from "@/lib/supabase/server"

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'

