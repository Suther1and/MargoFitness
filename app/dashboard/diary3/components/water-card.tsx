'use client'

import { motion } from 'framer-motion'
import { Droplets, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiaryCard } from './diary-card'
import { useState } from 'react'

interface WaterCardProps {
  value: number
  goal: number
  onUpdate: (value: number) => void
}

export function WaterCard({ value, goal, onUpdate }: WaterCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value.toString())
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
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <input
            type="number"
            value={tempValue}
            autoFocus
            className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-2xl font-bold text-white outline-none"
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
              onUpdate(parseInt(tempValue) || 0)
              setIsEditing(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUpdate(parseInt(tempValue) || 0)
                setIsEditing(false)
              }
            }}
          />
        ) : (
          <div 
            className="text-3xl font-bold text-white tracking-tight leading-none cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => {
              setTempValue(value.toString())
              setIsEditing(true)
            }}
          >
            {value} <span className="text-base font-normal text-white/40">мл</span>
          </div>
        )}
        <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Цель: {goal}</div>
      </div>

      <div className="relative h-28 flex items-center justify-center py-2">
        <div className="relative w-24 h-24">
            {/* Circular Progress */}
            <svg className="w-full h-full -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r="44"
                className="stroke-white/5"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="44"
                className="stroke-blue-500"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "276", strokeDashoffset: "276" }}
                animate={{ strokeDashoffset: 276 - (276 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white font-oswald">{percentage}%</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => onUpdate(Math.max(0, value - 250))}
          className="py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[9px] font-bold text-white/40 uppercase tracking-widest"
        >
          -250
        </button>
        <button
          onClick={() => onUpdate(value + 250)}
          className="relative py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all text-[9px] font-bold uppercase tracking-widest overflow-hidden group"
        >
          <span className="relative z-10">+250</span>
        </button>
      </div>
    </DiaryCard>
  )
}
