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
import { Plus, X, Sparkles, ChevronDown, Shield, Type, FileText, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TIER_OPTIONS = [
  { value: 'free', label: 'Free (Демо)', color: 'text-white/40' },
  { value: 'basic', label: 'Basic', color: 'text-orange-400' },
  { value: 'pro', label: 'Pro+', color: 'text-purple-400' },
  { value: 'elite', label: 'Elite', color: 'text-yellow-400' },
]

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

  const currentTier = TIER_OPTIONS.find(t => t.value === formData.required_tier)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20">
          <Plus className="size-4" />
          Добавить тренировку
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none [&>button]:hidden">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] ring-1 ring-white/10 shadow-2xl p-8 md:p-10">
          {/* Кнопка закрытия */}
          <button 
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors z-20"
          >
            <X className="size-5" />
          </button>

          <DialogHeader className="relative z-10 mb-8 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="size-5 text-orange-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Новая тренировка</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-sm">Настройте параметры новой тренировочной сессии</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-3">
                <X className="size-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Номер сессии</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.session_number}
                  onChange={(e) => setFormData({...formData, session_number: parseInt(e.target.value)})}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Уровень доступа</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none transition-all hover:bg-white/10">
                      <span className={currentTier?.color}>{currentTier?.label}</span>
                      <ChevronDown className="size-4 text-white/20" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-48 bg-[#1a1a24] border-white/10 text-white rounded-2xl p-2 z-[100]"
                    align="end"
                    sideOffset={8}
                  >
                    {TIER_OPTIONS.map(opt => (
                      <DropdownMenuItem 
                        key={opt.value} 
                        onClick={() => setFormData({...formData, required_tier: opt.value as any})}
                        className={`rounded-xl focus:bg-white/5 cursor-pointer py-2.5 px-4 text-sm font-medium transition-colors ${opt.color}`}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type className="size-3" />
                Название тренировки
              </label>
              <input
                placeholder="Например: Нижняя часть тела"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="size-3" />
                Длительность (мин)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm font-bold"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {loading ? 'Создание...' : 'Создать тренировку'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
