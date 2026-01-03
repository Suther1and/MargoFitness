'use client'

import { motion } from 'framer-motion'
import { Droplets, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiaryCard } from './diary-card'

interface WaterCardProps {
  value: number
  goal: number
  onUpdate: (value: number) => void
}

export function WaterCard({ value, goal, onUpdate }: WaterCardProps) {
  const percentage = Math.min(Math.round((value / goal) * 100), 100)

  return (
    <DiaryCard
      title="Вода"
      subtitle="Гидратация организма"
      icon={Droplets}
      iconColor="text-blue-400"
      iconBg="bg-blue-500/10"
      className="justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl font-bold text-white tracking-tight leading-none">
          {value} <span className="text-base font-normal text-white/40">мл</span>
        </div>
        <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Цель: {goal}</div>
      </div>

      <div className="relative h-32 flex items-center justify-center py-2">
        <div className="relative w-28 h-28">
            {/* Circular Progress */}
            <svg className="w-full h-full -rotate-90 transform">
              <circle
                cx="56"
                cy="56"
                r="50"
                className="stroke-white/5"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="50"
                className="stroke-blue-500"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "314", strokeDashoffset: "314" }}
                animate={{ strokeDashoffset: 314 - (314 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white font-oswald">{percentage}%</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => onUpdate(Math.max(0, value - 250))}
          className="py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[9px] font-bold text-white/40 uppercase tracking-widest"
        >
          -250 мл
        </button>
        <button
          onClick={() => onUpdate(value + 250)}
          className="py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all text-[9px] font-bold uppercase tracking-widest"
        >
          +250 мл
        </button>
      </div>
    </DiaryCard>
  )
}
