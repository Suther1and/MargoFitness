"use client"

import { motion } from "framer-motion"
import { Droplets, TrendingUp, Target, Flame, Award, Zap } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsWaterProps {
  period: string
}

// Моковые данные
const WATER_DATA = [
  { date: "Пн", value: 2100, goal: 2500 },
  { date: "Вт", value: 2400, goal: 2500 },
  { date: "Ср", value: 1800, goal: 2500 },
  { date: "Чт", value: 2600, goal: 2500 },
  { date: "Пт", value: 2200, goal: 2500 },
  { date: "Сб", value: 2800, goal: 2500 },
  { date: "Вс", value: 2500, goal: 2500 },
]

const chartConfig = {
  value: {
    label: "Потребление",
    color: "#0ea5e9",
  },
  goal: {
    label: "Цель",
    color: "#64748b",
  },
} satisfies ChartConfig

export function StatsWater({ period }: StatsWaterProps) {
  const totalWater = WATER_DATA.reduce((acc, day) => acc + day.value, 0)
  const avgDaily = Math.round(totalWater / WATER_DATA.length)
  const goal = 2500
  const bestDay = WATER_DATA.reduce((max, day) => day.value > max.value ? day : max, WATER_DATA[0])
  const daysAchieved = WATER_DATA.filter(day => day.value >= day.goal).length
  const achievementRate = Math.round((daysAchieved / WATER_DATA.length) * 100)

  // Текущий streak
  let currentStreak = 0
  for (let i = WATER_DATA.length - 1; i >= 0; i--) {
    if (WATER_DATA[i].value >= WATER_DATA[i].goal) {
      currentStreak++
    } else {
      break
    }
  }

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
      {/* Главный график */}
      <motion.div variants={item}>
        <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Гидрация</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Потребление воды</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white tabular-nums">
                {avgDaily} <span className="text-xs text-white/40">мл/день</span>
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart
              data={WATER_DATA}
              margin={{
                left: -20,
                right: 12,
                top: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillWater" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#0ea5e9"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#0ea5e9"
                    stopOpacity={0}
                  />
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
                dataKey="value"
                type="natural"
                fill="url(#fillWater)"
                fillOpacity={1}
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#0ea5e9",
                  strokeWidth: 2,
                  stroke: "#09090b",
                }}
              />
            </AreaChart>
          </ChartContainer>
        </Card>
      </motion.div>

      {/* Ключевые метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Среднее в день */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400/60">Среднее</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgDaily} <span className="text-sm text-white/40">мл</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            В день
          </div>
        </div>

        {/* Лучший день */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-400/60">Лучший день</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {bestDay.value} <span className="text-sm text-white/40">мл</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            {bestDay.date}
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400/60">Серия</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {currentStreak} <span className="text-sm text-white/40">дней</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Выполнение цели
          </div>
        </div>

        {/* % Выполнения */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60">Достижение</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {achievementRate}<span className="text-sm text-white/40">%</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            {daysAchieved} из {WATER_DATA.length} дней
          </div>
        </div>
      </motion.div>

      {/* Прогресс к цели - круговая диаграмма */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогресс к цели</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Круговой прогресс */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - achievementRate / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{achievementRate}%</div>
              </div>
            </div>
          </div>

          {/* Текстовая информация */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white/60 font-medium">Цель</span>
              <span className="text-sm font-black text-white tabular-nums">{goal} мл/день</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white/60 font-medium">Среднее</span>
              <span className="text-sm font-black text-cyan-400 tabular-nums">{avgDaily} мл/день</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white/60 font-medium">Разница</span>
              <span className={cn(
                "text-sm font-black tabular-nums",
                avgDaily >= goal ? "text-emerald-400" : "text-amber-400"
              )}>
                {avgDaily >= goal ? '+' : ''}{avgDaily - goal} мл
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Рекомендации</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium mb-1">Норма для вашего веса</p>
              <p className="text-xs text-white/60">
                Рекомендуется пить 30-40 мл на кг веса. Для веса 72 кг это 2160-2880 мл в день.
              </p>
            </div>
          </div>

          {avgDaily < goal && (
            <div className="flex gap-3 p-3 rounded-xl bg-white/5">
              <div className="mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Увеличьте потребление</p>
                <p className="text-xs text-white/60">
                  Попробуйте добавить стакан воды утром после пробуждения и перед каждым приемом пищи.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium mb-1">При активности</p>
              <p className="text-xs text-white/60">
                В дни тренировок увеличивайте потребление на 500-700 мл для восполнения потерь.
              </p>
            </div>
          </div>

          {currentStreak >= 3 && (
            <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="mt-0.5">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-400 font-black mb-1">Отличная серия!</p>
                <p className="text-xs text-white/60">
                  {currentStreak} дней подряд вы выполняете норму. Продолжайте в том же духе!
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

