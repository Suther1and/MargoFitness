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
import { Edit, X, Sparkles, Video, Clock, Repeat, Info, AlertTriangle, LayoutDashboard, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { WorkoutExercise, ExerciseLibrary } from '@/types/database'
import { Badge } from '@/components/ui/badge'

interface EditExerciseButtonProps {
  exercise: WorkoutExercise & { exercise_library: ExerciseLibrary }
}

export default function EditExerciseButton({ exercise }: EditExerciseButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    order_index: exercise.order_index,
    video_kinescope_id: exercise.video_kinescope_id || '',
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
      
      <DialogContent className="max-w-2xl p-0 border-0 bg-transparent overflow-visible shadow-none [&>button]:hidden">
        <div className="relative w-full max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] ring-1 ring-white/10 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A] shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <LayoutDashboard className="size-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="outline" className="text-[9px] text-purple-400 border-purple-400/30 font-mono px-1.5 py-0">
                    {exercise.exercise_library_id}
                  </Badge>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{exercise.exercise_library.category}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-white font-oswald uppercase tracking-tight">
                  {exercise.exercise_library.name}
                </DialogTitle>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#0A0A0A]">
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle className="size-4" />
                  {error}
                </div>
              )}

              {/* 1. Настройки выполнения */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">Настройки для этой недели</h4>
                </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Подходы</label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="1"
                          value={formData.sets}
                          onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, sets: prev.sets + 1 }))}
                            className="p-0.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                          >
                            <ChevronRight className="size-3 -rotate-90" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, sets: Math.max(1, prev.sets - 1) }))}
                            className="p-0.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                          >
                            <ChevronRight className="size-3 rotate-90" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Повторения</label>
                      <input
                        value={formData.reps}
                        onChange={(e) => setFormData({...formData, reps: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Отдых (сек)</label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={formData.rest_seconds}
                          onChange={(e) => setFormData({...formData, rest_seconds: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rest_seconds: prev.rest_seconds + 5 }))}
                            className="p-0.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                          >
                            <ChevronRight className="size-3 -rotate-90" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rest_seconds: Math.max(0, prev.rest_seconds - 5) }))}
                            className="p-0.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                          >
                            <ChevronRight className="size-3 rotate-90" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">ID видео Kinescope</label>
                  <div className="relative group">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      placeholder="Вставьте ID видео..."
                      value={formData.video_kinescope_id}
                      onChange={(e) => setFormData({...formData, video_kinescope_id: e.target.value})}
                      className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Справочная информация */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">Справочник из библиотеки</h4>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Описание техники</span>
                    <p className="text-sm text-white/70 leading-relaxed italic">«{exercise.exercise_library.description}»</p>
                    <div className="text-sm text-white/50 leading-relaxed whitespace-pre-line pt-2">
                      {exercise.exercise_library.technique_steps}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-red-400/50" />
                      <span className="text-[10px] font-bold text-red-400/50 uppercase tracking-widest">Типичные ошибки</span>
                    </div>
                    <p className="text-sm text-red-200/40 leading-relaxed whitespace-pre-line">
                      {exercise.exercise_library.typical_mistakes}
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Video className="size-4 text-blue-400/50" />
                      <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest">Сценарий видео</span>
                    </div>
                    <p className="text-[12px] text-blue-200/50 leading-relaxed font-mono whitespace-pre-line">
                      {exercise.exercise_library.video_script}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-[#0A0A0A] flex gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
            >
              Отмена
            </button>
            <button 
              onClick={(e) => handleSubmit(e as any)}
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
