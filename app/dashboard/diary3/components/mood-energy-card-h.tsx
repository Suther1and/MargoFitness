'use client'

import { Smile, Zap, Frown, Meh, Heart } from 'lucide-react'
import { MoodRating } from '../types'
import { cn } from '@/lib/utils'

interface MoodEnergyCardHProps {
  mood: MoodRating | null
  energy: number
  onMoodUpdate: (mood: MoodRating) => void
  onEnergyUpdate: (energy: number) => void
}

export function MoodEnergyCardH({ mood, energy, onMoodUpdate, onEnergyUpdate }: MoodEnergyCardHProps) {
  const moods: { rating: MoodRating, icon: any, color: string, label: string }[] = [
    { rating: 1, icon: Frown, color: 'text-red-400', label: 'ПЛОХО' },
    { rating: 3, icon: Meh, color: 'text-yellow-400', label: 'ОК' },
    { rating: 5, icon: Heart, color: 'text-pink-400', label: 'СУПЕР' },
  ]

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl p-6 hover:border-white/20 transition-all duration-500 h-[180px]">
      <div className="flex flex-col justify-between h-full">
        {/* Mood Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Smile className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Настроение</span>
          </div>
          <div className="flex gap-2">
            {moods.map((m) => (
              <button
                key={m.rating}
                onClick={() => onMoodUpdate(m.rating)}
                className={cn(
                  "flex-1 py-1.5 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1",
                  mood === m.rating 
                    ? "bg-white/10 border-white/20 scale-105" 
                    : "bg-white/5 border-white/5 opacity-30 hover:opacity-100"
                )}
              >
                <m.icon className={cn("w-4 h-4", mood === m.rating ? m.color : "text-white")} />
                <span className={cn("text-[7px] font-black uppercase tracking-tighter", mood === m.rating ? "text-white" : "text-white/20")}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Энергия</span>
            </div>
            <span className="text-[10px] font-bold text-orange-400/60 tabular-nums">{energy}/10</span>
          </div>
          <div className="flex gap-1 h-5">
            {Array.from({ length: 10 }).map((_, i) => {
                const val = i + 1
                return (
                    <button
                        key={val}
                        onClick={() => onEnergyUpdate(val)}
                        className={cn(
                            "flex-1 rounded-[4px] transition-all duration-300",
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
