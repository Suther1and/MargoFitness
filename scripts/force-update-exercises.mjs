import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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
const supabase = createClient(supabaseUrl, supabaseKey)

async function importExercises() {
  const filePath = path.resolve(process.cwd(), 'docs/content-planning/EXERCISE_LIBRARY.md')
  const content = fs.readFileSync(filePath, 'utf8')

  const exercises = []
  const sections = content.split(/^## /m).slice(1)

  sections.forEach(section => {
    const patternBlocks = section.split(/^### ПАТТЕРН/m).slice(1)
    
    patternBlocks.forEach(patternBlock => {
      const exerciseBlocks = patternBlock.split(/^#### /m).slice(1)
      
      exerciseBlocks.forEach(block => {
        const titleLine = block.split('\n')[0].trim()
        const idMatch = titleLine.match(/^(\d+\.\d+\.\d+)/)
        if (!idMatch) return
        const id = idMatch[1]

        // ПАРСИНГ ИНВЕНТАРЯ (Более агрессивный)
        // 1. Ищем явные блоки **Инвентарь:** или **Оборудование:**
        let inventory = null
        let inventory_alternative = null
        
        const invMatch = block.match(/\*\*(?:Инвентарь|Оборудование|Инвентаря):\*\*\s*\n?([^#\*\n]+)/i)
        if (invMatch) inventory = invMatch[1].trim()

        const altMatch = block.match(/\*\*Альтернатива (?:инвентаря|инвентарю):\*\*\s*\n?([^#\*\n]+)/i)
        if (altMatch) inventory_alternative = altMatch[1].trim()

        // 2. Ищем облегченную версию
        const lightMatch = block.match(/\*\*(?:Облегченный вариант|Облегченная версия):\*\*\s*\n?([^#\*\n]+)/i)
        const light_version = lightMatch ? lightMatch[1].trim() : null

        exercises.push({ id, inventory, inventory_alternative, light_version })
      })
    })
  })

  console.log(`Parsed ${exercises.length} exercises. Updating Supabase...`)

  for (const ex of exercises) {
    const { error } = await supabase
      .from('exercise_library')
      .update({
        inventory: ex.inventory,
        inventory_alternative: ex.inventory_alternative,
        light_version: ex.light_version
      })
      .eq('id', ex.id)
    
    if (error) console.error(`Error ${ex.id}:`, error)
  }

  console.log('Done!')
}

importExercises()
