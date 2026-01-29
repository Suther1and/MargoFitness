'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ParsedExercise {
  library_id: string
  title: string
  sets: number | null
  reps: string | null
  rest: number | null
  equipment: string | null
}

interface ParsedWorkout {
  title: string
  duration: number | null
  type: string | null
  exercises: ParsedExercise[]
}

/**
 * Парсинг Markdown текста тренировочной недели
 */
function parseMarkdown(md: string): ParsedWorkout[] {
  const workouts: ParsedWorkout[] = []
  const sections = md.split(/## Тренировка \d+:/).slice(1)

  sections.forEach((section) => {
    const lines = section.split('\n')
    const titleLine = lines[0].trim()
    const title = titleLine.split('|')[0].trim()
    
    // Извлекаем длительность
    const durationMatch = section.match(/Длительность:\*\* (\d+)/)
    const duration = durationMatch ? parseInt(durationMatch[1]) : null

    const exercises: ParsedExercise[] = []
    const exerciseSections = section.split(/### \d+\./).slice(1)

    exerciseSections.forEach((exSection) => {
      const exLines = exSection.split('\n')
      const firstLine = exLines[0].trim()
      
      // Ищем ID упражнения типа 1.1.5
      const idMatch = firstLine.match(/(\d+\.\d+\.\d+)/)
      const library_id = idMatch ? idMatch[1] : ''
      const exTitle = firstLine.replace(/^\*\*[\d\.]+\*\*\s*-\s*/, '').trim()

      // Извлекаем параметры
      const setsMatch = exSection.match(/- Подходы: (\d+)/)
      const repsMatch = exSection.match(/- Повторения: ([^\n]+)/)
      const restMatch = exSection.match(/- Отдых: (\d+)/)
      const equipMatch = exSection.match(/- Оборудование: ([^\n]+)/)

      if (library_id) {
        exercises.push({
          library_id,
          title: exTitle,
          sets: setsMatch ? parseInt(setsMatch[1]) : null,
          reps: repsMatch ? repsMatch[1].trim() : null,
          rest: restMatch ? parseInt(restMatch[1]) : null,
          equipment: equipMatch ? equipMatch[1].trim() : null
        })
      }
    })

    workouts.push({
      title,
      duration,
      type: null,
      exercises
    })
  })

  return workouts
}

/**
 * Импорт тренировок из Markdown в конкретную неделю
 */
export async function importWorkoutsFromMarkdown(weekId: string, markdown: string) {
  const supabase = await createClient()
  const parsedWorkouts = parseMarkdown(markdown)

  if (parsedWorkouts.length === 0) {
    return { success: false, error: 'Не удалось найти тренировки в тексте. Убедитесь, что заголовки начинаются с "## Тренировка X:"' }
  }

  try {
    // Сначала удаляем старые тренировки этой недели
    const { error: deleteError } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('week_id', weekId)

    if (deleteError) throw deleteError

    for (let i = 0; i < parsedWorkouts.length; i++) {
      const workout = parsedWorkouts[i]
      
      // 1. Создаем сессию (тренировку)
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          week_id: weekId,
          session_number: i + 1,
          title: workout.title,
          estimated_duration: workout.duration,
          required_tier: i === 2 ? 'pro' : 'basic' // 1 и 2 - basic, 3 - pro
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // 2. Добавляем упражнения
      const workoutExercises = workout.exercises.map((ex, index) => ({
        session_id: session.id,
        exercise_library_id: ex.library_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest,
        order_index: index,
        video_kinescope_id: null,
        video_script: null
      }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises)

      if (exercisesError) throw exercisesError
    }

    revalidatePath(`/admin/weeks/${weekId}`)
    revalidatePath('/admin/weeks')
    return { success: true, count: parsedWorkouts.length }
  } catch (error: any) {
    console.error('Import error:', error)
    return { success: false, error: error.message }
  }
}
