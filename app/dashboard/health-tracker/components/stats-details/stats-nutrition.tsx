"use client"

import { motion } from "framer-motion"
import { Utensils, Target, Scale } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsNutritionProps {
  period: string
}

// Моковые данные
const CALORIES_DATA = [
  { date: "Пн", calories: 1850, goal: 2200, protein: 120, fats: 65, carbs: 190 },
  { date: "Вт", calories: 2100, goal: 2200, protein: 140, fats: 70, carbs: 210 },
  { date: "Ср", calories: 1950, goal: 2200, protein: 130, fats: 62, carbs: 195 },
  { date: "Чт", calories: 2250, goal: 2200, protein: 145, fats: 75, carbs: 225 },
  { date: "Пт", calories: 2000, goal: 2200, protein: 135, fats: 68, carbs: 200 },
  { date: "Сб", calories: 2300, goal: 2200, protein: 150, fats: 78, carbs: 230 },
  { date: "Вс", calories: 1900, goal: 2200, protein: 125, fats: 64, carbs: 185 },
]

const chartConfig = {
  calories: {
    label: "Калории",
    color: "#10b981",
  },
  goal: {
    label: "Цель",
    color: "#64748b",
  },
} satisfies ChartConfig

export function StatsNutrition({ period }: StatsNutritionProps) {
  const totalCalories = CALORIES_DATA.reduce((acc, day) => acc + day.calories, 0)
  const avgCalories = Math.round(totalCalories / CALORIES_DATA.length)
  const avgProtein = Math.round(CALORIES_DATA.reduce((acc, day) => acc + day.protein, 0) / CALORIES_DATA.length)
  const avgFats = Math.round(CALORIES_DATA.reduce((acc, day) => acc + day.fats, 0) / CALORIES_DATA.length)
  const avgCarbs = Math.round(CALORIES_DATA.reduce((acc, day) => acc + day.carbs, 0) / CALORIES_DATA.length)
  const goal = 2200

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
        {/* График калорий */}
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Калории</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Потребление за период</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white tabular-nums">
                  {avgCalories}
                </div>
                <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                  ккал/день
                </div>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart
                data={CALORIES_DATA}
                margin={{
                  left: -20,
                  right: 12,
                  top: 10,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  fontWeight="bold"
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel indicator="line" />}
                />
                <Area
                  dataKey="calories"
                  type="natural"
                  fill="url(#fillCalories)"
                  fillOpacity={1}
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "#09090b",
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </Card>
        </motion.div>

        {/* Баланс БЖУ */}
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
          {/* Главная метрика */}
          {avgCalories >= goal * 0.95 && avgCalories <= goal * 1.05 ? (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-violet-400 font-bold mb-1.5">🎯 Точное попадание в цель!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее потребление <span className="font-bold text-white">{avgCalories} ккал</span> соответствует 
                    вашей цели. Отличный контроль питания!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">
                      Продолжайте в том же духе
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgCalories < goal * 0.95 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">⚠️ Дефицит калорий</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее <span className="font-bold text-white">{avgCalories} ккал</span> на 
                    <span className="font-bold text-white"> {goal - avgCalories} ккал</span> ниже цели. 
                    Это может замедлить метаболизм.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Utensils className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Добавьте калорий
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
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">⚠️ Превышение калорий</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее <span className="font-bold text-white">{avgCalories} ккал</span> на 
                    <span className="font-bold text-white"> {avgCalories - goal} ккал</span> выше цели. 
                    Это может замедлить похудение.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Target className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Скорректируйте порции
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ динамики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Стабильность</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {(() => {
                  const maxDay = CALORIES_DATA.reduce((max, d) => d.calories > max.calories ? d : max)
                  const minDay = CALORIES_DATA.reduce((min, d) => d.calories < min.calories ? d : min)
                  const variation = maxDay.calories - minDay.calories
                  return variation <= 300 ? (
                    <>Отличная стабильность! Разница между днями всего <span className="font-bold text-white">{variation} ккал</span>.</>
                  ) : variation <= 500 ? (
                    <>Неплохая стабильность. Разброс <span className="font-bold text-white">{variation} ккал</span> — это норма.</>
                  ) : (
                    <>Большой разброс <span className="font-bold text-white">{variation} ккал</span>. Старайтесь питаться стабильнее.</>
                  )
                })()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Отклонение от цели</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {(() => {
                  const deviation = Math.abs(avgCalories - goal)
                  const deviationPercent = ((deviation / goal) * 100).toFixed(0)
                  return deviation <= 100 ? (
                    <>Идеально! Отклонение всего <span className="font-bold text-violet-400">{deviation} ккал</span> ({deviationPercent}%).</>
                  ) : deviation <= 300 ? (
                    <>Отклонение <span className="font-bold text-white">{deviation} ккал</span> ({deviationPercent}%) — можно скорректировать.</>
                  ) : (
                    <>Отклонение <span className="font-bold text-orange-400">{deviation} ккал</span> ({deviationPercent}%) — требует внимания.</>
                  )
                })()}
              </p>
            </div>
          </div>

          {/* Анализ дней */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Анализ по дням</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Самый сытный день:</span>
                <span className="font-bold text-white">
                  {(() => {
                    const maxDay = CALORIES_DATA.reduce((max, d) => d.calories > max.calories ? d : max)
                    return `${maxDay.date} — ${maxDay.calories} ккал`
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Самый легкий день:</span>
                <span className="font-bold text-white">
                  {(() => {
                    const minDay = CALORIES_DATA.reduce((min, d) => d.calories < min.calories ? d : min)
                    return `${minDay.date} — ${minDay.calories} ккал`
                  })()}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-2 pt-2 border-t border-white/10">
                💡 Совет: Стабильность калорий важнее их точного количества. Старайтесь держать ±200 ккал от цели.
              </p>
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Рекомендации</span>
            </div>
            <div className="space-y-2">
              {avgCalories < goal * 0.95 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Не хватает <span className="font-bold text-white">{goal - avgCalories} ккал</span> в день. 
                  Добавьте перекус (орехи, авокадо, сыр) или увеличьте порции на <span className="font-bold text-white">15-20%</span>.
                </p>
              )}
              {avgCalories > goal * 1.05 && (() => {
                const maxDay = CALORIES_DATA.reduce((max, d) => d.calories > max.calories ? d : max)
                return (
                  <p className="text-xs text-white/70 leading-relaxed">
                    🎯 Превышение <span className="font-bold text-white">{avgCalories - goal} ккал</span> в день. 
                    Обратите внимание на <span className="font-bold text-white">{maxDay.date}</span> ({maxDay.calories} ккал) — уменьшите порции или замените калорийные блюда.
                  </p>
                )
              })()}
              {avgCalories >= goal * 0.95 && avgCalories <= goal * 1.05 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Идеальный контроль калорий! Поддерживайте <span className="font-bold text-white">разнообразие</span> продуктов: 
                  белки, овощи, полезные жиры, сложные углеводы.
                </p>
              )}
              {(() => {
                const maxDay = CALORIES_DATA.reduce((max, d) => d.calories > max.calories ? d : max)
                const minDay = CALORIES_DATA.reduce((min, d) => d.calories < min.calories ? d : min)
                const variation = maxDay.calories - minDay.calories
                return variation > 500 && (
                  <p className="text-xs text-white/70 leading-relaxed">
                    🎯 Большой разброс калорий ({variation} ккал). Планируйте меню заранее, 
                    чтобы <span className="font-bold text-white">стабилизировать</span> питание.
                  </p>
                )
              })()}
              <p className="text-xs text-white/70 leading-relaxed pt-2 border-t border-white/10">
                💡 Для точного контроля рекомендуем взвешивать порции и вести дневник питания первые 2 недели.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

