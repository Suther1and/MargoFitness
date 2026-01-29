'use client'

import { useState, useEffect } from 'react'
import { getExerciseLibrary } from '@/lib/actions/exercise-library'
import { createExercise } from '@/lib/actions/admin'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Plus, X, Dumbbell, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ExerciseLibrary } from '@/types/database'
import { Badge } from '@/components/ui/badge'

interface CreateExerciseButtonProps {
  sessionId: string
  nextOrderIndex: number
}

export default function CreateExerciseButton({ sessionId, nextOrderIndex }: CreateExerciseButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState<ExerciseLibrary[]>([])
  const [search, setSearch] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadExercises()
    }
  }, [open])

  async function loadExercises() {
    const data = await getExerciseLibrary()
    setExercises(data)
  }

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.category.toLowerCase().includes(search.toLowerCase()) ||
    ex.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (exercise: ExerciseLibrary) => {
    setAddingId(exercise.id)
    const result = await createExercise({
      session_id: sessionId,
      exercise_library_id: exercise.id,
      order_index: nextOrderIndex,
      sets: exercise.default_sets || 3,
      reps: exercise.default_reps || '12-15',
      rest_seconds: exercise.default_rest_seconds || 60,
    })

    if (result.success) {
      router.refresh()
      // Не закрываем сразу, чтобы можно было добавить несколько
      setTimeout(() => setAddingId(null), 1000)
    } else {
      setAddingId(null)
      alert(result.error || 'Ошибка добавления')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
            <Plus className="size-6 text-white/20 group-hover:text-purple-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-widest">Добавить упражнение</div>
            <div className="text-[10px] text-white/10 group-hover:text-white/20 uppercase tracking-widest mt-1">Из библиотеки</div>
          </div>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl p-0 border-0 bg-transparent overflow-visible shadow-none [&>button]:hidden">
        <div className="relative w-full max-h-[85vh] overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] ring-1 ring-white/10 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A] shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Dumbbell className="size-5 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white font-oswald uppercase tracking-tight">
                  Добавить из библиотеки
                </DialogTitle>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Выберите упражнение для тренировки</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 bg-[#0A0A0A] border-b border-white/5 shrink-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
              <input
                placeholder="Поиск по названию, ID или категории..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0A0A0A]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAdd(ex)}
                  disabled={addingId === ex.id}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-purple-400/50 border-purple-400/20 font-mono">
                        {ex.id}
                      </Badge>
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest truncate">{ex.category}</span>
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-purple-100 transition-colors leading-tight">
                      {ex.name}
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {addingId === ex.id ? (
                      <CheckCircle2 className="size-5 text-emerald-400 animate-in zoom-in duration-300" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        <Plus className="size-4 text-white/20 group-hover:text-purple-400" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-[#0A0A0A] shrink-0">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              Готово
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
