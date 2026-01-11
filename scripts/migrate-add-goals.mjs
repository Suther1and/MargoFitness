// Скрипт для быстрой миграции - добавление поля goals
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Загружаем .env.local
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrate() {
  console.log('🚀 Starting migration: Add goals column to diary_settings')
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'diary_settings' 
              AND column_name = 'goals'
          ) THEN
              ALTER TABLE public.diary_settings 
              ADD COLUMN goals JSONB DEFAULT '{}'::JSONB;
              
              RAISE NOTICE 'Column goals added to diary_settings';
          ELSE
              RAISE NOTICE 'Column goals already exists in diary_settings';
          END IF;
      END $$;
    `
  })
  
  if (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
  
  console.log('✅ Migration completed successfully!')
  console.log('📝 Result:', data)
}

migrate()
