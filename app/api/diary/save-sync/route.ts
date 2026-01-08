import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertDiaryEntry, updateDiarySettings } from '@/lib/actions/diary'

/**
 * API endpoint для синхронного сохранения данных при закрытии страницы
 * Используется с navigator.sendBeacon для гарантированной отправки
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (type === 'diary') {
      // Сохранение метрик дневника
      const { date, metrics, notes, habitsCompleted, photoUrls } = data
      const result = await upsertDiaryEntry(user.id, date, metrics, habitsCompleted, notes, photoUrls)
      return NextResponse.json(result)
    }

    if (type === 'settings') {
      // Сохранение настроек
      const result = await updateDiarySettings(user.id, data.settings)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
  } catch (error: any) {
    console.error('[Save Sync API Error]:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

