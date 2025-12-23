'use client'

import { useState } from 'react'
import { completeWorkout } from '@/lib/actions/content'
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
import { CheckCircle, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WorkoutCompleteButtonProps {
  sessionId: string
  isRetake?: boolean
}

export default function WorkoutCompleteButton({ sessionId, isRetake = false }: WorkoutCompleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)

    const result = await completeWorkout(
      sessionId,
      rating > 0 ? rating : undefined,
      difficulty > 0 ? difficulty : undefined
    )

    setLoading(false)

    if (result.success) {
      setOpen(false)
      // Используем прямой редирект для надёжности
      window.location.href = '/workouts'
    } else {
      alert(result.error || 'Ошибка при сохранении')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="min-w-[200px]">
          <CheckCircle className="mr-2 size-5" />
          {isRetake ? 'Пройти снова' : 'Завершить тренировку'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRetake ? 'Как прошла тренировка?' : 'Поздравляем! 🎉'}
          </DialogTitle>
          <DialogDescription>
            {isRetake 
              ? 'Обновите свою оценку тренировки'
              : 'Вы завершили тренировку! Поделитесь впечатлениями'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Общая оценка */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Общая оценка
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      value <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {getRatingText(rating)}
              </p>
            )}
          </div>

          {/* Сложность */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Как показалась сложность?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 1, emoji: '😊', label: 'Легко' },
                { value: 2, emoji: '🙂', label: 'Норм' },
                { value: 3, emoji: '😐', label: 'Средне' },
                { value: 4, emoji: '😅', label: 'Тяжело' },
                { value: 5, emoji: '😰', label: 'Очень' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDifficulty(item.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                    difficulty === item.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Отмена
          </Button>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Сохранение...' : isRetake ? 'Обновить оценку' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getRatingText(rating: number): string {
  const texts: Record<number, string> = {
    1: 'Не понравилось',
    2: 'Так себе',
    3: 'Нормально',
    4: 'Хорошо',
    5: 'Отлично!',
  }
  return texts[rating] || ''
}

