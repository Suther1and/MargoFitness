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

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Рекомендации</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Ваш средний калораж немного ниже цели. Это может замедлить прогресс.
            </p>
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Баланс БЖУ хороший. Продолжайте следить за достаточным количеством белка.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

