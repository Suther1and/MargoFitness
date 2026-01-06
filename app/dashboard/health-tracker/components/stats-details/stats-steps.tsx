"use client"

import { motion } from "framer-motion"
import { Footprints, TrendingUp, TrendingDown, Target, Award, Flame } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsStepsProps {
  period: string
}

// Моковые данные
const STEPS_DATA = [
  { date: "Пн", value: 8400, day: "monday" },
  { date: "Вт", value: 10200, day: "tuesday" },
  { date: "Ср", value: 7600, day: "wednesday" },
  { date: "Чт", value: 9100, day: "thursday" },
  { date: "Пт", value: 12400, day: "friday" },
  { date: "Сб", value: 6200, day: "saturday" },
  { date: "Вс", value: 8800, day: "sunday" },
]

// Тепловая карта по дням недели (средние значения за несколько недель)
const HEATMAP_DATA = [
  { day: "Пн", avg: 8200, percent: 82 },
  { day: "Вт", avg: 9800, percent: 98 },
  { day: "Ср", avg: 7400, percent: 74 },
  { day: "Чт", avg: 9500, percent: 95 },
  { day: "Пт", avg: 11200, percent: 112 },
  { day: "Сб", avg: 6800, percent: 68 },
  { day: "Вс", avg: 7900, percent: 79 },
]

const chartConfig = {
  value: {
    label: "Шаги",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function StatsSteps({ period }: StatsStepsProps) {
  const totalSteps = STEPS_DATA.reduce((acc, day) => acc + day.value, 0)
  const avgDaily = Math.round(totalSteps / STEPS_DATA.length)
  const goal = 10000
  const bestDay = STEPS_DATA.reduce((max, day) => day.value > max.value ? day : max, STEPS_DATA[0])
  const worstDay = STEPS_DATA.reduce((min, day) => day.value < min.value ? day : min, STEPS_DATA[0])
  const daysAchieved = STEPS_DATA.filter(day => day.value >= goal).length
  const achievementRate = Math.round((daysAchieved / STEPS_DATA.length) * 100)

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
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Footprints className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Активность</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Шаги за период</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white tabular-nums">
                {avgDaily.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                в день
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={STEPS_DATA} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
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
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="value"
                fill="url(#stepsGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </Card>
      </motion.div>

      {/* Ключевые метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Среднее */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="w-4 h-4 text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-400/60">Среднее</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgDaily.toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Шагов/день
          </div>
        </div>

        {/* Всего */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60">Всего</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {(totalSteps / 1000).toFixed(1)}k
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            За {period === '7d' ? '7' : '30'} дней
          </div>
        </div>

        {/* Лучший день */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400/60">Лучший</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {bestDay.value.toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {bestDay.date}
          </div>
        </div>

        {/* Худший день */}
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-400/60">Худший</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {worstDay.value.toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
            {worstDay.date}
          </div>
        </div>
      </motion.div>

      {/* Прогресс к цели */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Выполнение цели</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60 font-medium">Дней с выполнением</span>
            <span className="text-lg font-black text-white">{daysAchieved} / {STEPS_DATA.length}</span>
          </div>

          {/* Прогресс бар */}
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${achievementRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60 font-medium">Процент выполнения</span>
            <span className={cn(
              "text-lg font-black tabular-nums",
              achievementRate >= 80 ? "text-emerald-400" : achievementRate >= 50 ? "text-blue-400" : "text-amber-400"
            )}>
              {achievementRate}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Тепловая карта по дням недели */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Паттерн активности</span>
        </div>

        <div className="space-y-2">
          {HEATMAP_DATA.map((day) => (
            <div key={day.day} className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/60 w-8">{day.day}</span>
              
              <div className="flex-1 relative h-8 bg-white/5 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(day.percent, 100)}%` }}
                  transition={{ duration: 0.8, delay: HEATMAP_DATA.indexOf(day) * 0.1 }}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-lg",
                    day.percent >= 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                    day.percent >= 80 ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                    day.percent >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                    "bg-gradient-to-r from-orange-500 to-orange-400"
                  )}
                />
                
                <div className="relative z-10 h-full flex items-center px-3">
                  <span className="text-xs font-black text-white tabular-nums">
                    {day.avg.toLocaleString()}
                  </span>
                </div>
              </div>

              <span className={cn(
                "text-xs font-black tabular-nums w-10 text-right",
                day.percent >= 100 ? "text-emerald-400" :
                day.percent >= 80 ? "text-blue-400" :
                day.percent >= 60 ? "text-amber-400" :
                "text-orange-400"
              )}>
                {day.percent}%
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/5">
          <p className="text-xs text-white/60 font-medium">
            💡 Пятница — самый активный день недели, а выходные требуют внимания
          </p>
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-emerald-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Рекомендации</span>
        </div>

        <div className="space-y-3">
          {avgDaily >= goal && (
            <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-400 font-black mb-1">Отлично!</p>
                <p className="text-xs text-white/60">
                  Вы превышаете дневную цель. Отличный уровень активности!
                </p>
              </div>
            </div>
          )}

          {avgDaily < goal && (
            <div className="flex gap-3 p-3 rounded-xl bg-white/5">
              <div className="mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Увеличьте активность</p>
                <p className="text-xs text-white/60">
                  Вам нужно еще {(goal - avgDaily).toLocaleString()} шагов в день для достижения цели.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium mb-1">Польза для здоровья</p>
              <p className="text-xs text-white/60">
                10,000 шагов в день снижают риск сердечно-сосудистых заболеваний и улучшают общее самочувствие.
              </p>
            </div>
          </div>

          {worstDay.value < goal * 0.6 && (
            <div className="flex gap-3 p-3 rounded-xl bg-white/5">
              <div className="mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Внимание к выходным</p>
                <p className="text-xs text-white/60">
                  Активность в выходные значительно ниже. Попробуйте запланировать прогулку или активность.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

