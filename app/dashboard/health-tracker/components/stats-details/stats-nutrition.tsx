"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Utensils, Target, Award, TrendingDown, TrendingUp, Scale, Flame } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ReferenceLine, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { getNutritionStats } from "@/lib/actions/health-stats"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { TrackerSettings, NutritionGoalType } from "../../types"
import { serializeDateRange } from "../../utils/query-utils"

interface StatsNutritionProps {
  userId: string | null
  settings: TrackerSettings
  dateRange: { start: Date; end: Date }
}

const chartConfig = { calories: { label: "Калории", color: "#8b5cf6" } } satisfies ChartConfig

// Функция валидации цели по питанию
const isNutritionGoalSuccess = (
  current: number,
  goal: number,
  goalType: NutritionGoalType
): 'success' | 'warning' | 'danger' => {
  const percentage = (current / goal) * 100

  switch (goalType) {
    case 'loss': // Похудение
      if (percentage >= 80 && percentage <= 100) return 'success'
      if ((percentage >= 70 && percentage < 80) || (percentage > 100 && percentage <= 110)) return 'warning'
      return 'danger'

    case 'maintain': // Баланс
      if (percentage >= 90 && percentage <= 110) return 'success'
      if ((percentage >= 80 && percentage < 90) || (percentage > 110 && percentage <= 120)) return 'warning'
      return 'danger'

    case 'gain': // Набор
      if (percentage >= 100 && percentage <= 120) return 'success'
      if ((percentage >= 90 && percentage < 100) || (percentage > 120 && percentage <= 130)) return 'warning'
      return 'danger'
  }
}

