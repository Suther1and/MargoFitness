'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { revalidatePath } from 'next/cache'
import type { 
  ContentWeekInsert, 
  ContentWeekUpdate, 
  WorkoutSessionInsert,
  WorkoutSessionUpdate,
  ExerciseInsert,
  ExerciseUpdate
} from '@/types/database'

/**
 * Проверка прав администратора
 */
async function checkAdmin() {
  const profile = await getCurrentProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Доступ запрещён')
  }
  
  return profile
}

// ============================================
// НЕДЕЛИ КОНТЕНТА
// ============================================

/**
 * Создать новую неделю
 */
export async function createWeek(data: {
  start_date: string
  end_date: string
  title: string
  description?: string
  is_published?: boolean
}): Promise<{ success: boolean; error?: string; weekId?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { data: week, error } = await supabase
      .from('content_weeks')
      .insert({
        start_date: data.start_date,
        end_date: data.end_date,
        title: data.title,
        description: data.description || null,
        is_published: data.is_published || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating week:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true, weekId: week.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Обновить неделю
 */
export async function updateWeek(
  weekId: string,
  data: ContentWeekUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('content_weeks')
      .update(data)
      .eq('id', weekId)

    if (error) {
      console.error('Error updating week:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Удалить неделю
 */
export async function deleteWeek(weekId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('content_weeks')
      .delete()
      .eq('id', weekId)

    if (error) {
      console.error('Error deleting week:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// ТРЕНИРОВКИ
// ============================================

/**
 * Создать тренировку
 */
export async function createWorkoutSession(data: {
  week_id: string
  session_number: number
  required_tier: 'free' | 'basic' | 'pro' | 'elite'
  title: string
  description?: string
  estimated_duration?: number
}): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        week_id: data.week_id,
        session_number: data.session_number,
        required_tier: data.required_tier,
        title: data.title,
        description: data.description || null,
        estimated_duration: data.estimated_duration || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true, sessionId: session.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Обновить тренировку
 */
export async function updateWorkoutSession(
  sessionId: string,
  data: WorkoutSessionUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('workout_sessions')
      .update(data)
      .eq('id', sessionId)

    if (error) {
      console.error('Error updating session:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Удалить тренировку
 */
export async function deleteWorkoutSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Error deleting session:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// УПРАЖНЕНИЯ
// ============================================

/**
 * Создать упражнение
 */
export async function createExercise(data: {
  workout_session_id: string
  order_index: number
  title: string
  description: string
  video_kinescope_id: string
  sets?: number
  reps?: string
  rest_seconds?: number
}): Promise<{ success: boolean; error?: string; exerciseId?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert({
        workout_session_id: data.workout_session_id,
        order_index: data.order_index,
        title: data.title,
        description: data.description,
        video_kinescope_id: data.video_kinescope_id,
        sets: data.sets || null,
        reps: data.reps || null,
        rest_seconds: data.rest_seconds || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating exercise:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true, exerciseId: exercise.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Обновить упражнение
 */
export async function updateExercise(
  exerciseId: string,
  data: ExerciseUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('exercises')
      .update(data)
      .eq('id', exerciseId)

    if (error) {
      console.error('Error updating exercise:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Удалить упражнение
 */
export async function deleteExercise(exerciseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) {
      console.error('Error deleting exercise:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/workouts')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

