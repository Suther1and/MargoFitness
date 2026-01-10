'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, endOfWeek, isSameMonth, addMonths, subMonths } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface WeekNavigatorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onCalendarClick?: () => void
  showDate?: boolean
  minimal?: boolean
  isExpanded?: boolean
  daysCount?: 1 | 3 | 7
  disableViewSwitch?: boolean
  minDate?: Date | null  // Минимальная доступная дата (дата регистрации)
  maxDate?: Date | null  // Максимальная доступная дата (сегодня)
}

export function WeekNavigator({ 
  selectedDate, 
  onDateChange, 
  onCalendarClick, 
  showDate = true,
  minimal = false,
  isExpanded = false,
  daysCount = 7,
  disableViewSwitch = false,
  minDate = null,
  maxDate = null
}: WeekNavigatorProps) {
  const [viewDate, setViewDate] = useState(selectedDate)

  // Синхронизируем viewDate при изменении selectedDate извне (например, при открытии)
  useEffect(() => {
    setViewDate(selectedDate)
  }, [selectedDate, isExpanded])

  // Функция проверки доступности даты
  const isDateDisabled = (date: Date): boolean => {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    
    // Проверяем минимальную дату (дата регистрации)
    if (minDate) {
      const minDateOnly = new Date(minDate)
      minDateOnly.setHours(0, 0, 0, 0)
      if (dateOnly < minDateOnly) return true
    }
    
    // Проверяем максимальную дату (сегодня)
    if (maxDate) {
      const maxDateOnly = new Date(maxDate)
      maxDateOnly.setHours(0, 0, 0, 0)
      if (dateOnly > maxDateOnly) return true
    }
    
    return false
  }
  
  // Тип недоступности: before = до регистрации, after = будущие дни
  const getDisabledType = (date: Date): 'before' | 'after' | null => {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    
    if (minDate) {
      const minDateOnly = new Date(minDate)
      minDateOnly.setHours(0, 0, 0, 0)
      if (dateOnly < minDateOnly) return 'before'
    }
    
    if (maxDate) {
      const maxDateOnly = new Date(maxDate)
      maxDateOnly.setHours(0, 0, 0, 0)
      if (dateOnly > maxDateOnly) return 'after'
    }
    
    return null
  }

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  
  // Определяем количество отображаемых дней
  const displayDays = daysCount === 1
    ? [selectedDate]
    : daysCount === 3
      ? [addDays(selectedDate, -1), selectedDate, addDays(selectedDate, 1)]
      : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = addDays(calendarStart, 41) // Всегда 42 дня (6 недель), чтобы высота не прыгала
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handleMonthPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(subMonths(viewDate, 1))
  }

  const handleMonthNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(addMonths(viewDate, 1))
  }

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
          {!isExpanded || disableViewSwitch ? (
            <motion.div
              key="week"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center w-full gap-2"
            >
              {!minimal && (
                <button
                  onClick={() => onDateChange(addDays(selectedDate, -7))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 group"
                >
                  <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </button>
              )}

              <div className={cn("flex items-center flex-1", minimal ? (daysCount === 3 ? "gap-2" : "justify-between gap-0.5") : "gap-1 justify-center")}>
                {displayDays.map((day, index) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  const disabled = isDateDisabled(day)
                  const disabledType = getDisabledType(day)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !disabled && onDateChange(day)}
                      disabled={disabled}
                      className={cn(
                        "relative rounded-xl flex flex-col items-center justify-center transform-gpu transition-colors",
                        minimal 
                          ? (daysCount === 3 ? "w-11 h-12" : "flex-1 max-w-[40px] h-12") 
                          : "w-9 h-14",
                        minimal && "bg-white/5 border border-white/5",
                        disabled && "cursor-not-allowed opacity-40",
                        !disabled && isSelected
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 border-transparent"
                          : !disabled && "hover:bg-white/10 text-white/60"
                      )}
                    >
                      <span className={cn(
                          "uppercase font-black tracking-widest mt-1",
                          minimal ? "text-[7px]" : "text-[8px]",
                          isSelected ? "text-black/40" : "text-white/20"
                      )}>
                        {format(day, 'EEEEEE', { locale: ru })}
                      </span>
                      <span className={cn(
                        "font-black leading-none -mt-1",
                        minimal ? "text-base" : "text-base",
                        isSelected ? "text-black" : "text-white"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      <div className={cn("absolute bottom-1 flex gap-0.5 h-1 items-center")}>
                        {isToday && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-amber-500" />
                        )}
                      </div>
                    </button>
                  )
                })}

                {minimal && onCalendarClick && (
                  <button
                    onClick={onCalendarClick}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border shrink-0 group ml-1 transition-colors",
                      isExpanded 
                        ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown className={cn(
                        "w-4 h-4",
                        isExpanded 
                          ? "text-black" 
                          : "text-white/40 group-hover:text-white"
                      )} />
                    </motion.div>
                  </button>
                )}
              </div>

              {!minimal && (
                <button
                  onClick={() => onDateChange(addDays(selectedDate, 7))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 group"
                >
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="month"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              {/* Заголовок месяца с навигацией */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  onClick={handleMonthPrev}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </button>
                
                <span className="text-sm font-black text-white/90 uppercase tracking-wider">
                  {format(viewDate, 'LLLL yyyy', { locale: ru })}
                </span>
                
                <button
                  onClick={handleMonthNext}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-[9px] font-black text-white/20 text-center pb-2 uppercase tracking-widest">{d}</div>
                ))}
                {monthDays.map((day, index) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = isSameMonth(day, viewDate)
                  const disabled = isDateDisabled(day)
                  const disabledType = getDisabledType(day)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !disabled && onDateChange(day)}
                      disabled={disabled}
                      className={cn(
                        "relative aspect-square rounded-lg flex flex-col items-center justify-center transition-colors",
                        disabled && "cursor-not-allowed opacity-40",
                        !disabled && isSelected && "bg-amber-500 text-black shadow-lg",
                        !disabled && !isSelected && "hover:bg-white/5",
                        !isCurrentMonth && !disabled && "opacity-30",
                        !isCurrentMonth && disabled && "opacity-20"
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
        <button
          onClick={onCalendarClick}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <CalendarIcon className="w-5 h-5 text-white/60" />
        </button>
      )}
    </div>
  )
}

