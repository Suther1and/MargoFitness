'use client'

import { useState } from 'react'
import { createWorkoutSession } from '@/lib/actions/admin'
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

interface CreateSessionButtonProps {
  weekId: string
}

export default function CreateSessionButton({ weekId }: CreateSessionButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    session_number: 1,
    required_tier: 'basic' as 'free' | 'basic' | 'pro' | 'elite',
    title: '',
    description: '',
    estimated_duration: 45,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createWorkoutSession({
      week_id: weekId,
      ...formData,
    })

    setLoading(false)

    if (result.success) {
      setOpen(false)
      setFormData({
        session_number: 1,
        required_tier: 'basic',
        title: '',
        description: '',
        estimated_duration: 45,
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
          Добавить тренировку
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новая тренировка</DialogTitle>
            <DialogDescription>
              Добавьте тренировку в эту неделю
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Номер тренировки</label>
              <Input
                type="number"
                min="1"
                max="3"
                value={formData.session_number}
                onChange={(e) => setFormData({...formData, session_number: parseInt(e.target.value)})}
                required
              />
              <p className="text-xs text-muted-foreground">
                1-3 (обычно 1 и 2 для Basic, 3 для Pro+)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Уровень доступа</label>
              <select
                className="w-full rounded-md border p-2"
                value={formData.required_tier}
                onChange={(e) => setFormData({...formData, required_tier: e.target.value as any})}
                required
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                placeholder="Верхняя часть тела"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание (необязательно)</label>
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={2}
                placeholder="Грудь, спина и руки"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Длительность (минуты)</label>
              <Input
                type="number"
                min="10"
                max="120"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
              />
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

