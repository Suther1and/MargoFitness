'use client'

import { useState, useEffect } from 'react'
import { createWeek } from '@/lib/actions/admin'
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

// Функция для получения следующего понедельника
function getNextMonday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday
}

// Форматировать дату в YYYY-MM-DD
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Форматировать дату для отображения (ДД.ММ)
function formatDateDisplay(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  })
}

export default function CreateWeekButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    title: '',
    description: '',
    is_published: false,
  })

  // Автоматически установить даты при открытии
  useEffect(() => {
    if (open && !formData.start_date) {
      const nextMonday = getNextMonday()
      const followingMonday = new Date(nextMonday)
      followingMonday.setDate(nextMonday.getDate() + 7)
      
      setFormData(prev => ({
        ...prev,
        start_date: formatDateForInput(nextMonday),
        end_date: formatDateForInput(followingMonday),
      }))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createWeek(formData)

    setLoading(false)

    if (result.success) {
      setOpen(false)
      setFormData({
        start_date: '',
        end_date: '',
        title: '',
        description: '',
        is_published: false,
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
          Создать неделю
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новая неделя контента</DialogTitle>
            <DialogDescription>
              Создайте новую неделю с тренировками
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="text-sm font-medium">Период недели</div>
              <div className="text-2xl font-bold">
                {formData.start_date && formData.end_date ? (
                  <>
                    {formatDateDisplay(formData.start_date)} - {formatDateDisplay(formData.end_date)}
                  </>
                ) : (
                  'Загрузка...'
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Автоматически: следующий понедельник + 7 дней
              </div>
            </div>

            {/* Скрытые поля для дат */}
            <input type="hidden" value={formData.start_date} />
            <input type="hidden" value={formData.end_date} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                placeholder="Неделя 1: Сила и выносливость"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание (необязательно)</label>
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={3}
                placeholder="Краткое описание недели"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
              />
              <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                Опубликовать сразу
              </label>
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

