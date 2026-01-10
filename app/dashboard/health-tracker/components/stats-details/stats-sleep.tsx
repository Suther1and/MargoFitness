"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Moon, Target, Award } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ReferenceLine } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { TrackerSettings } from "../../types"
import { serializeDateRange } from "../../utils/query-utils"

interface StatsSleepProps {
  userId: string | null
  settings: TrackerSettings
  dateRange: { start: Date; end: Date }
}

const chartConfig = { value: { label: "Часы сна", color: "#6366f1" } } satisfies ChartConfig

export const StatsSleep = memo(function StatsSleep({ userId, settings, dateRange }: StatsSleepProps) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data: rawData, isLoading, isFetching } = useQuery({
    queryKey: ['stats', 'sleep', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return null
      
      const supabase = createClient()
      const startStr = format(dateRange.start, 'yyyy-MM-dd')
      const endStr = format(dateRange.end, 'yyyy-MM-dd')
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('date, metrics')
        .eq('user_id', userId)
        .gte('date', startStr)
        .lt('date', endStr)
        .order('date', { ascending: true })
      
      if (error) return { success: false, data: [] }
      
      const sleepData = data?.map(entry => ({
        date: entry.date,
        hours: (entry.metrics as any)?.sleep || 0
      })) || []
      
      return { success: true, data: sleepData }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data)) return []
    
    return rawData.data.map((entry: any) => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      hours: entry.hours || 0
    }))
  }, [rawData])
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о сне...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Moon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о сне</h3>
          <p className="text-white/40 text-sm">Начните отслеживать сон в трекере</p>
        </div>
      </div>
    )
  }

  const avgHours = parseFloat((data.reduce((acc, day) => acc + day.hours, 0) / data.length).toFixed(1))
  const goal = settings.widgets.sleep?.goal || 8
  const bestSleep = data.reduce((max, day) => day.hours > max.hours ? day : max, data[0])
  const worstSleep = data.reduce((min, day) => day.hours < min.hours ? day : min, data[0])
  const daysWithGoodSleep = data.filter(day => day.hours >= 7).length
  
  // Регулярность режима - % дней в пределах ±1ч от среднего
  const sleepInRange = data.filter(day => Math.abs(day.hours - avgHours) <= 1).length
  const regularityPercent = Math.round((sleepInRange / data.length) * 100)
  
  // % дней с хорошим сном (≥7ч)
  const goodSleepPercent = Math.round((daysWithGoodSleep / data.length) * 100)

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
      <div className="space-y-6">
        {/* График */}
        <motion.div variants={item}>
          <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-white/5 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Качество сна</h3>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                    За выбранный период
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {avgHours.toFixed(1)}<span className="text-sm text-white/30 font-medium">ч</span>
                </div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-1">
                  Среднее время
                </p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                  tickMargin={12}
                />
                <ReferenceLine 
                  y={goal} 
                  stroke="#6366f1" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                  label={{ 
                    value: `Цель`, 
                    position: 'right',
                    fill: '#6366f1',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartContainer>
          </div>
        </motion.div>
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ качества сна</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* БЛОК 1: Главная оценка качества сна */}
          {avgHours >= goal && avgHours <= 9 ? (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-indigo-400 font-bold mb-1.5">⭐ Идеальный режим!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы спите <span className="font-bold text-white">{avgHours.toFixed(1)}ч</span> в среднем — это оптимально для восстановления. 
                    Организм получает достаточно времени для регенерации.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Здоровый сон
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgHours >= 7 && avgHours < goal ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 font-bold mb-1.5">✅ Хорошее качество сна</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее время сна <span className="font-bold text-white">{avgHours.toFixed(1)}ч</span> соответствует минимальной норме. 
                    Можно добавить еще 30-60 минут для улучшения восстановления.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                      В пределах нормы
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgHours >= 6 && avgHours < 7 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">⚠️ Недосып накапливается</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы спите <span className="font-bold text-white">{avgHours.toFixed(1)}ч</span> — это ниже рекомендованных 7-9 часов. 
                    Хронический недосып влияет на концентрацию, метаболизм и иммунитет.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Требует внимания
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgHours < 6 ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-bold mb-1.5">🚨 Критический дефицит сна</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее время сна <span className="font-bold text-white">{avgHours.toFixed(1)}ч</span> — опасно мало. 
                    Это серьезно влияет на здоровье, работоспособность и настроение. Необходимо срочно пересмотреть режим.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                      Критично
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-300 font-bold mb-1.5">💤 Возможна гиперсомния</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы спите <span className="font-bold text-white">{avgHours.toFixed(1)}ч</span> в среднем — это больше рекомендованных 9 часов. 
                    Избыточный сон может указывать на стресс, депрессию или недостаток качества сна.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      Много сна
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* БЛОК 2: Анализ стабильности */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Карточка А: Регулярность режима */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className={cn(
                  "w-4 h-4",
                  regularityPercent >= 75 ? "text-emerald-400" : regularityPercent >= 50 ? "text-blue-400" : "text-orange-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  regularityPercent >= 75 ? "text-emerald-400" : regularityPercent >= 50 ? "text-blue-400" : "text-orange-400"
                )}>Регулярность</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {regularityPercent >= 75 ? (
                  <>
                    <span className="font-bold text-white">Стабильный режим ✅</span><br />
                    {regularityPercent}% дней в норме — отличная дисциплина
                  </>
                ) : regularityPercent >= 50 ? (
                  <>
                    <span className="font-bold text-white">Умеренные колебания ⚡</span><br />
                    {regularityPercent}% дней в норме — можно улучшить
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Режим скачет ⚠️</span><br />
                    {regularityPercent}% дней в норме — нужна стабильность
                  </>
                )}
              </p>
            </div>

            {/* Карточка Б: Постоянство */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Award className={cn(
                  "w-4 h-4",
                  goodSleepPercent >= 80 ? "text-emerald-400" : goodSleepPercent >= 50 ? "text-blue-400" : "text-red-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  goodSleepPercent >= 80 ? "text-emerald-400" : goodSleepPercent >= 50 ? "text-blue-400" : "text-red-400"
                )}>Постоянство</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {goodSleepPercent >= 80 ? (
                  <>
                    <span className="font-bold text-white">Отличная дисциплина 🎯</span><br />
                    {goodSleepPercent}% дней — высокая стабильность
                  </>
                ) : goodSleepPercent >= 50 ? (
                  <>
                    <span className="font-bold text-white">Средняя стабильность 📊</span><br />
                    {goodSleepPercent}% дней — есть пропуски
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Низкая стабильность 📉</span><br />
                    {goodSleepPercent}% дней — нужен режим
                  </>
                )}
              </p>
            </div>
          </div>

          {/* БЛОК 3: Практические рекомендации */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Практические советы</span>
            </div>
            <div className="space-y-2">
              {avgHours < 7 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🎯 Ложитесь на 30 минут раньше каждую неделю, пока не достигнете 7-8 часов
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    📱 Убирайте телефон за час до сна — синий свет подавляет мелатонин
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    ☕ Последний кофе не позже 14:00
                  </p>
                </div>
              ) : regularityPercent < 50 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    ⏰ Установите будильник на одно и то же время — даже в выходные
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🌙 Ложитесь в одно время ±30 минут для стабилизации циркадных ритмов
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    💤 Создайте ритуал отхода ко сну (чтение, медитация, душ)
                  </p>
                </div>
              ) : avgHours > 9 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🔍 Проверьте качество сна — возможно, вы часто просыпаетесь ночью
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    ⚡ Добавьте физическую активность днем для повышения энергии
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🩺 Если усталость сохраняется при долгом сне — проконсультируйтесь с врачом
                  </p>
                </div>
              ) : avgHours >= 7 && avgHours <= 9 && regularityPercent >= 75 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    ✨ Поддерживайте текущий режим — он работает отлично
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    📊 Отслеживайте корреляцию сна с настроением и продуктивностью
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🎯 Экспериментируйте с временем пробуждения для нахождения своего оптимума
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🌡️ Температура в спальне 18-20°C — оптимально для сна
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🏃 Физическая активность днем улучшает сон, но не позже чем за 3 часа до сна
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🍽️ Легкий ужин за 2-3 часа до сна — тяжелая пища мешает засыпанию
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* БЛОК 4: Связь сна с другими метриками */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Влияние сна</span>
            </div>
            {avgHours < 7 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Исследования показывают: <span className="font-bold text-white">7-9ч</span> сна повышают продуктивность на 20-30%
                </p>
                <p className="text-[11px] text-white/50">
                  Каждый час недосыпа снижает когнитивные функции на 10%
                </p>
              </div>
            ) : avgHours >= 7 && avgHours <= 9 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Во сне происходит <span className="font-bold text-white">80% восстановления</span> мышц после тренировок
                </p>
                <p className="text-[11px] text-white/50">
                  Глубокий сон критичен для иммунной системы и гормонального баланса
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Хороший сон <span className="font-bold text-white">ускоряет метаболизм</span> и помогает контролировать вес
                </p>
                <p className="text-[11px] text-white/50">
                  Недосып повышает уровень кортизола — гормона стресса
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})
