'use client'

import { useState } from 'react'
import { createExercise } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CreateExerciseButtonProps {
  sessionId: string
}

export default function CreateExerciseButton({ sessionId }: CreateExerciseButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    order_index: 1,
    title: '',
    description: '',
    video_kinescope_id: '',
    sets: 3,
    reps: '12-15',
    rest_seconds: 60,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createExercise({
      workout_session_id: sessionId,
      ...formData,
    })

    setLoading(false)

    if (result.success) {
      setOpen(false)
      setFormData({
        order_index: 1,
        title: '',
        description: '',
        video_kinescope_id: '',
        sets: 3,
        reps: '12-15',
        rest_seconds: 60,
      })
      router.refresh()
    } else {
      setError(result.error || 'Ошибка создания')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Добавить упражнение
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новое упражнение</DialogTitle>
            <DialogDescription>
              Добавьте упражнение в тренировку
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Порядковый номер</label>
              <Input
                type="number"
                min="1"
                value={formData.order_index}
                onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                placeholder="Отжимания"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={3}
                placeholder="Классические отжимания от пола. Держите спину прямой."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ID видео Kinescope</label>
              <Input
                placeholder="demo_pushups"
                value={formData.video_kinescope_id}
                onChange={(e) => setFormData({...formData, video_kinescope_id: e.target.value})}
                required
              />
              <p className="text-xs text-muted-foreground">
                Позже здесь будет интеграция с Kinescope
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Подходы</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.sets}
                  onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Повторения</label>
                <Input
                  placeholder="12-15"
                  value={formData.reps}
                  onChange={(e) => setFormData({...formData, reps: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Отдых (сек)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.rest_seconds}
                  onChange={(e) => setFormData({...formData, rest_seconds: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

