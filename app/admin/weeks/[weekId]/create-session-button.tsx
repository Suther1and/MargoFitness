'use client'

import { useState } from 'react'
import { createWorkoutSession } from '@/lib/actions/admin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X, Sparkles } from 'lucide-react'
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
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20">
          <Plus className="size-4" />
          Добавить тренировку
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
          {/* Кнопка закрытия */}
          <button 
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors z-20"
          >
            <X className="size-5" />
          </button>

          {/* Декоративные элементы */}
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <DialogHeader className="relative z-10 mb-8 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Sparkles className="size-5 text-orange-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Новая тренировка</DialogTitle>
            </div>
            <DialogDescription className="text-white/50 text-sm">Добавьте тренировку в эту неделю</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-400 uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Номер сессии</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={formData.session_number}
                  onChange={(e) => setFormData({...formData, session_number: parseInt(e.target.value)})}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Уровень доступа</label>
                <select
                  value={formData.required_tier}
                  onChange={(e) => setFormData({...formData, required_tier: e.target.value as any})}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm appearance-none"
                >
                  <option value="free" className="bg-[#1a1a24]">Free</option>
                  <option value="basic" className="bg-[#1a1a24]">Basic</option>
                  <option value="pro" className="bg-[#1a1a24]">Pro</option>
                  <option value="elite" className="bg-[#1a1a24]">Elite</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Название тренировки</label>
              <input
                placeholder="Например: Верхняя часть тела"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Описание (необязательно)</label>
              <textarea
                rows={3}
                placeholder="Например: Грудь, спина и руки"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Длительность (мин)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-50"
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

