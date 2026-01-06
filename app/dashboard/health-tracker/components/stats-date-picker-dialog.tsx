"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, subDays, subYears } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PeriodType, DateRange } from "../types"

interface StatsDatePickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onPeriodSelect: (periodType: PeriodType, dateRange: DateRange) => void
  currentPeriodType: PeriodType
  currentDateRange: DateRange
}

const PERIOD_BUTTONS = [
  { id: '7d' as PeriodType, label: '7 дней' },
  { id: '30d' as PeriodType, label: '30 дней' },
  { id: '6m' as PeriodType, label: '6 месяцев' },
  { id: '1y' as PeriodType, label: '1 год' },
]

export function StatsDatePickerDialog({ 
  isOpen, 
  onClose, 
  onPeriodSelect,
  currentPeriodType,
  currentDateRange
}: StatsDatePickerDialogProps) {
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
  const [activePeriod, setActivePeriod] = useState<PeriodType>(currentPeriodType)

  useEffect(() => {
    if (isOpen) {
      // Показываем текущий выбранный период
      setViewDate(currentDateRange.end)
      setSelectedStart(currentDateRange.start)
      setSelectedEnd(currentDateRange.end)
      setActivePeriod(currentPeriodType)
    }
  }, [isOpen, currentPeriodType, currentDateRange])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = addDays(calendarStart, 41) // 42 дня (6 недель)
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePeriodClick = (periodId: PeriodType) => {
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (periodId) {
      case '7d':
        start = subDays(today, 7)
        break
      case '30d':
        start = subDays(today, 30)
        break
      case '6m':
        start = subMonths(today, 6)
        break
      case '1y':
        start = subYears(today, 1)
        break
      default:
        return
    }

    onPeriodSelect(periodId, { start, end })
    onClose()
  }

  const handleDayClick = (day: Date) => {
    // Проверяем клик на галочку (вторую выбранную дату) - подтверждение
    if (selectedEnd && isSameDay(day, selectedEnd)) {
      onPeriodSelect('custom', { start: selectedStart!, end: selectedEnd })
      onClose()
      return
    }
    
    if (!selectedStart || selectedEnd) {
      // Первый клик или начало нового выбора
      setSelectedStart(day)
      setSelectedEnd(null)
      setActivePeriod('custom')
    } else {
      // Второй клик - устанавливаем конец периода
      const start = day < selectedStart ? day : selectedStart
      const end = day < selectedStart ? selectedStart : day
      
      setSelectedStart(start)
      setSelectedEnd(end)
    }
  }

  const isInRange = (day: Date) => {
    if (!selectedStart || !selectedEnd) return false
    return day > selectedStart && day < selectedEnd
  }

  const isRangeStart = (day: Date) => {
    return selectedStart && isSameDay(day, selectedStart)
  }

  const isRangeEnd = (day: Date) => {
    return selectedEnd && isSameDay(day, selectedEnd)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        variant="bottom" 
        className="p-0 overflow-hidden bg-[#121214]/95 backdrop-blur-2xl border-white/10 sm:max-w-md sm:mx-auto sm:rounded-[2.5rem] sm:bottom-6 rounded-t-[3rem] border-t border-x border-white/10"
      >
        <DialogHeader className="p-4 pb-3 border-b border-white/5">
          <DialogTitle className="text-lg font-oswald font-black uppercase tracking-wider text-center flex items-center justify-center gap-2.5">
            <Calendar className="w-4.5 h-4.5 text-sky-500" />
            Выберите период
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 pb-6 space-y-3">
          {/* Кнопки быстрого выбора периода */}
          <div className="flex bg-white/[0.03] p-1 rounded-[2rem] border border-white/5 backdrop-blur-md">
            {PERIOD_BUTTONS.map((period) => (
                <button
                key={period.id}
                onClick={() => handlePeriodClick(period.id)}
                className={cn(
                  "relative flex-1 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors duration-200 rounded-[1.5rem]",
                  activePeriod === period.id && activePeriod !== 'custom'
                    ? "text-black" 
                    : "text-white/40 hover:text-white/60"
                )}
              >
                {activePeriod === period.id && activePeriod !== 'custom' && (
                  <motion.div
                    layoutId="activePeriodPicker"
                    className="absolute inset-0 bg-sky-500 rounded-[1.5rem] shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{period.label}</span>
              </button>
            ))}
          </div>

          {/* Заголовок месяца с навигацией */}
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-white/60" />
            </button>
            
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {format(viewDate, 'LLLL yyyy', { locale: ru })}
            </span>

            <button
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>

          {/* Календарь */}
          <div className="w-full">
            <div className="grid grid-cols-7 gap-1">
              {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((d, i) => (
                <div 
                  key={`${d}-${i}`} 
                  className="text-[8px] font-black text-white/20 text-center pb-1.5 uppercase tracking-widest"
                >
                  {d}
                </div>
              ))}
              {monthDays.map((day, index) => {
                const isStart = isRangeStart(day)
                const isEnd = isRangeEnd(day)
                const isSelected = isStart || isEnd
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, viewDate)
                const inRange = isInRange(day)
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative aspect-square rounded-lg flex flex-col items-center justify-center transition-colors",
                      isSelected 
                        ? "bg-sky-500 text-black shadow-lg shadow-sky-500/30" 
                        : inRange
                        ? "bg-sky-500/20 text-white"
                        : "hover:bg-white/5",
                      !isCurrentMonth && !isSelected && !inRange && "opacity-30"
                    )}
                  >
                    {isEnd ? (
                      <Check className="w-4 h-4 text-black font-black" strokeWidth={3.5} />
                    ) : (
                      <span className={cn(
                        "text-xs font-black",
                        isSelected 
                          ? "text-black" 
                          : isCurrentMonth 
                          ? "text-white" 
                          : "text-white/40"
                      )}>
                        {format(day, 'd')}
                      </span>
                    )}
                    {!isSelected && isToday && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-sky-500" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

