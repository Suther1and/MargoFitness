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
        <div className="flex bg-white/[0.03] p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-md">
          {PERIODS.map((period) => (
            <button
              key={period.id}
              onClick={() => onPeriodChange(period.id)}
              className={cn(
                "relative px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-200 rounded-[1.5rem]",
                activePeriod === period.id ? "text-black" : "text-white/40 hover:text-white/60"
              )}
            >
              {activePeriod === period.id && (
                <motion.div
                  layoutId="activePeriod"
                  className="absolute inset-0 bg-amber-500 rounded-[1.5rem] shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{period.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onCalendarClick}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-[2rem] transition-colors duration-200 active:scale-95 group backdrop-blur-md"
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Период</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
        </button>
      </div>
    </div>
  )
}

