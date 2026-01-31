'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { getCurrentWeek, checkWorkoutAccess } from '@/lib/access-control'
import { getWorkoutSessionsByWeek, getWorkoutExercises, getUserCompletions } from './content'
import type { ContentWeekWithSessions, WorkoutSessionWithAccess } from '@/types/database'

/**
 * Получить данные для вкладки тренировок в Dashboard
 */
export async function getDashboardWorkouts(): Promise<{
  success: boolean
  data: ContentWeekWithSessions | null
  error?: string
}> {
  try {
    const profile = await getCurrentProfile()
    const supabase = await createClient()

    // 1. Получаем все опубликованные недели, отсортированные по дате
    const { data: weeks, error: weeksError } = await supabase
      .from('content_weeks')
      .select('*')
      .eq('is_published', true)
      .order('start_date', { ascending: false })

    if (weeksError) throw weeksError
    if (!weeks || weeks.length === 0) {
      return { success: true, data: null }
    }

    // 2. Определяем текущую неделю (логика из access-control)
    // ВАЖНО: Если getCurrentWeek не находит неделю по дате, берем самую свежую опубликованную
    let currentWeek = getCurrentWeek(weeks, profile)
    
    if (!currentWeek && weeks.length > 0) {
      currentWeek = weeks[0]
    }

    if (!currentWeek) {
      return { success: true, data: null }
    }

    // 3. Получаем сессии для этой недели
    const sessions = await getWorkoutSessionsByWeek(currentWeek.id)

    // 4. Получаем завершенные тренировки
    const completions = profile ? await getUserCompletions(profile.id) : []

    // 5. Формируем список сессий с правами доступа
    // Оптимизация: запрашиваем все упражнения для всех сессий одним запросом
    const sessionIds = sessions.map(s => s.id)
    let allExercises: any[] = []
    
    if (sessionIds.length > 0) {
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select('*, exercise_library(*)')
        .in('session_id', sessionIds)
        .order('order_index', { ascending: true })

      if (exercisesError) {
        console.error('Error fetching exercises for dashboard:', exercisesError)
      } else {
        allExercises = (exercisesData as any[]) || []
      }
    }

    const sessionsWithAccess: WorkoutSessionWithAccess[] = sessions.map((session) => {
      const access = checkWorkoutAccess(session, profile, currentWeek)
      const exercises = allExercises.filter(ex => ex.session_id === session.id)
      const completion = completions.find((c) => c.workout_session_id === session.id)

      return {
        ...session,
        hasAccess: access.hasAccess,
        accessReason: access.reason as any,
        exercises,
        isCompleted: !!completion,
        userCompletion: completion || null,
      }
    })

    return {
      success: true,
      data: {
        ...currentWeek,
        sessions: sessionsWithAccess,
        isCurrent: true,
      }
    }
  } catch (error: any) {
    console.error('Error in getDashboardWorkouts:', error)
    return { success: false, data: null, error: error.message }
  }
}
