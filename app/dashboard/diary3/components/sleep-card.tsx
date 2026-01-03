'use client'

import { motion } from 'framer-motion'
import { Moon, Star, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiaryCard } from './diary-card'

interface SleepCardProps {
  hours: number
  quality: number
  onUpdate: (hours: number) => void
}

export function SleepCard({ hours, quality, onUpdate }: SleepCardProps) {
  const goal = 8
  const percentage = Math.min((hours / goal) * 100, 100)

  return (
    <DiaryCard
      title="Сон"
      subtitle="Восстановление"
      icon={Moon}
      iconColor="text-purple-400"
      iconBg="bg-purple-500/10"
      className="justify-between"
    >
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col">
            <div className="text-3xl font-bold text-white tracking-tight leading-none">
                {hours} <span className="text-base font-normal text-white/40">ч</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                <Clock className="w-3 h-3 text-purple-400" />
                Цель: {goal}ч
            </div>
        </div>
        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">
            {hours >= 8 ? 'Идеально' : 'Норма'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Visual */}
        <div className="relative">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(hours / 12) * 100}%` }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-400"
                />
            </div>
        </div>

        {/* Quality Selector (Simple) */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Качество: {quality}%</span>
            </div>
            <div className="flex justify-between gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "flex-1 h-1 rounded-full",
                            i <= Math.round(quality / 20) ? "bg-purple-500" : "bg-white/5"
                        )}
                    />
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdate(Math.max(0, hours - 0.5))}
            className="py-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[9px] font-bold text-white/40 uppercase tracking-widest"
          >
            -0.5ч
          </button>
          <button
            onClick={() => onUpdate(hours + 0.5)}
            className="py-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[9px] font-bold text-white/40 uppercase tracking-widest"
          >
            +0.5ч
          </button>
        </div>
      </div>
    </DiaryCard>
  )
}
