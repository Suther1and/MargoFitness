import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Загрузка .env.local вручную
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importExercises() {
  const filePath = path.resolve(process.cwd(), 'docs/content-planning/EXERCISE_LIBRARY.md')
  const content = fs.readFileSync(filePath, 'utf8')

  const exercises = []
  // Разделяем по заголовкам разделов (## РАЗДЕЛ)
  const sections = content.split(/^## /m).slice(1)

  sections.forEach(section => {
    const lines = section.split('\n')
    const sectionTitle = lines[0].trim()
    if (sectionTitle.includes('📖 Как использовать')) return

    // Внутри раздела ищем упражнения (#### 1.1.1)
    const exerciseBlocks = section.split(/^#### /m).slice(1)
    
    exerciseBlocks.forEach(block => {
      const blockLines = block.split('\n')
      const titleLine = blockLines[0].trim()
      
      // Парсим ID и название: "1.1.1 Классические приседания"
      const idMatch = titleLine.match(/^(\d+\.\d+\.\d+)\s+(.+)$/)
      if (!idMatch) return

      const id = idMatch[1]
      const name = idMatch[2]

      // Извлекаем описание
      const descMatch = block.match(/\*\*Описание:\*\*\s*\n?([\s\S]*?)(?=\n\*\*|$)/)
      const description = descMatch ? descMatch[1].trim() : ''

      // Извлекаем параметры
      const setsMatch = block.match(/\*\*Подходы:\*\*\s*(\d+)/)
      const repsMatch = block.match(/\*\*Повторения:\*\*\s*([^\n]+)/)
      const restMatch = block.match(/\*\*Отдых:\*\*\s*(\d+)/)
      
      // Новые поля
      const inventoryMatch = block.match(/\*\*Инвентарь:\*\*\s*([^\n]+)/)
      const inventoryAltMatch = block.match(/\*\*Альтернатива инвентарю:\*\*\s*([^\n]+)/)
      const lightVersionMatch = block.match(/\*\*Облегченный вариант:\*\*\s*([^\n]+)/)

      // Извлекаем технику
      const techniqueMatch = block.match(/\*\*Техника выполнения:\*\*\s*\n?([\s\S]*?)(?=\n\*\*|$)/)
      const technique = techniqueMatch ? techniqueMatch[1].trim() : ''

      // Извлекаем ошибки
      const mistakesMatch = block.match(/\*\*Типичные ошибки:\*\*\s*\n?([\s\S]*?)(?=\n\*\*|$)/)
      const mistakes = mistakesMatch ? mistakesMatch[1].trim() : ''

      // Извлекаем сценарий
      const scriptMatch = block.match(/\*\*Видео-сценарий:\*\*\s*\n?([\s\S]*?)(?=\n---|(?:\n\*\*|$))/ )
      const script = scriptMatch ? scriptMatch[1].trim() : ''

      exercises.push({
        id,
        name,
        description,
        category: sectionTitle.replace(/^🏋️\s*РАЗДЕЛ\s*\d+:\s*/, ''),
        default_sets: setsMatch ? parseInt(setsMatch[1]) : 3,
        default_reps: repsMatch ? repsMatch[1].trim() : '12-15',
        default_rest_seconds: restMatch ? parseInt(restMatch[1]) : 60,
        technique_steps: technique,
        typical_mistakes: mistakes,
        video_script: script,
        inventory: inventoryMatch ? inventoryMatch[1].trim() : null,
        inventory_alternative: inventoryAltMatch ? inventoryAltMatch[1].trim() : null,
        light_version: lightVersionMatch ? lightVersionMatch[1].trim() : null
      })
    })
  })

  console.log(`Parsed ${exercises.length} exercises. Starting import...`)

  if (exercises.length === 0) {
    console.log('No exercises found. Check parsing logic.')
    return
  }

  // Пакетная вставка (по 20 штук)
  const batchSize = 20
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize)
    const { error } = await supabase
      .from('exercise_library')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Error importing batch ${i / batchSize + 1}:`, error)
    } else {
      console.log(`Imported batch ${i / batchSize + 1}/${Math.ceil(exercises.length / batchSize)}`)
    }
  }

  console.log('Import finished!')
}

importExercises()
