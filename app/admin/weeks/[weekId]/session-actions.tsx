'use client'

import { useState } from 'react'
import { deleteWorkoutSession } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
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
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="size-4" />
    </Button>
  )
}

