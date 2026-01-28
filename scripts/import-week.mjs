#!/usr/bin/env node

/**
 * Скрипт импорта тренировочной недели в Supabase
 * 
 * Использование:
 * npm run import-week -- path/to/week-5.json
 * 
 * Что делает:
 * 1. Читает JSON файл с данными недели
 * 2. Подключается к Supabase
 * 3. Создает запись в content_weeks
 * 4. Создает записи в workout_sessions
 * 5. Создает записи в exercises
 * 6. Обновляет history/weeks-tracker.json
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================
// Конфигурация
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Service key для полного доступа

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Ошибка: Не установлены переменные окружения NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
  console.error('💡 Создай файл .env.local и добавь эти переменные')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================
// Вспомогательные функции
// ============================================

function readJSONFile(filePath) {
  try {
    const fullPath = path.resolve(filePath)
    const fileContent = fs.readFileSync(fullPath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error(`❌ Ошибка чтения файла ${filePath}:`, error.message)
    process.exit(1)
  }
}

function readWeeksTracker() {
  const trackerPath = path.join(__dirname, '../docs/content-planning/history/weeks-tracker.json')
  try {
    const content = fs.readFileSync(trackerPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('❌ Ошибка чтения weeks-tracker.json:', error.message)
    process.exit(1)
  }
}

function updateWeeksTracker(weekData, tracker) {
  const trackerPath = path.join(__dirname, '../docs/content-planning/history/weeks-tracker.json')
  
  // Обновляем метаданные
  tracker.metadata.last_updated = new Date().toISOString().split('T')[0]
  tracker.metadata.total_weeks_generated += 1
  tracker.metadata.current_week = weekData.week_number
  
  // Добавляем неделю в список
  tracker.weeks_generated.push({
    week_number: weekData.week_number,
    title: weekData.week_title,
    date_generated: new Date().toISOString().split('T')[0],
    total_exercises: weekData.workouts.reduce((sum, w) => sum + w.exercises.length, 0)
  })
  
  // Обновляем историю упражнений
  weekData.workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const exerciseId = exercise.exercise_id
      
      if (!tracker.exercises_history[exerciseId]) {
        tracker.exercises_history[exerciseId] = {
          exercise_name: exercise.title,
          pattern: exerciseId.split('_')[0], // Примерно определяем паттерн из ID
          last_used_week: weekData.week_number,
          total_uses: 1,
          weeks_used: [weekData.week_number]
        }
      } else {
        tracker.exercises_history[exerciseId].last_used_week = weekData.week_number
        tracker.exercises_history[exerciseId].total_uses += 1
        tracker.exercises_history[exerciseId].weeks_used.push(weekData.week_number)
      }
    })
  })
  
  // Сохраняем обновленный трекер
  try {
    fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2), 'utf-8')
    console.log('✅ weeks-tracker.json обновлен')
  } catch (error) {
    console.error('❌ Ошибка обновления weeks-tracker.json:', error.message)
  }
}

// ============================================
// Основная функция импорта
// ============================================

async function importWeek(weekData) {
  console.log(`\n🚀 Начинаем импорт недели ${weekData.week_number}: "${weekData.week_title}"`)
  console.log('━'.repeat(60))
  
  try {
    // 1. Создаем неделю
    console.log('\n📅 Создаем запись content_weeks...')
    const { data: week, error: weekError } = await supabase
      .from('content_weeks')
      .insert({
        week_number: weekData.week_number,
        title: weekData.week_title,
        description: weekData.week_description,
        start_date: weekData.start_date,
        is_published: weekData.is_published
      })
      .select()
      .single()
    
    if (weekError) {
      console.error('❌ Ошибка создания недели:', weekError)
      throw weekError
    }
    
    console.log(`✅ Неделя создана (ID: ${week.id})`)
    
    // 2. Создаем тренировки
    console.log('\n🏋️ Создаем тренировки...')
    for (const workout of weekData.workouts) {
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          week_id: week.id,
          workout_number: workout.workout_number,
          title: workout.title,
          description: workout.description,
          duration_minutes: workout.duration_minutes,
          difficulty_level: workout.difficulty_level,
          required_tier: workout.required_tier
        })
        .select()
        .single()
      
      if (sessionError) {
        console.error(`❌ Ошибка создания тренировки ${workout.workout_number}:`, sessionError)
        throw sessionError
      }
      
      console.log(`  ✅ Тренировка ${workout.workout_number}: ${workout.title} (ID: ${session.id})`)
      
      // 3. Создаем упражнения для этой тренировки
      console.log(`     📝 Создаем ${workout.exercises.length} упражнений...`)
      for (const exercise of workout.exercises) {
        const { error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            session_id: session.id,
            exercise_order: exercise.exercise_order,
            title: exercise.title,
            description: exercise.description,
            video_url: exercise.video_url,
            thumbnail_url: exercise.thumbnail_url,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_seconds: exercise.rest_seconds,
            duration_seconds: exercise.duration_seconds,
            equipment: exercise.equipment,
            target_muscles: exercise.target_muscles,
            instructions: exercise.instructions,
            common_mistakes: exercise.common_mistakes,
            modifications: exercise.modifications,
            notes: exercise.notes
          })
        
        if (exerciseError) {
          console.error(`❌ Ошибка создания упражнения "${exercise.title}":`, exerciseError)
          throw exerciseError
        }
      }
      console.log(`     ✅ ${workout.exercises.length} упражнений добавлено`)
    }
    
    // 4. Обновляем weeks-tracker.json
    console.log('\n📊 Обновляем weeks-tracker.json...')
    const tracker = readWeeksTracker()
    updateWeeksTracker(weekData, tracker)
    
    // Итоговая статистика
    const totalExercises = weekData.workouts.reduce((sum, w) => sum + w.exercises.length, 0)
    console.log('\n' + '━'.repeat(60))
    console.log('🎉 Импорт завершен успешно!')
    console.log(`📊 Статистика:`)
    console.log(`   • Неделя: ${weekData.week_number}`)
    console.log(`   • Тренировок: ${weekData.workouts.length}`)
    console.log(`   • Упражнений: ${totalExercises}`)
    console.log(`   • Дата старта: ${weekData.start_date}`)
    console.log('━'.repeat(60) + '\n')
    
    return true
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка при импорте:', error)
    console.log('💡 Возможно, нужно откатить изменения вручную в Supabase')
    return false
  }
}

// ============================================
// Точка входа
// ============================================

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Ошибка: Не указан путь к JSON файлу')
    console.log('\n💡 Использование:')
    console.log('   npm run import-week -- path/to/week-5.json')
    console.log('\n📝 Пример:')
    console.log('   npm run import-week -- docs/content-planning/examples/week-1.json')
    process.exit(1)
  }
  
  const filePath = args[0]
  console.log(`\n📂 Читаем файл: ${filePath}`)
  
  const weekData = readJSONFile(filePath)
  
  // Валидация данных
  if (!weekData.week_number || !weekData.week_title || !weekData.workouts) {
    console.error('❌ Ошибка: Неверный формат JSON файла')
    console.log('💡 Убедись, что файл содержит: week_number, week_title, workouts')
    process.exit(1)
  }
  
  const success = await importWeek(weekData)
  process.exit(success ? 0 : 1)
}

main()
