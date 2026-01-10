'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, X, Check, Sun, MapPin, Shirt, Clock, Zap, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface PhotoGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoGuideDialog({ open, onOpenChange }: PhotoGuideDialogProps) {
  const poses = [
    {
      id: 'front',
      image: '/images/guide/pose-front.webp',
      title: 'Вид спереди',
      tips: [
        'Смотри прямо перед собой и просто расслабь плечи',
        'Держи руки чуть в стороны — так мы лучше увидим твою талию'
      ]
    },
    {
      id: 'side',
      image: '/images/guide/pose-side.webp',
      title: 'Вид сбоку',
      tips: [
        'Повернись ровно боком и не закрывай тело руками',
        'Стой как обычно, не нужно специально прогибать спину'
      ]
    },
    {
      id: 'back',
      image: '/images/guide/pose-back.webp',
      title: 'Вид сзади',
      tips: [
        'Поставь стопы на ширине плеч и держи спину ровно',
        'Если у тебя длинные волосы, лучше убери их, чтобы открыть плечи'
      ]
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95 text-white/40"
          >
            <X className="size-5" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent pointer-events-none" />
          
          <DialogHeader className="relative z-10 mb-6">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-wider flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-pink-500" />
              </div>
              Как делать фото прогресса
            </DialogTitle>
          </DialogHeader>

          <div className="relative z-10 space-y-6">
            {/* Три позы */}
            <div className="grid grid-cols-3 gap-4">
              {poses.map((pose) => (
                <div
                  key={pose.id}
                  className="rounded-3xl bg-[#22222e] border border-white/5 p-4 flex flex-col items-center"
                >
                  <div className="relative w-full aspect-[4/5] mb-4 rounded-2xl overflow-hidden bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center group">
                    <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500">
                      {pose.id === 'front' && '🧍'}
                      {pose.id === 'side' && '🚶'}
                      {pose.id === 'back' && '🧘'}
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-bold uppercase text-white tracking-widest mb-3 font-oswald text-center">
                    {pose.title}
                  </h3>
                  
                  <div className="space-y-2 w-full">
                    {pose.tips.map((tip) => (
                      <div key={tip} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-[#8b8b93] leading-snug">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Общие рекомендации */}
            <div className="rounded-3xl bg-[#22222e] border border-white/5 p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                    <Sun className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight mb-1">Свет</p>
                    <p className="text-[11px] text-[#8b8b93] leading-tight text-balance">Мягкий свет спереди, без резких теней на теле</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight mb-1">Ракурс</p>
                    <p className="text-[11px] text-[#8b8b93] leading-tight text-balance">Держи камеру на уровне пупка в 2 метрах от себя</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                    <Shirt className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight mb-1">Одежда</p>
                    <p className="text-[11px] text-[#8b8b93] leading-tight text-balance">Используй один и тот же комплект белья для всех фото</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight mb-1">Время</p>
                    <p className="text-[11px] text-[#8b8b93] leading-tight text-balance">Старайся делать фото утром, до завтрака и воды</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Инфо-бокс */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
              <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-[#8b8b93] leading-relaxed">
                Ты можешь добавить максимум <strong className="text-white">3 фото в неделю</strong>. Если что-то не понравится, фото всегда можно заменить.
              </p>
            </div>

            {/* Кнопка */}
            <button
              onClick={() => onOpenChange(false)}
              className="group relative w-full h-13 md:h-14 rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-[#ff2d78]" />
              <div className="relative flex items-center justify-center gap-2.5 text-white font-bold text-sm uppercase tracking-widest font-oswald">
                <Check className="w-5 h-5" />
                Все понятно, поехали!
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
