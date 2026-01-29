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

export async function updateExerciseLibrary(id: string, data: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('exercise_library')
    .update(data)
    .eq('id', id)
    
  if (error) {
    console.error('Error updating exercise library:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
