'use client'

import { useState } from 'react'
import { updateWorkoutSession } from '@/lib/actions/admin'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, X, Type, FileText, Clock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { WorkoutSession } from '@/types/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface EditWorkoutButtonProps {
  session: WorkoutSession
}

export function EditWorkoutButton({ session }: EditWorkoutButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: session.title,
    description: session.description || '',
    estimated_duration: session.estimated_duration || 45,
    required_tier: session.required_tier,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await updateWorkoutSession(session.id, formData)

    setLoading(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Ошибка обновления')
    }
  }

  const tiers = [
    { id: 'free', label: 'Free', color: 'text-white/40' },
    { id: 'basic', label: 'Basic', color: 'text-cyan-400' },
    { id: 'pro', label: 'Pro', color: 'text-purple-400' },
    { id: 'elite', label: 'Elite', color: 'text-amber-400' },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all active:scale-95 shadow-sm">
          <Edit className="size-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none [&>button]:hidden">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          >
            <X className="size-5 text-white/40" />
          </button>

          <DialogHeader className="relative z-10 mb-8">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Редактировать тренировку</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 flex items-center gap-3">
                <AlertTriangle className="size-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <Type className="size-3" />
                  Название
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <FileText className="size-3" />
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <Clock className="size-3" />
                    Длительность (мин)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <ShieldCheck className="size-3" />
                    Уровень доступа
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold text-left flex items-center justify-between">
                        <span className={cn(tiers.find(t => t.id === formData.required_tier)?.color)}>
                          {tiers.find(t => t.id === formData.required_tier)?.label}
                        </span>
                        <ChevronRight className="size-4 rotate-90 text-white/20" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a1a24] border-white/10 text-white rounded-xl p-2 z-[110]">
                      {tiers.map((tier) => (
                        <DropdownMenuItem
                          key={tier.id}
                          onClick={() => setFormData({...formData, required_tier: tier.id as any})}
                          className={cn("rounded-lg cursor-pointer focus:bg-white/5", tier.color)}
                        >
                          {tier.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
