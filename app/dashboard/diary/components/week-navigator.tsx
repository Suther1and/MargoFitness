'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface WeekNavigatorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onCalendarClick?: () => void
}

export function WeekNavigator({ selectedDate, onDateChange, onCalendarClick }: WeekNavigatorProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex items-center gap-3">
      {/* Current Date Display */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
        <span className="text-sm font-medium text-white/80 capitalize">
          {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
        </span>
      </div>

      {/* Week Days */}
      <div className="flex items-center gap-2 px-2 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
        <button
          onClick={() => onDateChange(addDays(selectedDate, -7))}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/60" />
        </button>

        <div className="flex gap-1">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            
            return (
              <motion.button
                key={index}
                onClick={() => onDateChange(day)}
                className={cn(
                  "relative w-10 h-10 rounded-xl flex flex-col items-center justify-center",
                  "transition-all duration-200",
                  isSelected
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                    : "hover:bg-white/10 text-white/60"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-[10px] uppercase font-medium opacity-60">
                  {format(day, 'EEEEE', { locale: ru })}
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  isSelected ? "text-black" : "text-white"
                )}>
                  {format(day, 'd')}
                </span>
                
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                )}
              </motion.button>
            )
          })}
        </div>

        <button
          onClick={() => onDateChange(addDays(selectedDate, 7))}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Calendar Button */}
      {onCalendarClick && (
        <motion.button
          onClick={onCalendarClick}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CalendarIcon className="w-5 h-5 text-white/60" />
        </motion.button>
      )}
    </div>
  )
}

