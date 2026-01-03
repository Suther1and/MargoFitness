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

  const getEnergyIcon = (val: number) => {
    if (val <= 3) return BatteryLow
    if (val <= 7) return BatteryMedium
    return BatteryFull
  }

  const EnergyIcon = getEnergyIcon(energy)

  return (
    <DiaryCard
      title="Настроение"
      subtitle="Эмоции и Энергия"
      icon={Smile}
      iconColor="text-yellow-400"
      iconBg="bg-yellow-500/10"
      className="gap-4"
    >
      {/* Mood Selector - Vertical/Compact grid for sidebar */}
      <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        {moods.map((m) => {
          const Icon = m.icon
          const isSelected = mood === m.rating
          return (
            <button
              key={m.rating}
              onClick={() => onMoodUpdate(m.rating)}
              className={cn(
                "relative flex items-center justify-center py-2.5 rounded-lg transition-all",
                isSelected ? "bg-white/10" : "hover:bg-white/5 opacity-40 hover:opacity-80"
              )}
            >
              <Icon className={cn("w-4 h-4", isSelected ? m.color : "text-white")} />
            </button>
          )
        })}
      </div>

      {/* Energy Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Энергия: {energy}</span>
        </div>

        <div className="relative h-7 bg-white/5 rounded-lg border border-white/5 p-1 flex items-center overflow-hidden">
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={energy * 10}
            onChange={(e) => onEnergyUpdate(Math.ceil(parseInt(e.target.value) / 10))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div 
            className="h-full rounded-md bg-gradient-to-r from-orange-600 to-orange-400"
            animate={{ width: `${energy * 10}%` }}
          />
        </div>
      </div>
    </DiaryCard>
  )
}
