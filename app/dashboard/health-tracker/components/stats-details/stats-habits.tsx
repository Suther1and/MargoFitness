"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Flame, Target, TrendingUp, Calendar, Zap, Award, CheckCircle2, PlusCircle } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { getHabitsStats } from "@/lib/actions/health-stats"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { serializeDateRange } from "../../utils/query-utils"
import { Habit, DateRange } from "../../types"

interface StatsHabitsProps {
  userId: string | null
  habits: Habit[]
  dateRange: DateRange
}

const chartConfig = {
  value: {
    label: "Выполнение",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsHabits({ userId, habits, dateRange }: StatsHabitsProps) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['stats', 'habits', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return null
      return await getHabitsStats(userId, dateRange)
    },
    enabled: !!userId && habits.length > 0,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const completionData = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data)) return []
    
    return rawData.data.map((entry: any) => {
      const completed = Object.values(entry.habits_completed || {}).filter(Boolean).length
      const total = habits.filter(h => h.enabled).length
      return {
        date: format(new Date(entry.date), 'd MMM', { locale: ru }),
        value: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    })
  }, [rawData, habits])
  
  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка статистики привычек...</p>
        </div>
      </div>
    )
  }
  
  // Фильтруем только активные привычки
  const activeHabits = habits.filter(h => h.enabled)
  
  // Рассчитываем количество дней в периоде
  const daysInPeriod = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
  
  // Рассчитываем РЕАЛЬНУЮ статистику из rawData
  const HABIT_STATS = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data) || activeHabits.length === 0) {
      return []
    }
    
    return activeHabits.map(habit => {
      let currentStreak = 0
      let maxStreak = 0
      let tempStreak = 0
      let totalCompleted = 0
      let totalDays = 0
      
      // Сортируем по дате (от новых к старым для streak)
      const sortedData = [...rawData.data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      sortedData.forEach((entry: any, index: number) => {
        const habitCompleted = entry.habits_completed?.[habit.id] === true
        totalDays++
        
        if (habitCompleted) {
          totalCompleted++
          tempStreak++
          if (index === 0) currentStreak = tempStreak // Текущая серия
          maxStreak = Math.max(maxStreak, tempStreak)
        } else {
          if (index === 0) currentStreak = 0
          tempStreak = 0
        }
      })
      
      return {
        id: habit.id,
        name: habit.title,
        completed: totalCompleted,
        total: totalDays,
        streak: currentStreak,
        maxStreak: maxStreak
      }
    })
  }, [rawData, activeHabits])
  
  const avgCompletion = completionData.length > 0 
    ? Math.round(completionData.reduce((acc, d) => acc + d.value, 0) / completionData.length)
    : 0
  
  // Форматируем период для отображения
  const periodLabel = daysInPeriod <= 7 ? 'Последние 7 дней' 
    : daysInPeriod <= 30 ? 'Последние 30 дней'
    : daysInPeriod <= 180 ? 'Последние 6 месяцев'
    : 'Последний год'
  
  // Определяем количество колонок для heatmap
  const heatmapCols = daysInPeriod <= 7 ? 'grid-cols-7'
    : daysInPeriod <= 30 ? 'grid-cols-10'
    : daysInPeriod <= 180 ? 'grid-cols-13'
    : 'grid-cols-15'
  
  const showWeekLabels = daysInPeriod <= 7
  
  // Реальная тепловая карта из completionData
  const heatmapData = useMemo(() => {
    if (completionData.length === 0) return []
    
    return completionData.map(day => ({
      value: day.value,
      label: day.date
    }))
  }, [completionData])
  
  const bestHabit = HABIT_STATS.length > 0 
    ? HABIT_STATS.reduce((max, habit) => habit.streak > max.streak ? habit : max, HABIT_STATS[0])
    : { name: "Привычки", streak: 0 }
  
  // Анализ выходных vs будни
  const { weekdayCompletion, weekendCompletion, weekendDrop } = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data)) {
      return { weekdayCompletion: 0, weekendCompletion: 0, weekendDrop: 0 }
    }
    
    const weekdayData: number[] = []
    const weekendData: number[] = []
    
    rawData.data.forEach((entry: any) => {
      const dayOfWeek = new Date(entry.date).getDay() // 0-вс, 1-пн, ..., 6-сб
      const completed = Object.values(entry.habits_completed || {}).filter(Boolean).length
      const total = activeHabits.length
      const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendData.push(completionPercent)
      } else {
        weekdayData.push(completionPercent)
      }
    })
    
    const weekdayAvg = weekdayData.length > 0
      ? Math.round(weekdayData.reduce((acc, val) => acc + val, 0) / weekdayData.length)
      : 0
    const weekendAvg = weekendData.length > 0
      ? Math.round(weekendData.reduce((acc, val) => acc + val, 0) / weekendData.length)
      : 0
    const drop = weekdayAvg > 0 
      ? Math.round(((weekdayAvg - weekendAvg) / weekdayAvg) * 100)
      : 0
    
    return { 
      weekdayCompletion: weekdayAvg, 
      weekendCompletion: weekendAvg, 
      weekendDrop: drop 
    }
  }, [rawData, activeHabits])
  // Слабые и средние привычки
  const { weakHabits, mediumHabits } = useMemo(() => {
    const weak = HABIT_STATS.filter(h => {
      const completion = h.total > 0 ? (h.completed / h.total) * 100 : 0
      return completion < 40
    })
    
    const medium = HABIT_STATS.filter(h => {
      const completion = h.total > 0 ? (h.completed / h.total) * 100 : 0
      return completion >= 40 && completion < 70
    })
    
    return { weakHabits: weak, mediumHabits: medium }
  }, [HABIT_STATS])
  
  const totalHabits = HABIT_STATS.length

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0     }
  }

  // Показываем сообщение, если нет активных привычек
  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 rounded-[2.5rem] border border-white/10 bg-white/[0.02] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
          <Flame className="w-7 h-7 text-amber-500/40" />
        </div>
        <h3 className="text-xl font-oswald font-black text-white/90 mb-2 text-center uppercase tracking-wider">Привычки не настроены</h3>
        <p className="text-[12px] text-white/30 text-center mb-8 max-w-[240px] leading-relaxed font-medium">
          Добавьте полезные привычки в настройках, чтобы отслеживать их выполнение и видеть здесь подробную аналитику
        </p>
        <button 
          onClick={() => {
            // Переход в настройки можно сделать через window.location или пропс, но здесь проще оставить как есть
            window.location.href = '/dashboard/health-tracker?tab=settings&subtab=habits'
          }}
          className="w-full max-w-[200px] py-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-500 font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <PlusCircle className="w-4 h-4" />
          Добавить привычки
        </button>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
    >
      <div className="space-y-6">
        {/* Объединенный блок: График + Тепловая карта */}
        <motion.div variants={item}>
          <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
            {/* ... содержимое Дисциплины ... */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-white/5 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Дисциплина</h3>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                    {periodLabel}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {avgCompletion}<span className="text-sm text-white/30 font-medium">%</span>
                </div>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-1">
                  Средний процент
                </p>
              </div>
            </div>

            {/* График */}
            {completionData.length > 0 && (
              <div className="mb-6">
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                  <BarChart data={completionData} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={10}
                      fontWeight="bold"
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    >
                      {completionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value >= 90 ? "#f59e0b" : entry.value >= 70 ? "rgba(245,158,11,0.6)" : "rgba(245,158,11,0.3)"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            )}

            {/* Тепловая карта активности */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  {periodLabel}
                </span>
                {/* Легенда */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-white/20 uppercase">Min</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-[2px] bg-white/5" />
                    <div className="w-2 h-2 rounded-[2px] bg-amber-500/30" />
                    <div className="w-2 h-2 rounded-[2px] bg-amber-500/60" />
                    <div className="w-2 h-2 rounded-[2px] bg-amber-500" />
                  </div>
                  <span className="text-[8px] font-bold text-white/20 uppercase">Max</span>
                </div>
              </div>

              <div className={cn("grid gap-2", heatmapCols)}>
                {heatmapData.map((data, i) => (
                  <div 
                    key={i}
                    className="aspect-square rounded-sm md:rounded-md transition-colors hover:scale-110 cursor-pointer"
                    style={{ 
                      backgroundColor: data.value > 80 ? 'rgba(245,158,11,0.8)' : 
                                       data.value > 50 ? 'rgba(245,158,11,0.5)' : 
                                       data.value > 20 ? 'rgba(245,158,11,0.25)' : 
                                       'rgba(255,255,255,0.05)'
                    }}
                    title={`${Math.round(data.value)}%`}
                  />
                ))}
              </div>

              {/* Подписи для дней недели */}
              {showWeekLabels && (
                <div className="grid grid-cols-7 gap-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <span key={day} className="text-[9px] font-black text-white/20 text-center uppercase">{day}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Список привычек (Стабильность) */}
        <motion.div variants={item} className="grid grid-cols-1 gap-4">
          <div className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Стабильность</span>
            </div>

            <div className="space-y-4">
              {HABIT_STATS.map((habit, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-10 rounded-full bg-amber-500/5 group-hover:bg-amber-500 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0)] group-hover:shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-tight">{habit.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-bold text-white/30 uppercase">{habit.streak} дней серия</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white tabular-nums leading-none">
                      {Math.round((habit.completed / habit.total) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Правая колонка: Персональные инсайты */}
      <motion.div variants={item} className="space-y-6">
        <div className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-white/5 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ дисциплины</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* БЛОК 1: Главная оценка дисциплины (5 вариантов) */}
            {avgCompletion >= 90 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Award className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-emerald-400 font-bold mb-1.5">🏆 Легендарная дисциплина!</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Средний процент <span className="font-bold text-white">{avgCompletion}%</span> — вы вошли в топ 5% людей по дисциплине! 
                      Привычки стали частью вашей личности.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                        Вы — образец для других
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : avgCompletion >= 75 ? (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-300 font-bold mb-1.5">🔥 Железная дисциплина</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Средний процент <span className="font-bold text-white">{avgCompletion}%</span> — отличный результат! 
                      Вы формируете устойчивые привычки, которые работают на ваши цели.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                        Продолжайте в том же духе
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : avgCompletion >= 60 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-300 font-bold mb-1.5">⚡ Стабильный прогресс</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Средний процент <span className="font-bold text-white">{avgCompletion}%</span> — хороший уровень! 
                      Привычки начинают приживаться, продолжайте наращивать стабильность.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Еще {75 - avgCompletion}% до высшего уровня
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : avgCompletion >= 40 ? (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <Target className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-orange-300 font-bold mb-1.5">🎯 Есть потенциал</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Средний процент <span className="font-bold text-white">{avgCompletion}%</span>. 
                      Вы на правильном пути! Начните с 2-3 простых привычек и постепенно добавляйте сложность.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                        Фокус на приоритетах
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <Target className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-300 font-bold mb-1.5">💪 Старт пути</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Средний процент <span className="font-bold text-white">{avgCompletion}%</span>. 
                      Формирование привычек требует времени. Сфокусируйтесь на 1-2 ключевых и выполняйте их каждый день минимум 2 недели.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                        Начните с малого
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* БЛОК 2: Анализ паттернов (2 карточки в гриде) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Карточка А: Лучшая привычка */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className={cn(
                    "w-4 h-4",
                    bestHabit.streak >= 21 ? "text-emerald-400" : 
                    bestHabit.streak >= 7 ? "text-blue-400" : "text-amber-400"
                  )} />
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    bestHabit.streak >= 21 ? "text-emerald-400" : 
                    bestHabit.streak >= 7 ? "text-blue-400" : "text-amber-400"
                  )}>
                    {bestHabit.streak >= 21 ? "Суперпривычка" : 
                     bestHabit.streak >= 7 ? "Крепкий навык" : "Формируется"}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {bestHabit.streak >= 21 ? (
                    <>
                      <span className="font-bold text-white">"{bestHabit.name}"</span> с серией{' '}
                      <span className="font-bold text-emerald-400">{bestHabit.streak} {bestHabit.streak === 1 ? 'день' : bestHabit.streak < 5 ? 'дня' : 'дней'}</span>{' '}
                      — это уже автоматизм! 🏆
                    </>
                  ) : bestHabit.streak >= 7 ? (
                    <>
                      <span className="font-bold text-white">"{bestHabit.name}"</span> с серией{' '}
                      <span className="font-bold text-blue-400">{bestHabit.streak} {bestHabit.streak === 1 ? 'день' : bestHabit.streak < 5 ? 'дня' : 'дней'}</span>{' '}
                      — отличный прогресс! 🔥
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-white">"{bestHabit.name}"</span> с серией{' '}
                      <span className="font-bold text-amber-400">{bestHabit.streak} {bestHabit.streak === 1 ? 'день' : bestHabit.streak < 5 ? 'дня' : 'дней'}</span>. 
                      Не прерывайте! 🌱
                    </>
                  )}
                </p>
              </div>

              {/* Карточка Б: Слабые места */}
              {weakHabits.length > 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Проблемные</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    <span className="font-bold text-white">
                      {weakHabits.slice(0, 1).map(h => `"${h.name}"`)}
                      {weakHabits.length > 1 && ` +${weakHabits.length - 1}`}
                    </span> менее 40% 🎯<br />
                    Упростите требования
                  </p>
                </div>
              ) : mediumHabits.length > 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Зона роста</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    <span className="font-bold text-white">"{mediumHabits[0].name}"</span><br />
                    На <span className="font-bold text-amber-400">{Math.round((mediumHabits[0].completed / mediumHabits[0].total) * 100)}%</span>. Уменьшите нагрузку 💡
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Все стабильны</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    <span className="font-bold text-white">Отличный баланс ✅</span><br />
                    Привычки закрепились
                  </p>
                </div>
              )}
            </div>

            {/* БЛОК 3: Практические рекомендации */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Практические советы</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {avgCompletion < 40 ? (
                  <>🎯 Сократите до <span className="font-bold text-white">1-2 привычек на 2 недели</span>. Лучше меньше, но стабильно.</>
                ) : avgCompletion >= 40 && avgCompletion < 60 && totalHabits > 5 ? (
                  <>🎯 У вас {totalHabits} привычек при {avgCompletion}%. Выберите <span className="font-bold text-white">3 ключевые</span> и сфокусируйтесь до 80%.</>
                ) : avgCompletion >= 60 && avgCompletion < 80 && weekendDrop > 20 ? (
                  <>🎯 В выходные падение на {weekendDrop}%. <span className="font-bold text-white">Перенесите сложные привычки на утро</span> субботы/воскресенья.</>
                ) : avgCompletion >= 60 && avgCompletion < 80 && weekendDrop <= 20 ? (
                  <>🎯 Отличная стабильность! Добавьте <span className="font-bold text-white">1 новую привычку</span>, связанную с целями.</>
                ) : (
                  <>🎯 Высокая дисциплина! Используйте привычки как <span className="font-bold text-white">фундамент для сложных целей</span> или наставничества.</>
                )}
              </p>
            </div>

            {/* БЛОК 4: Анализ выходных */}
            {weekendDrop !== 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={cn(
                    "w-4 h-4",
                    weekendDrop > 30 ? "text-red-400" : 
                    weekendDrop > 10 ? "text-amber-400" : "text-emerald-400"
                  )} />
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    weekendDrop > 30 ? "text-red-400" : 
                    weekendDrop > 10 ? "text-amber-400" : "text-emerald-400"
                  )}>Выходные</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {weekendDrop > 30 ? (
                    <>
                      <span className="font-bold text-white">-{weekendDrop}%</span> ({weekdayCompletion}→{weekendCompletion}%) 📉<br />
                      Нужен ритуал
                    </>
                  ) : weekendDrop > 10 ? (
                    <>
                      <span className="font-bold text-white">-{weekendDrop}%</span> ⚠️<br />
                      Планируйте заранее
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-white">Стабильно ✅</span><br />
                      {weekendCompletion}% как в будни
                    </>
                  )}
                </p>
              </div>
            )}

            {/* БЛОК 5: Образовательный */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Научный факт</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {avgCompletion < 50 ? (
                  <>
                    Для автоматизации нужно <span className="font-bold text-white">21-66 дней</span> в зависимости от сложности. 
                    Простые (вода, зарядка) — 21 день, сложные (медитация) — до 66.
                  </>
                ) : avgCompletion >= 50 && avgCompletion < 80 ? (
                  <>
                    <span className="font-bold text-white">"Habit Stacking"</span> — привязывайте новую привычку к существующей. 
                    Например: "После кофе → 10 приседаний".
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">"Atomic Habits"</span>: улучшение на 1% каждый день = рост в 37 раз за год. 
                    Качество важнее количества.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

