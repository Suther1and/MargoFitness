"use client"

import { motion } from "framer-motion"
import { Coffee, Target, Award, Moon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCaffeineProps {
  period: string
}

const CAFFEINE_DATA = [
  { date: "Пн", value: 2 },
  { date: "Вт", value: 3 },
  { date: "Ср", value: 1 },
  { date: "Чт", value: 2 },
  { date: "Пт", value: 1 },
  { date: "Сб", value: 0 },
  { date: "Вс", value: 1 },
]

const chartConfig = {
  value: {
    label: "Кофеин",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsCaffeine({ period }: StatsCaffeineProps) {
  const avgDaily = (CAFFEINE_DATA.reduce((acc, day) => acc + day.value, 0) / CAFFEINE_DATA.length).toFixed(1)
  const daysWithoutCaffeine = CAFFEINE_DATA.filter(day => day.value === 0).length

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
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
      {/* График */}
      <motion.div variants={item}>
        <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Кофеин</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Потребление за период</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white tabular-nums">
                {avgDaily}
              </div>
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                чашек/день
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={CAFFEINE_DATA} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="caffeineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
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
                fill="url(#caffeineGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </Card>
      </motion.div>

      {/* Метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="w-4 h-4 text-orange-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-400/60">Среднее</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgDaily}
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Чашек/день
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400/60">Без кофеина</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {daysWithoutCaffeine}
          </div>
          <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {daysWithoutCaffeine === 1 ? 'День' : 'Дня'}
          </div>
        </div>
      </motion.div>

      {/* Влияние на сон */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Влияние на сон</span>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-sm text-white/70 font-medium">
              В дни с высоким потреблением кофеина (3+ чашки) качество сна снижается в среднем на 15%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-sm text-white/70 font-medium">
              Рекомендуется не употреблять кофеин за 6-8 часов до сна
            </p>
          </div>
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
            <Award className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Рекомендации</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Ваше потребление кофеина умеренное ({avgDaily} чашек/день). Это в пределах нормы.
            </p>
          </div>

          {daysWithoutCaffeine > 0 && (
            <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm text-white/70 font-medium">
                Отлично! Вы делали перерывы от кофеина {daysWithoutCaffeine} {daysWithoutCaffeine === 1 ? 'день' : 'дня'}.
              </p>
            </div>
          )}

          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Для лучшего сна старайтесь не пить кофе после 15:00
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

