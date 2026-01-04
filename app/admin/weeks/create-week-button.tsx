'use client'

import { useState, useEffect } from 'react'
import { createWeek } from '@/lib/actions/admin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X, Calendar, Type, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

function getNextMonday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDateDisplay(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
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
  }, [open, formData.start_date])

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
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all hover:brightness-110 active:scale-95">
          <Plus className="size-4" />
          Создать неделю
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          >
            <X className="size-5 text-white/40" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

          <DialogHeader className="relative z-10 mb-8">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Новая неделя</DialogTitle>
            <DialogDescription className="text-white/50">Запланируйте тренировочный контент</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Calendar className="size-4 text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Период</span>
                  <span className="text-sm font-bold text-white">
                    {formData.start_date && formData.end_date ? (
                      <>{formatDateDisplay(formData.start_date)} — {formatDateDisplay(formData.end_date)}</>
                    ) : 'Загрузка...'}
                  </span>
                </div>
              </div>
              <div className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-white/40 uppercase">7 дней</div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <Type className="size-3" />
                  Название
                </label>
                <input
                  placeholder="Неделя 1: Сила и выносливость"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <FileText className="size-3" />
                  Описание
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all min-h-[100px] resize-none text-sm"
                  placeholder="О чем будет эта неделя?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <input
                type="checkbox"
                id="published"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                className="size-5 rounded-lg bg-white/5 border-white/10 text-orange-500 focus:ring-orange-500/50 transition-all cursor-pointer"
              />
              <label htmlFor="published" className="text-sm font-medium text-white/70 cursor-pointer select-none">
                Опубликовать сразу для всех
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
