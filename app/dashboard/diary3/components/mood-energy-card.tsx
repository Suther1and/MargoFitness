'use client'

import { motion } from 'framer-motion'
import { Smile, Zap, Frown, Meh, Heart, Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoodRating } from '../types'
import { DiaryCard } from './diary-card'

interface MoodEnergyCardProps {
  mood: MoodRating | null
  energy: number
  onMoodUpdate: (mood: MoodRating) => void
  onEnergyUpdate: (energy: number) => void
}

export function MoodEnergyCard({ mood, energy, onMoodUpdate, onEnergyUpdate }: MoodEnergyCardProps) {
  const moods: { rating: MoodRating, icon: any, label: string, color: string, bg: string }[] = [
    { rating: 1, icon: Frown, label: 'Ужасно', color: 'text-red-400', bg: 'bg-red-400/10' },
    { rating: 2, icon: Frown, label: 'Плохо', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { rating: 3, icon: Meh, label: 'Ок', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { rating: 4, icon: Smile, label: 'Хорошо', color: 'text-green-400', bg: 'bg-green-400/10' },
    { rating: 5, icon: Heart, label: 'Супер', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ]

  return (
    <DiaryCard
      title="Состояние"
      subtitle="Настроение и Энергия"
      icon={Smile}
      iconColor="text-yellow-400"
      iconBg="bg-yellow-500/10"
      className="gap-5"
    >
      {/* Mood Selector */}
      <div className="space-y-2">
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest px-1">Настроение</span>
        <div className="grid grid-cols-5 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
          {moods.map((m) => {
            const Icon = m.icon
            const isSelected = mood === m.rating
            return (
              <button
                key={m.rating}
                onClick={() => onMoodUpdate(m.rating)}
                className={cn(
                  "relative flex flex-col items-center py-2.5 rounded-lg transition-all",
                  isSelected ? "bg-white/10" : "hover:bg-white/5 opacity-40 hover:opacity-100"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform", isSelected ? m.color : "text-white")} />
                <span className={cn("text-[8px] font-black mt-1 uppercase tracking-widest", isSelected ? m.color : "text-white/20")}>
                    {m.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Energy Grid */}
      <div className="space-y-2">
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest px-1">Энергия</span>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
                key={i}
                onClick={() => onEnergyUpdate(i + 1)}
                className={cn(
                    "h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition-all",
                    energy === i + 1 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105" 
                        : "bg-white/5 text-white/20 hover:text-white/40 border border-white/5"
                )}
            >
                {i + 1}
            </button>
          ))}
        </div>
      </div>
    </DiaryCard>
  )
}
