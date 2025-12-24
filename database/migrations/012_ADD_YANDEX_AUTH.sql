-- ============================================
-- Migration 012: Add Yandex ID OAuth Support
-- ============================================
-- Description: Adds yandex_id column to profiles table for Yandex OAuth authentication
-- Date: 2025-12-24
-- ============================================

-- Add yandex_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS yandex_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_yandex_id 
ON profiles(yandex_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.yandex_id IS 'Unique Yandex ID for OAuth authentication';

-- ============================================
-- Verification
-- ============================================
-- Check that column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'yandex_id';

-- Check index:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'profiles' AND indexname = 'idx_profiles_yandex_id';

