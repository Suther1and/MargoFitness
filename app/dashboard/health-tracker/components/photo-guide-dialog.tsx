'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, X, Check } from 'lucide-react'

interface PhotoGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoGuideDialog({ open, onOpenChange }: PhotoGuideDialogProps) {
  const poses = [
    {
      emoji: '🧍',
      title: 'Профиль',
      tips: ['Встань прямо лицом к камере', 'Руки вдоль тела', 'Расслабь плечи']
    },
    {
      emoji: '🚶',
      title: 'Бок',
      tips: ['Повернись боком', 'Держи спину ровно', 'Руки опущены']
    },
    {
      emoji: '🧘',
      title: 'Спина',
      tips: ['Повернись спиной', 'Ноги на ширине плеч', 'Голова прямо']
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1400px] p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          >
            <X className="size-5 text-white/40" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

          <DialogHeader className="relative z-10 mb-6 text-left">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight flex items-center gap-2">
              <Camera className="w-6 h-6 text-pink-400" />
              Как правильно делать фото
            </DialogTitle>
          </DialogHeader>

          <div className="relative z-10 space-y-6">
            {/* Три позы - горизонтально */}
            <div className="grid grid-cols-3 gap-6">
              {poses.map((pose) => (
                <div
                  key={pose.title}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 text-center"
                >
                  <div className="text-5xl mb-3">{pose.emoji}</div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider mb-3">
                    {pose.title}
                  </h3>
                  <div className="space-y-2">
                    {pose.tips.map((tip) => (
                      <div key={tip} className="flex items-start gap-2 text-left">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-white/40 leading-snug">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Общие советы - компактно */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-4 flex items-center gap-2">
                <span>✨</span>
                Общие рекомендации
              </h3>
              
              <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-base">📸</span>
                  <div>
                    <p className="text-xs font-bold text-white">Одинаковое освещение</p>
                    <p className="text-[11px] text-white/40">Естественный свет, без вспышки</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">📏</span>
                  <div>
                    <p className="text-xs font-bold text-white">Одно и то же место</p>
                    <p className="text-[11px] text-white/40">Для точного сравнения</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">👕</span>
                  <div>
                    <p className="text-xs font-bold text-white">Одинаковая одежда</p>
                    <p className="text-[11px] text-white/40">Облегающая или спортивная</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">⏰</span>
                  <div>
                    <p className="text-xs font-bold text-white">Одно время дня</p>
                    <p className="text-[11px] text-white/40">Утром натощак - лучше всего</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Важное примечание */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">⚡</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Фото можно загружать <strong className="text-white">раз в неделю</strong> (пн-вс), максимум 3 штуки. Загруженные фото можно заменить или удалить.
              </p>
            </div>

            {/* Кнопка */}
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              <Check className="w-4 h-4" />
              Понятно, начнём!
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
