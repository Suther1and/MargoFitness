'use client'

import { useState } from 'react'
import { CheckCircle2, Star, Play, Smile, Meh, Frown, Heart, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { completeWorkout } from '@/lib/actions/content'
import { useRouter } from 'next/navigation'

interface WorkoutCompletionBlockProps {
  sessionId: string
  isCompleted: boolean
  onComplete?: () => void
}

export function WorkoutCompletionBlock({ sessionId, isCompleted, onComplete }: WorkoutCompletionBlockProps) {
  const [rating, setRating] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    const result = await completeWorkout(sessionId, rating > 0 ? rating : undefined, difficulty > 0 ? difficulty : undefined)
    
    if (result.success) {
      if (onComplete) {
        onComplete()
      } else {
        // Добавляем небольшую задержку перед редиректом, чтобы избежать мерцания
        setTimeout(() => {
          router.push('/dashboard?tab=workouts')
          router.refresh()
        }, 300)
      }
    } else {
      setLoading(false)
      alert(result.error || 'Ошибка при завершении тренировки')
    }
  }

  const difficultyOptions = [
    { value: 5, icon: Zap, label: 'Очень тяжело', color: 'text-rose-400' },
    { value: 4, icon: Frown, label: 'Тяжело', color: 'text-orange-400' },
    { value: 3, icon: Meh, label: 'Средне', color: 'text-amber-400' },
    { value: 2, icon: Smile, label: 'Легко', color: 'text-cyan-400' },
    { value: 1, icon: Heart, label: 'Идеально', color: 'text-emerald-400' },
  ]

  const ratingLabels: Record<number, string> = {
    1: 'Очень плохо',
    2: 'Плохо',
    3: 'Средне',
    4: 'Нормально',
    5: 'Отлично'
  }

  return (
    <div className="relative max-w-2xl mx-auto text-center">
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-3xl md:text-5xl font-oswald font-black uppercase tracking-tight text-white leading-none">
            {isCompleted ? 'Тренировка выполнена!' : 'Завершили тренировку?'}
          </h3>
          <p className="text-white/40 text-sm md:text-base font-medium">
            Оцени тренировку, чтобы зафиксировать прогресс в статистике
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Общая оценка */}
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center justify-between min-h-[140px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 block mb-4">
              Общая оценка
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition-all active:scale-90"
                >
                  <Star
                    className={cn(
                      "size-10 transition-colors",
                      value <= rating
                        ? "fill-emerald-400 text-emerald-400"
                        : "text-white/10 hover:text-white/20"
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="h-5 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">
                {rating > 0 ? ratingLabels[rating] : ''}
              </span>
            </div>
          </div>

          {/* Сложность */}
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center justify-between min-h-[140px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 block mb-4">
              Сложность
            </label>
            <div className="flex justify-center gap-3 mb-2">
              {difficultyOptions.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDifficulty(item.value)}
                    className={cn(
                      "group flex flex-col items-center gap-2 transition-all active:scale-90",
                      difficulty === item.value ? "opacity-100" : "opacity-30 hover:opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                      difficulty === item.value 
                        ? "bg-white/10 border-white/20" 
                        : "bg-white/5 border-transparent"
                    )}>
                      <Icon className={cn("size-5", difficulty === item.value ? item.color : "text-white")} />
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="h-5 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">
                {difficulty > 0 ? difficultyOptions.find(d => d.value === difficulty)?.label : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleComplete}
            disabled={loading}
            className={cn(
              "group relative w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 overflow-hidden",
              loading 
                ? "bg-white/10 text-white/40 cursor-not-allowed" 
                : "bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  Завершить тренировку
                  <Play className="size-4 fill-current" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
