'use server'

import { createClient } from '@/lib/supabase/server'
import {
  ContentWeek,
  WorkoutSession,
  ExerciseLibrary,
  WorkoutExercise,
  WorkoutSessionWithAccess,
  ContentWeekWithSessions,
  UserWorkoutCompletion,
} from '@/types/database'
import { getCurrentWeek, checkWorkoutAccess } from '@/lib/access-control'
import { getCurrentProfile } from './profile'

/**
 * Получить все недели контента (для админки)
 */
export async function getAllWeeks(): Promise<ContentWeek[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_weeks')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching weeks:', error)
    return []
  }

  return data || []
}

/**
 * Получить текущую неделю
 */
export async function getCurrentContentWeek(): Promise<ContentWeek | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_weeks')
    .select('*')
    .eq('is_published', true)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching current week:', error)
    return null
  }

  if (!data || data.length === 0) return null

  // Найти неделю, в которую попадает текущая дата
  const profile = await getCurrentProfile()
  return getCurrentWeek(data, profile)
}

/**
 * Получить тренировки для конкретной недели
 */
export async function getWorkoutSessionsByWeek(
  weekId: string
): Promise<WorkoutSession[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('week_id', weekId)
    .order('session_number', { ascending: true })

  if (error) {
    console.error('Error fetching workout sessions:', error)
    return []
  }

  return data || []
}

/**
 * Получить упражнения для конкретной тренировки (из новой структуры)
 */
export async function getWorkoutExercises(
  sessionId: string
): Promise<(WorkoutExercise & { exercise_library: ExerciseLibrary })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_exercises')
    .select('*, exercise_library(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching workout exercises:', error)
    return []
  }

  return data || []
}

/**
 * Получить текущую неделю с тренировками и проверкой доступа
 */
export async function getCurrentWeekWithAccess(): Promise<ContentWeekWithSessions | null> {
  const profile = await getCurrentProfile()
  const currentWeek = await getCurrentContentWeek()

  if (!currentWeek) return null

  const sessions = await getWorkoutSessionsByWeek(currentWeek.id)

  // Получить завершенные тренировки пользователя
  const completions = profile ? await getUserCompletions(profile.id) : []

  // Добавить информацию о доступе к каждой тренировке
  const sessionsWithAccess: WorkoutSessionWithAccess[] = await Promise.all(
    sessions.map(async (session: any) => {
      const access = checkWorkoutAccess(session, profile, currentWeek)
      // Используем новую функцию для получения упражнений
      const exercises = await getWorkoutExercises(session.id)
      const completion = completions.find((c) => c.workout_session_id === session.id)

      return {
        ...session,
        hasAccess: access.hasAccess,
        accessReason: access.reason,
        exercises,
        isCompleted: !!completion,
        userCompletion: completion || null,
      }
    })
  )

  // Получить демо-тренировку (статическая, не привязана к неделе)
  const supabase = await createClient()
  const { data: demoSessions, error: demoError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('is_demo', true)
    .eq('required_tier', 'free')
    .limit(1)

  if (!demoError && demoSessions && demoSessions.length > 0) {
    const demoSession = demoSessions[0]
    const exercises = await getWorkoutExercises(demoSession.id)
    const completion = completions.find((c) => c.workout_session_id === demoSession.id)
    
    sessionsWithAccess.unshift({
      ...demoSession,
      hasAccess: true,
      accessReason: 'subscription',
      exercises,
      isCompleted: !!completion,
      userCompletion: completion || null,
    } as WorkoutSessionWithAccess)
  }

  return {
    ...currentWeek,
    sessions: sessionsWithAccess,
    isCurrent: true,
  }
}

/**
 * Получить тренировку по ID с упражнениями
 */
export async function getWorkoutSessionById(
  sessionId: string
): Promise<(WorkoutSession & { exercises: (WorkoutExercise & { exercise_library: ExerciseLibrary })[] }) | null> {
  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    console.error('Error fetching workout session:', sessionError)
    return null
  }

  const exercises = await getWorkoutExercises(sessionId)

  return {
    ...session,
    exercises,
  }
}

/**
 * Получить завершенные тренировки пользователя
 */
export async function getUserCompletions(
  userId: string
): Promise<UserWorkoutCompletion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_workout_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching user completions:', error)
    return []
  }

  return data || []
}

/**
 * Отметить тренировку как завершенную
 */
export async function completeWorkout(
  sessionId: string,
  rating?: number,
  difficultyRating?: number
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()

  if (!profile) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('user_workout_completions').upsert(
    {
      user_id: profile.id,
      workout_session_id: sessionId,
      rating: rating || null,
      difficulty_rating: difficultyRating || null,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,workout_session_id',
    }
  )

  if (error) {
    console.error('Error completing workout:', error)
    return { success: false, error: error.message }
  }

  // Проверяем достижения после завершения тренировки
  try {
    const { checkAndUnlockAchievements } = await import('./achievements')
    await checkAndUnlockAchievements(profile.id)
  } catch (achError) {
    console.error('Error checking achievements after workout:', achError)
  }

  return { success: true }
}

/**
 * Обновить рейтинг завершенной тренировки
 */
export async function updateWorkoutRating(
  sessionId: string,
  rating?: number,
  difficultyRating?: number
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()

  if (!profile) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('user_workout_completions')
    .update({
      rating: rating || null,
      difficulty_rating: difficultyRating || null,
    })
    .eq('user_id', profile.id)
    .eq('workout_session_id', sessionId)

  if (error) {
    console.error('Error updating workout rating:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

