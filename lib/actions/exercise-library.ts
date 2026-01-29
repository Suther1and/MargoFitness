'use server'

import { createClient } from '@/lib/supabase/server'

export async function getExerciseLibrary() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .order('id', { ascending: true })
    
  if (error) {
    console.error('Error fetching exercise library:', error)
    return []
  }
  
  return data
}
