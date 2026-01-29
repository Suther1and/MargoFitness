import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Функция для ручного парсинга .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importLibrary() {
  const filePath = path.join(process.cwd(), 'docs/content-planning/EXERCISE_LIBRARY.md');
  const content = fs.readFileSync(filePath, 'utf8');

  const exercises = [];
  const sections = content.split('#### ').slice(1);

  console.log(`Found ${sections.length} sections in MD file.`);

  for (const section of sections) {
    const lines = section.split('\n');
    const firstLine = lines[0].trim();
    const idMatch = firstLine.match(/^(\d+\.\d+\.\d+)\s+(.+)$/);
    
    if (!idMatch) continue;

    const id = idMatch[1];
    const name = idMatch[2];
    
    // Ищем описание
    let description = '';
    const descIndex = lines.findIndex(l => l.includes('**Описание:**'));
    if (descIndex !== -1) {
      description = lines[descIndex + 1].trim();
    }

    // Ищем подходы, повторения, отдых
    let sets = null;
    let reps = '';
    let rest = null;

    const setsLine = lines.find(l => l.includes('**Подходы:**'));
    if (setsLine) {
      const match = setsLine.match(/\d+/);
      if (match) sets = parseInt(match[0]);
    }

    const repsLine = lines.find(l => l.includes('**Повторения:**'));
    if (repsLine) {
      reps = repsLine.split('**Повторения:**')[1].trim();
    }

    const restLine = lines.find(l => l.includes('**Отдых:**'));
    if (restLine) {
      const match = restLine.match(/\d+/);
      if (match) rest = parseInt(match[0]);
    }

    // Ищем технику выполнения
    let technique = '';
    const techIndex = lines.findIndex(l => l.includes('**Техника выполнения:**'));
    if (techIndex !== -1) {
      let i = techIndex + 1;
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('**')) {
        technique += lines[i].trim() + '\n';
        i++;
      }
    }

    // Ищем типичные ошибки
    let mistakes = '';
    const mistakeIndex = lines.findIndex(l => l.includes('**Типичные ошибки:**'));
    if (mistakeIndex !== -1) {
      let i = mistakeIndex + 1;
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('**')) {
        mistakes += lines[i].trim() + '\n';
        i++;
      }
    }

    // Ищем видео-сценарий
    let script = '';
    const scriptIndex = lines.findIndex(l => l.includes('**Видео-сценарий:**'));
    if (scriptIndex !== -1) {
      let i = scriptIndex + 1;
      while (i < lines.length && !lines[i].includes('---') && !lines[i].startsWith('####')) {
        script += lines[i].trim() + '\n';
        i++;
      }
    }

    // Категория и мышцы
    const patternId = id.split('.').slice(0, 2).join('.');
    const patternRegex = new RegExp(`### ПАТТЕРН ${patternId}: (.+)`);
    const patternMatch = content.match(patternRegex);
    const category = patternMatch ? patternMatch[1].split('(')[0].trim() : 'Другое';

    const musclesRegex = new RegExp(`### ПАТТЕРН ${patternId}:[\\s\\S]*?\\*\\*Целевые мышцы:\\*\\* (.+)`);
    const musclesMatch = content.match(musclesRegex);
    const targetMuscles = musclesMatch ? musclesMatch[1].split(',').map(m => m.trim()) : [];

    exercises.push({
      id,
      name,
      description,
      category,
      target_muscles: targetMuscles,
      default_sets: sets,
      default_reps: reps,
      default_rest_seconds: rest,
      technique_steps: technique.trim(),
      typical_mistakes: mistakes.trim(),
      video_script: script.trim()
    });
  }

  console.log(`Parsed ${exercises.length} exercises. Inserting into DB in batches...`);

  // Вставляем пачками по 20, чтобы избежать таймаутов и сетевых ошибок
  for (let i = 0; i < exercises.length; i += 20) {
    const batch = exercises.slice(i, i + 20);
    const { error } = await supabase
      .from('exercise_library')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting batch ${i / 20 + 1}:`, error);
    } else {
      console.log(`Successfully imported batch ${i / 20 + 1}`);
    }
  }
}

importLibrary();
