"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Footprints, TrendingUp, TrendingDown, Target, Award, Flame, MapPin, Clock } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, ReferenceLine, ComposedChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getStepsStats } from "@/lib/actions/health-stats"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { TrackerSettings } from "../../types"

interface StatsStepsProps {
  settings: TrackerSettings
  dateRange: { start: Date; end: Date }
}

const chartConfig = {
  value: {
    label: "Шаги",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function StatsSteps({ settings, dateRange }: StatsStepsProps) {
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    async function getUserId() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUserId()
  }, [])

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['stats', 'steps', userId, dateRange],
    queryFn: async () => {
      if (!userId) return null
      return await getStepsStats(userId, dateRange)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data) return []
    
    return rawData.data.map(entry => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      value: entry.steps || 0,
      goal: settings.widgets.steps?.goal || 10000,
      // Расчетные метрики
      calories: Math.round((entry.steps || 0) * 0.04), // ~0.04 kcal за шаг
      distance: ((entry.steps || 0) * 0.0008).toFixed(1), // ~0.8м за шаг = 0.0008 км
      time: Math.round((entry.steps || 0) / 100) // ~100 шагов в минуту
    }))
  }, [rawData, settings.widgets.steps?.goal])
  
  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о шагах...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Footprints className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о шагах</h3>
          <p className="text-white/40 text-sm">Начните отслеживать шаги в трекере</p>
        </div>
      </div>
    )
  }
  
  const goal = settings.widgets.steps?.goal || 10000
  const totalSteps = data.reduce((acc, day) => acc + day.value, 0)
  const avgDaily = Math.round(totalSteps / data.length)
  const bestDay = data.reduce((max, day) => day.value > max.value ? day : max, data[0])
  const worstDay = data.reduce((min, day) => day.value < min.value ? day : min, data[0])
  const daysAchieved = data.filter(day => day.value >= goal).length
  const achievementRate = Math.round((daysAchieved / data.length) * 100)
  
  // Дополнительные метрики
  const totalCalories = data.reduce((acc, day) => acc + day.calories, 0)
  const totalDistance = data.reduce((acc, day) => acc + parseFloat(day.distance), 0)
  const totalTime = data.reduce((acc, day) => acc + day.time, 0)
  const avgCalories = Math.round(totalCalories / data.length)
  const avgDistance = (totalDistance / data.length).toFixed(1)
  
  // Тренд (сравнение первой и второй половины периода)
  const firstHalf = data.slice(0, Math.ceil(data.length / 2))
  const secondHalf = data.slice(Math.ceil(data.length / 2))
  const avgFirstHalf = firstHalf.reduce((acc, d) => acc + d.value, 0) / firstHalf.length
  const avgSecondHalf = secondHalf.reduce((acc, d) => acc + d.value, 0) / secondHalf.length
  const trend = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf * 100).toFixed(1)

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
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
    >
      <div className="space-y-6">
        {/* Главный график */}
        <motion.div variants={item}>
          <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-white/5 flex items-center justify-center">
                  <Footprints className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Динамика шагов</h3>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                    За выбранный период
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {avgDaily.toLocaleString()}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {parseFloat(trend) > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">+{trend}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-orange-400" />
                      <span className="text-xs font-bold text-orange-400">{trend}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <ComposedChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="successBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="warningBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="dangerBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  vertical={false} 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.03)"
                />
                
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  fontWeight="bold"
                />
                
                {/* Линия цели */}
                <ReferenceLine 
                  y={goal} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                  label={{ 
                    value: `Цель`, 
                    position: 'right',
                    fill: '#3b82f6',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}
                />
                
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-black/90 border border-white/20 rounded-xl p-3 backdrop-blur-xl">
                          <p className="text-xs font-bold text-white/60 mb-2">{data.date}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Footprints className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-sm font-bold text-white">{data.value.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span className="text-xs text-white/80">{data.calories} ккал</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-xs text-white/80">{data.distance} км</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-xs text-white/80">{data.time} мин</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                >
                  {data.map((entry, index) => {
                    const fillColor = entry.value >= goal 
                      ? "url(#successBar)" 
                      : entry.value >= goal * 0.7 
                      ? "url(#warningBar)" 
                      : "url(#dangerBar)"
                    
                    return <Cell key={`cell-${index}`} fill={fillColor} />
                  })}
                </Bar>
              </ComposedChart>
            </ChartContainer>
          </div>
        </motion.div>
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">На основе вашей активности</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {avgDaily >= goal ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">🎉 Превосходная активность!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы превышаете дневную цель на <span className="font-bold text-white">{((avgDaily - goal) / goal * 100).toFixed(0)}%</span>. 
                    Это выдающийся результат!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      +{(avgDaily - goal).toLocaleString()} шагов сверх нормы
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">Потенциал для роста</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    До цели осталось <span className="font-bold text-white">{(goal - avgDaily).toLocaleString()}</span> шагов в день. 
                    Это всего <span className="font-bold text-amber-300">{Math.round((goal - avgDaily) / 100) * 10}</span> минут ходьбы!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      ≈ {((goal - avgDaily) * 0.0008).toFixed(1)} км до цели
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Дополнительные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Дистанция</span>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-white/60">
                  Всего пройдено: <span className="font-bold text-white">{totalDistance.toFixed(1)} км</span>
                </p>
                <p className="text-[11px] text-white/60">
                  В среднем: <span className="font-bold text-white">{avgDistance} км/день</span>
                </p>
                <p className="text-[10px] text-white/40 mt-1">
                  {parseFloat(avgDistance) >= 8 
                    ? "Превосходно! Рекомендованная норма достигнута."
                    : parseFloat(avgDistance) >= 5
                    ? "Хорошо! Можно добавить еще немного."
                    : "Старайтесь увеличить дистанцию до 5-8 км/день."}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Энергия</span>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-white/60">
                  Всего сожжено: <span className="font-bold text-white">{totalCalories} ккал</span>
                </p>
                <p className="text-[11px] text-white/60">
                  В среднем: <span className="font-bold text-white">{avgCalories} ккал/день</span>
                </p>
                <p className="text-[10px] text-white/40 mt-1">
                  {avgCalories >= 400 
                    ? "Отличное сжигание калорий!"
                    : avgCalories >= 300
                    ? "Хорошая активность, продолжайте!"
                    : "Увеличьте активность для лучших результатов."}
                </p>
              </div>
            </div>
          </div>

          {/* Анализ лучших/худших дней */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Самый активный:</span>
                <span className="font-bold text-emerald-400">{bestDay.date} — {bestDay.value.toLocaleString()} шагов</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Требует внимания:</span>
                <span className="font-bold text-orange-400">{worstDay.date} — {worstDay.value.toLocaleString()} шагов</span>
              </div>
              {worstDay.value < goal * 0.7 && (
                <p className="text-[11px] text-white/50 mt-2 pt-2 border-t border-white/10">
                  💡 Совет: Запланируйте активность на {worstDay.date}, чтобы выровнять недельную статистику
                </p>
              )}
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Цель на следующую неделю</span>
            </div>
            <div className="space-y-2">
              {achievementRate < 50 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Начните с малого: добавьте <span className="font-bold text-white">2000 шагов</span> к текущему среднему. 
                  Короткие прогулки 3 раза в день помогут достичь цели.
                </p>
              )}
              {achievementRate >= 50 && achievementRate < 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Вы близки к успеху! Увеличьте активность в самые слабые дни на <span className="font-bold text-white">1500 шагов</span>, 
                  чтобы достичь 80% выполнения цели.
                </p>
              )}
              {achievementRate >= 80 && avgDaily < goal * 1.2 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Отличный результат! Попробуйте новую цель: <span className="font-bold text-white">12,000 шагов</span> в день 
                  для максимальной пользы здоровью.
                </p>
              )}
              {avgDaily >= goal * 1.2 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Вы превзошли все ожидания! Поддерживайте текущий уровень и добавьте силовые упражнения 
                  для комплексного подхода к здоровью.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

