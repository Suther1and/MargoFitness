"use client"

import { motion } from "framer-motion"
import { Utensils, TrendingUp, Target, Award, Scale } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, ResponsiveContainer } from "recharts"
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
      className="space-y-6"
    >
      {/* График калорий */}
      <motion.div variants={item}>
        <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-emerald-400" />
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
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
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
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Баланс макронутриентов</span>
        </div>

        <div className="space-y-4">
          {/* Белки */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-medium">Белки</span>
              <span className="text-sm font-black text-blue-400 tabular-nums">{avgProtein}г</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(avgProtein / 150) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              />
            </div>
          </div>

          {/* Жиры */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-medium">Жиры</span>
              <span className="text-sm font-black text-amber-400 tabular-nums">{avgFats}г</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(avgFats / 70) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              />
            </div>
          </div>

          {/* Углеводы */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-medium">Углеводы</span>
              <span className="text-sm font-black text-emerald-400 tabular-nums">{avgCarbs}г</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(avgCarbs / 250) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400/60">Среднее</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgCalories}
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            ккал/день
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60">Цель</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {goal}
          </div>
          <div className="mt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            ккал/день
          </div>
        </div>
      </motion.div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ питания</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {avgCalories >= goal * 0.95 && avgCalories <= goal * 1.05 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">🎯 Точное попадание в цель!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее потребление <span className="font-bold text-white">{avgCalories} ккал</span> соответствует 
                    вашей цели. Отличный контроль питания!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
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

          {/* Анализ БЖУ */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Баланс макронутриентов</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-white/60">Белки:</span>
                </div>
                <span className="font-bold text-white">{avgProtein}г {avgProtein >= 120 ? '✅' : avgProtein >= 100 ? '⚠️' : '❌'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-white/60">Жиры:</span>
                </div>
                <span className="font-bold text-white">{avgFats}г {avgFats >= 60 && avgFats <= 80 ? '✅' : '⚠️'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white/60">Углеводы:</span>
                </div>
                <span className="font-bold text-white">{avgCarbs}г {avgCarbs >= 150 && avgCarbs <= 250 ? '✅' : '⚠️'}</span>
              </div>
            </div>
          </div>

          {/* Детальный анализ макросов */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Белки</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {avgProtein >= 120 ? (
                  <>Отлично! <span className="font-bold text-white">{avgProtein}г</span> — достаточно для роста мышц.</>
                ) : avgProtein >= 100 ? (
                  <>Норма. <span className="font-bold text-white">{avgProtein}г</span> — можно добавить еще 20г.</>
                ) : (
                  <>Мало. <span className="font-bold text-white">{avgProtein}г</span> — нужно минимум 100г.</>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Жиры</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {avgFats >= 60 && avgFats <= 80 ? (
                  <>Идеально! <span className="font-bold text-white">{avgFats}г</span> — баланс для гормонов.</>
                ) : avgFats < 60 ? (
                  <>Маловато. <span className="font-bold text-white">{avgFats}г</span> — нужно 60-80г.</>
                ) : (
                  <>Многовато. <span className="font-bold text-white">{avgFats}г</span> — снизьте до 60-80г.</>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Углеводы</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {avgCarbs >= 150 && avgCarbs <= 250 ? (
                  <>Отлично! <span className="font-bold text-white">{avgCarbs}г</span> — энергии хватает.</>
                ) : avgCarbs < 150 ? (
                  <>Маловато. <span className="font-bold text-white">{avgCarbs}г</span> — нужно 150-250г.</>
                ) : (
                  <>Многовато. <span className="font-bold text-white">{avgCarbs}г</span> — для похудения снизьте.</>
                )}
              </p>
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Рекомендации</span>
            </div>
            <div className="space-y-2">
              {avgProtein < 120 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Добавьте <span className="font-bold text-white">{120 - avgProtein}г белка</span> в день: 
                  яйца на завтрак, курица/рыба на обед и ужин.
                </p>
              )}
              {avgCalories < goal * 0.95 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Увеличьте порции на <span className="font-bold text-white">{Math.round((goal - avgCalories) * 0.2)}г</span> или 
                  добавьте перекус (орехи, фрукты).
                </p>
              )}
              {avgCalories > goal * 1.05 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Уменьшите порции на <span className="font-bold text-white">15-20%</span> или 
                  замените сладости на фрукты.
                </p>
              )}
              {avgCalories >= goal * 0.95 && avgCalories <= goal * 1.05 && avgProtein >= 120 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Идеальное питание! Поддерживайте <span className="font-bold text-white">разнообразие</span> продуктов 
                  и следите за витаминами.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

