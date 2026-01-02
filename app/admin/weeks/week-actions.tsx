'use client'

import { useState } from 'react'
import { updateWeek, deleteWeek } from '@/lib/actions/admin'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ContentWeek } from '@/types/database'

interface WeekActionsProps {
  week: ContentWeek
}

export default function WeekActions({ week }: WeekActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTogglePublish = async () => {
    if (loading) return
    
    const confirmed = confirm(
      week.is_published
        ? 'Снять неделю с публикации? Она станет недоступна пользователям.'
        : 'Опубликовать неделю? Она станет доступна пользователям.'
    )

    if (!confirmed) return

    setLoading(true)

    const result = await updateWeek(week.id, {
      is_published: !week.is_published,
    })

    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Ошибка')
    }
  }

  const handleDelete = async () => {
    if (loading) return

    const confirmed = confirm(
      'Удалить эту неделю? Все тренировки и упражнения будут удалены. Это действие нельзя отменить!'
    )

    if (!confirmed) return

    setLoading(true)

    const result = await deleteWeek(week.id)

    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Ошибка удаления')
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
          week.is_published 
            ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
        }`}
      >
        {week.is_published ? (
          <>
            <EyeOff className="size-3" />
            Снять
          </>
        ) : (
          <>
            <Eye className="size-3" />
            Опубликовать
          </>
        )}
      </button>
      
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
        title="Удалить неделю"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
