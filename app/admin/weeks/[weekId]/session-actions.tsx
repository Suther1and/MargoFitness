'use client'

import { useState } from 'react'
import { deleteWorkoutSession } from '@/lib/actions/admin'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SessionActionsProps {
  session: any
}

export default function SessionActions({ session }: SessionActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (loading) return

    const confirmed = confirm(
      'Удалить эту тренировку? Все упражнения будут удалены. Это действие нельзя отменить!'
    )

    if (!confirmed) return

    setLoading(true)

    const result = await deleteWorkoutSession(session.id)

    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Ошибка удаления')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
      title="Удалить тренировку"
    >
      <Trash2 className="size-4" />
    </button>
  )
}

