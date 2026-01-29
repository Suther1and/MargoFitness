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

async function fillInventory() {
  console.log('Starting manual inventory filling...')

  const inventoryMap = [
    { pattern: '1.1.1', inv: 'Без оборудования', alt: 'Стул для баланса' },
    { pattern: '1.1.2', inv: 'Гантели 2-5 кг', alt: 'Бутылки с водой' },
    { pattern: '1.1.3', inv: 'Гантель 3-7 кг', alt: 'Бутылка 5л' },
    { pattern: '1.1.4', inv: 'Без оборудования', alt: null },
    { pattern: '1.1.5', inv: 'Без оборудования', alt: null },
    { pattern: '1.1.6', inv: 'Без оборудования', alt: null },
    { pattern: '1.1.7', inv: 'Без оборудования', alt: null },
    { pattern: '1.2.1', inv: 'Без оборудования', alt: 'Стул для баланса' },
    { pattern: '1.2.2', inv: 'Без оборудования', alt: null },
    { pattern: '1.2.3', inv: 'Гантели 2-4 кг', alt: 'Бутылки с водой' },
    { pattern: '1.2.4', inv: 'Без оборудования', alt: null },
    { pattern: '1.2.5', inv: 'Стул / Диван', alt: 'Любая возвышенность' },
    { pattern: '1.2.6', inv: 'Без оборудования', alt: null },
    { pattern: '1.2.7', inv: 'Без оборудования', alt: null },
    { pattern: '1.3.1', inv: 'Гантели 3-7 кг', alt: 'Бутылки с водой' },
    { pattern: '1.3.2', inv: 'Бодибар 5-10 кг', alt: 'Швабра с утяжелением' },
    { pattern: '1.3.3', inv: 'Гантель 2-4 кг', alt: 'Бутылка с водой' },
    { pattern: '1.3.4', inv: 'Гантели 3-6 кг', alt: 'Бутылки с водой' },
    { pattern: '1.4.1', inv: 'Коврик', alt: null },
    { pattern: '1.4.2', inv: 'Коврик + Гантель 3-5 кг', alt: 'Бутылка 5л' },
    { pattern: '1.4.3', inv: 'Коврик', alt: null },
    { pattern: '1.4.4', inv: 'Коврик + Фитнес-резинка', alt: 'Полотенце' },
    { pattern: '1.4.5', inv: 'Коврик + Стул', alt: null },
    { pattern: '2.1.', inv: 'Коврик', alt: null },
    { pattern: '2.2.1', inv: 'Гантели 2-4 кг', alt: 'Бутылки с водой' },
    { pattern: '2.2.2', inv: 'Гантели 2-4 кг', alt: 'Бутылки с водой' },
    { pattern: '2.2.3', inv: 'Гантели 2-5 кг', alt: 'Бутылки с водой' },
    { pattern: '3.1.1', inv: 'Гантели 3-5 кг', alt: 'Бутылки с водой' },
    { pattern: '3.1.2', inv: 'Гантели 2-4 кг', alt: 'Бутылки с водой' },
    { pattern: '3.1.3', inv: 'Бодибар 5-10 кг', alt: 'Гантели' },
    { pattern: '4.1.', inv: 'Гантели 1-3 кг', alt: 'Бутылки 0.5-1л' },
    { pattern: '5.1.', inv: 'Коврик', alt: null },
    { pattern: '5.2.', inv: 'Коврик', alt: null },
    { pattern: '6.1.', inv: 'Без оборудования', alt: null },
    { pattern: '6.2.', inv: 'Гантели 2-4 кг', alt: 'Бутылки с водой' }
  ]

  const { data: exercises } = await supabase.from('exercise_library').select('id, name')

  for (const ex of exercises) {
    const match = inventoryMap.find(m => ex.id.startsWith(m.pattern))
    if (match) {
      await supabase.from('exercise_library').update({
        inventory: match.inv,
        inventory_alternative: match.alt
      }).eq('id', ex.id)
    } else {
      // По умолчанию
      await supabase.from('exercise_library').update({
        inventory: 'Коврик',
        inventory_alternative: null
      }).eq('id', ex.id)
    }
  }

  console.log('Done!')
}

fillInventory()
