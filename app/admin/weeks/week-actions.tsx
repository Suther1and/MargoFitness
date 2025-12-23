'use client'

import { useState } from 'react'
import { updateWeek, deleteWeek } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
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
      <Button
        variant="outline"
        size="sm"
        onClick={handleTogglePublish}
        disabled={loading}
      >
        {week.is_published ? (
          <>
            <EyeOff className="mr-2 size-4" />
            Снять с публикации
          </>
        ) : (
          <>
            <Eye className="mr-2 size-4" />
            Опубликовать
          </>
        )}
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

