"use client"

import { Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatsHeaderProps {
  activePeriod: string
  onPeriodChange: (period: string) => void
  onCalendarClick: () => void
}

const PERIODS = [
  { id: '7d', label: '7д' },
  { id: '30d', label: '30д' },
  { id: '6m', label: '6м' },
  { id: 'year', label: 'Год' },
]

export function StatsHeader({ activePeriod, onPeriodChange, onCalendarClick }: StatsHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {PERIODS.map((period) => (
            <button
              key={period.id}
              onClick={() => onPeriodChange(period.id)}
              className={cn(
                "relative px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl",
                activePeriod === period.id ? "text-black" : "text-white/40 hover:text-white/60"
              )}
            >
              {activePeriod === period.id && (
                <motion.div
                  layoutId="activePeriod"
                  className="absolute inset-0 bg-amber-500 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{period.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onCalendarClick}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95 group"
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Период</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-transform" />
        </button>
      </div>
    </div>
  )
}

