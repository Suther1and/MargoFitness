'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, endOfWeek, addMonths, isSameMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface WeekNavigatorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onCalendarClick?: () => void
  showDate?: boolean
  minimal?: boolean
  isExpanded?: boolean
}

export function WeekNavigator({ 
  selectedDate, 
  onDateChange, 
  onCalendarClick, 
  showDate = true,
  minimal = false,
  isExpanded = false
}: WeekNavigatorProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Month grid calculation
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const content = (
    <div className="w-full">
      <motion.div 
        layout
        className={cn(
            "w-full",
            !minimal && "px-2 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md"
        )}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="week"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center w-full justify-center gap-0"
            >
              <button
                onClick={() => onDateChange(addDays(selectedDate, -7))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 group"
              >
                <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </button>

              <div className="flex gap-1 items-center px-0.5 flex-1 justify-center">
                {weekDays.map((day, index) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => onDateChange(day)}
                      className={cn(
                        "relative w-9 h-14 rounded-xl flex flex-col items-center justify-center pt-1 pb-2",
                        "transition-all duration-200",
                        isSelected
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                          : "hover:bg-white/5 text-white/60"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className={cn(
                          "text-[8px] uppercase font-black tracking-widest mb-1",
                          isSelected ? "text-black/40" : "text-white/20"
                      )}>
                        {format(day, 'EEEEEE', { locale: ru })}
                      </span>
                      <span className={cn(
                        "text-base font-black leading-none",
                        isSelected ? "text-black" : "text-white"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      <div className="absolute bottom-2 flex gap-0.5 h-1 items-center">
                        {isToday && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-amber-500" />
                        )}
                        {!isToday && !isSelected && (
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            Math.random() > 0.5 ? "bg-green-500" : "bg-red-500"
                          )} />
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <button
                onClick={() => onDateChange(addDays(selectedDate, 7))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 group"
              >
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="month"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <div className="grid grid-cols-7 gap-1">
                {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-[9px] font-black text-white/20 text-center pb-2 uppercase tracking-widest">{d}</div>
                ))}
                {monthDays.map((day, index) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = isSameMonth(day, selectedDate)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => onDateChange(day)}
                      className={cn(
                        "relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all",
                        isSelected ? "bg-amber-500 text-black shadow-lg" : "hover:bg-white/5",
                        !isCurrentMonth && "opacity-10"
                      )}
                    >
                      <span className={cn(
                        "text-[13px] font-black",
                        isSelected ? "text-black" : isCurrentMonth ? "text-white" : "text-white/40"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {!isSelected && (
                        <div className="absolute bottom-1.5 flex gap-0.5">
                            {isToday && <div className="w-1 h-1 rounded-full bg-amber-500" />}
                            {!isToday && isCurrentMonth && (
                                <div className={cn("w-1 h-1 rounded-full", Math.random() > 0.5 ? "bg-green-500" : "bg-red-500")} />
                            )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )

  if (minimal) return content

  return (
    <div className="flex items-center gap-3">
      {/* Current Date Display */}
      {showDate && (
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
          <span className="text-sm font-medium text-white/80 capitalize">
            {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
          </span>
        </div>
      )}

      {content}

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

