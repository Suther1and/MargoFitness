'use client'

import { useState } from 'react'
import { updateExercise } from '@/lib/actions/admin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, X, Sparkles, Video, Clock, Repeat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/types/database'

interface EditExerciseButtonProps {
  exercise: Exercise
}

export default function EditExerciseButton({ exercise }: EditExerciseButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    order_index: exercise.order_index,
    title: exercise.title,
    description: exercise.description,
    video_kinescope_id: exercise.video_kinescope_id,
    sets: exercise.sets || 3,
    reps: exercise.reps || '12-15',
    rest_seconds: exercise.rest_seconds || 60,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await updateExercise(exercise.id, formData)

    setLoading(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Ошибка обновления')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all active:scale-95 shadow-sm">
          <Edit className="size-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
          {/* Кнопка закрытия */}
          <button 
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors z-20"
          >
            <X className="size-5" />
          </button>

          {/* Декоративные элементы */}
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <DialogHeader className="relative z-10 mb-8 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Edit className="size-5 text-blue-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Редактировать</DialogTitle>
            </div>
            <DialogDescription className="text-white/50 text-sm">Внесите изменения в параметры упражнения</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-400 uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Название упражнения</label>
                  <input
                    placeholder="Например: Отжимания"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Описание техники</label>
                  <textarea
                    rows={4}
                    placeholder="Подробно опишите технику выполнения..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Video className="size-3" />
                    ID видео Kinescope
                  </label>
                  <input
                    placeholder="demo_id_123"
                    value={formData.video_kinescope_id}
                    onChange={(e) => setFormData({...formData, video_kinescope_id: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Порядковый номер</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Параметры выполнения</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Repeat className="size-3" />
                        Подходы
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.sets}
                        onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Repeat className="size-3" />
                        Повторения
                      </label>
                      <input
                        placeholder="Например: 12-15"
                        value={formData.reps}
                        onChange={(e) => setFormData({...formData, reps: e.target.value})}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Clock className="size-3" />
                        Отдых (сек)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.rest_seconds}
                        onChange={(e) => setFormData({...formData, rest_seconds: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

