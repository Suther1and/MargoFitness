'use client'

import { motion } from 'framer-motion'
import { Footprints, Flame, MapPin, RefreshCw, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DiaryCard } from './diary-card'

interface StepsCardProps {
  steps: number
  goal: number
}

export function StepsCard({ steps, goal }: StepsCardProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const percentage = Math.min(Math.round((steps / goal) * 100), 100)
  const calories = Math.round(steps * 0.04)
  const distance = (steps * 0.0007).toFixed(1)

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2000)
  }

  return (
    <DiaryCard
      title="Активность"
      subtitle="Шаги и движение"
      icon={Footprints}
      iconColor="text-green-400"
      iconBg="bg-green-500/10"
      className="gap-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-4xl md:text-5xl font-oswald font-bold text-white tracking-tighter leading-none">
            {steps.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-white/40 uppercase text-[9px] font-bold tracking-[0.1em]">
            <span>Цель: {goal.toLocaleString()}</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-green-400/60">{percentage}%</span>
          </div>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[9px] font-bold uppercase tracking-widest text-white/60"
        >
          <RefreshCw className={cn("w-2.5 h-2.5", isSyncing && "animate-spin text-green-400")} />
          {isSyncing ? "..." : "Синхрон"}
        </button>
      </div>

      <div className="py-5">
        <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-500 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="group/item relative overflow-hidden bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Ккал</span>
          </div>
          <div className="text-xl font-bold text-white leading-none">{calories}</div>
        </div>

        <div className="group/item relative overflow-hidden bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Км</span>
          </div>
          <div className="text-xl font-bold text-white leading-none">{distance}</div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
         <Smartphone className="w-4 h-4 text-green-400/60" />
         <div className="text-[9px] text-white/40 uppercase tracking-tight">Apple Health • 12:45</div>
      </div>
    </DiaryCard>
  )
}