export const StatsNutrition = memo(function StatsNutrition({ userId, settings, dateRange }: StatsNutritionProps) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['stats', 'nutrition', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return null
      return await getNutritionStats(userId, dateRange)
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data)) return []
    
    return rawData.data.map((entry: any) => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      calories: entry.calories || 0,
      goal: settings.widgets.nutrition?.goal || 2000,
      nutritionGoalType: (entry.nutritionGoalType || 'maintain') as NutritionGoalType
    }))
  }, [rawData, settings.widgets.nutrition?.goal])
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-400/20 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о питании...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Utensils className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о питании</h3>
          <p className="text-white/40 text-sm">Начните отслеживать калории в трекере</p>
        </div>
      </div>
    )
  }

  const avgCalories = Math.round(data.reduce((acc, d) => acc + d.calories, 0) / data.length)
  const goal = settings.widgets.nutrition?.goal || 2000
  const currentGoalType = settings.widgets.nutrition?.nutritionGoalType || 'maintain'
  
  // % дней с успешным выполнением цели
  const successDays = data.filter(day => 
    isNutritionGoalSuccess(day.calories, day.goal, day.nutritionGoalType) === 'success'
  ).length
  const successRate = Math.round((successDays / data.length) * 100)
  
  // Разброс калорий
  const maxDay = data.reduce((max, d) => d.calories > max.calories ? d : max, data[0])
  const minDay = data.reduce((min, d) => d.calories < min.calories ? d : min, data[0])
  const range = maxDay.calories - minDay.calories
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
    >
      <div className="space-y-6">
        {/* График */}
        <motion.div variants={item}>
          <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-white/5 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Калории</h3>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                    За выбранный период
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {avgCalories}<span className="text-sm text-white/30 font-medium">ккал</span>
                </div>
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mt-1">
                  Среднее в день
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
                  stroke="#8b5cf6" 
                  strokeDasharray="5 5" 
                  strokeWidth={1.5}
                  label={{ 
                    value: `Цель`, 
                    position: 'right',
                    fill: '#8b5cf6',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="calories" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {data.map((entry, index) => {
                    const status = isNutritionGoalSuccess(entry.calories, entry.goal, entry.nutritionGoalType)
                    const fillColor = status === 'success' 
                      ? '#8b5cf6' 
                      : status === 'warning' 
                      ? 'rgba(139,92,246,0.5)' 
                      : 'rgba(139,92,246,0.2)'
                    
                    return <Cell key={`cell-${index}`} fill={fillColor} />
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </motion.div>
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ питания</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* БЛОК 1: Главная оценка выполнения цели */}
          {currentGoalType === 'loss' ? (
            successRate >= 70 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-emerald-400 font-bold mb-1.5">🎯 Дефицит работает!</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      {successRate}% дней вы выполняете цель по похудению. Средний дефицит составляет примерно {Math.abs(goal - avgCalories)} ккал в день — 
                      отличный результат для здорового снижения веса.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                        Дефицит стабилен
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : successRate >= 40 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Target className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-300 font-bold mb-1.5">📊 Непостоянный дефицит</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Только {successRate}% дней вы попадаете в целевой диапазон для похудения. Стабилизируйте питание, 
                      чтобы дефицит работал эффективнее.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Нужна стабильность
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-orange-300 font-bold mb-1.5">⚠️ Дефицит не выполняется</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Только {successRate}% дней вы в целевом диапазоне. Средняя калорийность {avgCalories} ккал 
                      не создаёт нужного дефицита. Пересмотрите план питания.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                        Требует коррекции
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : currentGoalType === 'maintain' ? (
            successRate >= 70 ? (
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                      <Award className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-violet-400 font-bold mb-1.5">✅ Стабильный баланс!</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      {successRate}% дней вы держите баланс калорий. Средняя калорийность {avgCalories} ккал при цели {goal} ккал — 
                      отличная дисциплина для поддержания веса.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">
                        Баланс достигнут
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : successRate >= 40 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-300 font-bold mb-1.5">⚡ Скачки калорийности</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Только {successRate}% дней в балансе. Калории скачут, что может влиять на вес. 
                      Планируйте питание заранее для стабильности.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Нужна стабильность
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <Target className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-orange-300 font-bold mb-1.5">📉 Баланс нарушен</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Только {successRate}% дней в целевом диапазоне. Средняя калорийность {avgCalories} ккал 
                      далека от цели {goal} ккал. Вернитесь к балансу для стабильного веса.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                        Требует внимания
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : ( // gain
            successRate >= 70 ? (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-400 font-bold mb-1.5">💪 Профицит стабилен!</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      {successRate}% дней вы создаёте профицит для набора массы. Средний профицит {Math.abs(avgCalories - goal)} ккал — 
                      оптимально для роста. Проверяйте прогресс веса еженедельно.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                        Набор идёт
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : successRate >= 40 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-300 font-bold mb-1.5">📊 Недостаточно профицита</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Только {successRate}% дней вы создаёте профицит. Средняя калорийность {avgCalories} ккал 
                      не обеспечивает стабильного набора. Увеличьте порции и частоту приёмов пищи.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Нужно больше калорий
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-orange-300 font-bold mb-1.5">⚠️ Набор не идёт</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      Только {successRate}% дней в целевом диапазоне. Средняя калорийность {avgCalories} ккал 
                      недостаточна для набора массы. Пересмотрите калорийность и увеличьте до {goal}+ ккал.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                        Требует коррекции
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* БЛОК 2: Анализ стабильности */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Карточка А: Точность */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className={cn(
                  "w-4 h-4",
                  successRate >= 70 ? "text-emerald-400" : successRate >= 40 ? "text-blue-400" : "text-orange-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  successRate >= 70 ? "text-emerald-400" : successRate >= 40 ? "text-blue-400" : "text-orange-400"
                )}>Точность</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {successRate >= 70 ? (
                  <>
                    <span className="font-bold text-white">Высокая дисциплина 🎯</span><br />
                    {successRate}% дней в цели — отличный контроль
                  </>
                ) : successRate >= 40 ? (
                  <>
                    <span className="font-bold text-white">Средняя точность 📊</span><br />
                    {successRate}% дней в цели — можно улучшить
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Низкая точность 📉</span><br />
                    {successRate}% дней — нужен контроль
                  </>
                )}
              </p>
            </div>

            {/* Карточка Б: Разброс */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={cn(
                  "w-4 h-4",
                  range < 500 ? "text-emerald-400" : range < 800 ? "text-blue-400" : "text-orange-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  range < 500 ? "text-emerald-400" : range < 800 ? "text-blue-400" : "text-orange-400"
                )}>Разброс</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {range < 500 ? (
                  <>
                    <span className="font-bold text-white">Стабильно ✅</span><br />
                    Разброс {range} ккал — отличный контроль
                  </>
                ) : range < 800 ? (
                  <>
                    <span className="font-bold text-white">Умеренные скачки ⚡</span><br />
                    Разброс {range} ккал
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Большой разброс ⚠️</span><br />
                    Разброс {range} ккал — нужна стабильность
                  </>
                )}
              </p>
            </div>
          </div>

          {/* БЛОК 3: Практические рекомендации */}
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Практические советы</span>
            </div>
            <div className="space-y-2">
              {currentGoalType === 'loss' ? (
                successRate >= 70 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/70 leading-relaxed">
                      🎯 Отличная дисциплина! Дефицит работает стабильно
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      ⚖️ Следите за весом — потеря должна быть 0.5-1 кг/неделю
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      💪 Увеличьте белок до 30-35% для сохранения мышц
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/70 leading-relaxed">
                      📅 Планируйте питание заранее — готовьте контейнеры на день
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      🍽️ Ешьте каждые 3-4 часа для контроля голода
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      📱 Используйте приложение для подсчёта калорий в первые 2 недели
                    </p>
                  </div>
                )
              ) : currentGoalType === 'maintain' ? (
                successRate >= 70 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/70 leading-relaxed">
                      ✅ Вы нашли свой баланс — продолжайте в том же духе
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      🎯 Корректируйте калорийность при изменении активности
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      📊 Правило 80/20: 80% здоровой пищи, 20% — свобода выбора
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/70 leading-relaxed">
                      📏 Контролируйте размеры порций — используйте весы
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      🔄 Вернитесь к базовым принципам: белок, овощи, сложные углеводы
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      📝 Ведите дневник питания 1-2 недели для осознанности
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    💪 Профицит 300-500 ккал оптимален для чистого набора
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🍳 Ешьте 5-6 раз в день для комфортного набора калорий
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🏋️ Силовые тренировки 3-4 раза в неделю — иначе наберётся жир
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* БЛОК 4: Влияние калорийности на цели */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Влияние на цели</span>
            </div>
            {currentGoalType === 'loss' ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  <span className="font-bold text-white">Дефицит 500 ккал/день</span> = потеря 0.5 кг жира в неделю
                </p>
                <p className="text-[11px] text-white/50">
                  Слишком большой дефицит (более 800 ккал) замедляет метаболизм на 10-20%
                </p>
              </div>
            ) : currentGoalType === 'maintain' ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  <span className="font-bold text-white">Баланс калорий</span> = стабильный вес и устойчивая энергия
                </p>
                <p className="text-[11px] text-white/50">
                  Качество пищи важнее количества: 2000 ккал из цельных продуктов ≠ 2000 ккал из фастфуда
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  <span className="font-bold text-white">Профицит 300-500 ккал/день</span> оптимален для набора без жира
                </p>
                <p className="text-[11px] text-white/50">
                  Избыток более 700 ккал ведёт к накоплению жира, а не мышц. Контролируйте вес!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})
