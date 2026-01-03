'use client'

import { motion } from 'framer-motion'
import { Moon, Clock, Bed, Sun, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiaryCard } from './diary-card'
import { useState, useEffect } from 'react'

interface SleepCardProps {
  hours: number
  quality: number
  onUpdate: (hours: number) => void
  onQualityUpdate: (quality: number) => void
}

export function SleepCard({ hours, quality, onUpdate, onQualityUpdate }: SleepCardProps) {
  const [startTime, setStartTime] = useState("23:00")
  const [endTime, setEndTime] = useState("07:00")

  useEffect(() => {
    const [sH, sM] = startTime.split(':').map(Number)
    const [eH, eM] = endTime.split(':').map(Number)
    
    let diff = (eH * 60 + eM) - (sH * 60 + sM)
    if (diff < 0) diff += 24 * 60
    
    const calculatedHours = Number((diff / 60).toFixed(1))
    if (calculatedHours !== hours) {
      onUpdate(calculatedHours)
    }
  }, [startTime, endTime])

  const qualityLevels = [
    { label: 'Разбит', value: 30, icon: '😫', color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Норма', value: 70, icon: '😊', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Бодр', value: 100, icon: '⚡', color: 'text-green-400', bg: 'bg-green-400/10' },
  ]

  return (
    <DiaryCard
      title="Сон"
      subtitle="График отдыха"
      icon={Moon}
      iconColor="text-purple-400"
      iconBg="bg-purple-500/10"
      className="gap-6"
    >
      <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center border-b border-white/5">
            <div className="flex-1 p-3 space-y-1">
                <div className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase tracking-widest">
                    <Bed className="w-3 h-3" />
                    Лег
                </div>
                <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-transparent border-none p-0 text-lg font-bold text-white outline-none cursor-pointer hover:text-purple-400 transition-colors w-full"
                />
            </div>
            <div className="flex-1 p-3 space-y-1 text-right border-l border-white/5">
                <div className="flex items-center justify-end gap-2 text-[8px] font-black text-white/20 uppercase tracking-widest">
                    Проснулся
                    <Sun className="w-3 h-3" />
                </div>
                <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-transparent border-none p-0 text-lg font-bold text-white outline-none cursor-pointer hover:text-purple-400 transition-colors w-full"
                />
            </div>
        </div>
        
        <div className="p-2 bg-purple-500/10 flex items-center justify-center gap-2">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Всего:</span>
            <div className="text-xl font-oswald font-black text-white">{hours}ч</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Как вы себя чувствуете?</span>
            <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
        </div>
        <div className="flex gap-2">
          {qualityLevels.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => onQualityUpdate(lvl.value)}
              className={cn(
                "flex-1 group relative flex flex-col items-center py-2.5 rounded-xl transition-all duration-300",
                quality === lvl.value 
                  ? cn(lvl.bg, "border border-white/10 scale-105 shadow-xl") 
                  : "bg-white/5 border border-transparent opacity-40 hover:opacity-100"
              )}
            >
              <span className="text-lg mb-0.5">{lvl.icon}</span>
              <span className={cn("text-[7px] font-black uppercase tracking-widest", quality === lvl.value ? "text-white" : "text-white/40")}>
                {lvl.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </DiaryCard>
  )
}
