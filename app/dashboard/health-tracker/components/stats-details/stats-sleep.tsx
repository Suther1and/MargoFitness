"use client"

import { motion } from "framer-motion"
import { Moon, Target, Award, Zap } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsSleepProps {
  period: string
}

const SLEEP_DATA = [
  { date: "Пн", hours: 7.2, quality: 75 },
  { date: "Вт", hours: 8.1, quality: 88 },
  { date: "Ср", hours: 6.8, quality: 70 },
  { date: "Чт", hours: 7.5, quality: 80 },
  { date: "Пт", hours: 7.8, quality: 85 },
  { date: "Сб", hours: 8.5, quality: 92 },
  { date: "Вс", hours: 7.3, quality: 78 },
]

const chartConfig = {
  hours: {
    label: "Часы",
    color: "#818cf8",
  },
  quality: {
    label: "Качество",
    color: "#a78bfa",
  },
} satisfies ChartConfig

export function StatsSleep({ period }: StatsSleepProps) {
  const avgHours = (SLEEP_DATA.reduce((acc, day) => acc + day.hours, 0) / SLEEP_DATA.length).toFixed(1)
  const avgQuality = Math.round(SLEEP_DATA.reduce((acc, day) => acc + day.quality, 0) / SLEEP_DATA.length)
  const goal = 8.0
  const bestSleep = SLEEP_DATA.reduce((max, day) => day.quality > max.quality ? day : max, SLEEP_DATA[0])

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
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Сон</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Продолжительность и качество</p>
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart data={SLEEP_DATA} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="hours"
                type="monotone"
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ r: 4, fill: "#818cf8" }}
              />
              <Line
                dataKey="quality"
                type="monotone"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={{ r: 4, fill: "#a78bfa" }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ChartContainer>
        </Card>
      </motion.div>

      {/* Метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400/60">Среднее</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgHours} <span className="text-sm text-white/40">ч</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Часов сна
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60">Качество</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgQuality}<span className="text-sm text-white/40">%</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            В среднем
          </div>
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-blue-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Рекомендации</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              {parseFloat(avgHours) >= goal ? 
                "Отличная продолжительность сна! Продолжайте в том же духе." :
                `Добавьте еще ${(goal - parseFloat(avgHours)).toFixed(1)} часа для достижения рекомендуемых 8 часов.`
              }
            </p>
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Качество сна {avgQuality}% - {avgQuality >= 80 ? "отличный показатель!" : "можно улучшить режим."}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

