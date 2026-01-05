'use client'

import { Smile, Zap, Frown, Meh, Laugh, Annoyed } from 'lucide-react'
import { MoodRating } from '../types'
import { cn } from '@/lib/utils'

interface MoodEnergyCardHProps {
  mood: MoodRating | null
  energy: number
  onMoodUpdate: (mood: MoodRating) => void
  onEnergyUpdate: (energy: number) => void
}

export function MoodEnergyCardH({ mood, energy, onMoodUpdate, onEnergyUpdate }: MoodEnergyCardHProps) {
  // Расширенная шкала из 5 настроений
  const moods: { rating: MoodRating, icon: any, color: string }[] = [
    { rating: 1, icon: Frown, color: 'text-red-400' },
    { rating: 2, icon: Annoyed, color: 'text-orange-400' },
    { rating: 3, icon: Meh, color: 'text-yellow-400' },
    { rating: 4, icon: Smile, color: 'text-emerald-400' },
    { rating: 5, icon: Laugh, color: 'text-pink-400' },
  ]

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 md:backdrop-blur-2xl hover:border-white/20 transition-colors duration-500 h-[180px]" style={{ contain: 'paint' }}>
      <div className="flex flex-col h-full md:px-6 md:pt-4 md:pb-6 md:justify-between px-2 py-4 md:p-0">
        
        {/* Mood Section - Адаптация для мобильных */}
        <div className="flex flex-col justify-between h-[45%] md:h-auto md:space-y-3 px-1 md:px-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Smile className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Настроение</span>
          </div>
          
          <div className="flex gap-1.5 justify-center w-full mt-2 md:mt-0">
            {moods.map((m) => {
              const isActive = mood === m.rating
              return (
                <button
                  key={m.rating}
                  onClick={() => onMoodUpdate(m.rating)}
                  className={cn(
                    "flex-1 py-1.5 md:py-2 rounded-xl transition-colors duration-300 flex items-center justify-center",
                    isActive 
                      ? "bg-transparent md:bg-white/10 border-0 md:border md:border-white/20 shadow-lg scale-110 md:scale-105" 
                      : "bg-transparent md:bg-white/5 border-0 md:border md:border-white/5 opacity-30 active:opacity-100"
                  )}
                >
                  <m.icon className={cn(
                    "w-7 h-7 md:w-5 md:h-5 transition-colors duration-300", 
                    isActive ? m.color : "text-white"
                  )} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Energy Section - Адаптация для мобильных */}
        <div className="flex flex-col justify-between h-[45%] md:h-auto md:space-y-2 px-1 md:px-0 mt-4 md:mt-0 translate-y-1 md:translate-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Энергия</span>
            </div>
            <span className="text-[10px] font-bold text-orange-400/60 tabular-nums">{energy}/10</span>
          </div>
          <div className="flex gap-1 h-6 md:h-5 mt-2 md:mt-0">
            {Array.from({ length: 10 }).map((_, i) => {
                const val = i + 1
                return (
                    <button
                        key={val}
                        onClick={() => onEnergyUpdate(val)}
                        className={cn(
                            "flex-1 rounded-[4px] transition-colors duration-300 active:scale-95",
                            energy >= val 
                                ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                                : "bg-white/5 hover:bg-white/10"
                        )}
                    />
                )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
