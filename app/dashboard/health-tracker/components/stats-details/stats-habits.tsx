"use client"

import { motion } from "framer-motion"
import { Flame, Target, TrendingUp, Calendar, Zap, Award, CheckCircle2, Clock } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface StatsHabitsProps {
  period: string
}

// Моковые данные для привычек
const HABIT_STATS = [
  { name: "Креатин 5г", completed: 28, total: 30, streak: 12, trend: "+5%" },
  { name: "Вакуум живота", completed: 22, total: 30, streak: 5, trend: "-2%" },
  { name: "Без сахара", completed: 29, total: 30, streak: 21, trend: "+10%" },
  { name: "Чтение 20 мин", completed: 18, total: 30, streak: 3, trend: "0%" },
]

const WEEKLY_COMPLETION = [
  { day: "Пн", value: 85 },
  { day: "Вт", value: 90 },
  { day: "Ср", value: 70 },
  { day: "Чт", value: 95 },
  { day: "Пт", value: 100 },
  { day: "Сб", value: 60 },
  { day: "Вс", value: 75 },
]

const chartConfig = {
  value: {
    label: "Выполнение",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsHabits({ period }: StatsHabitsProps) {
  const avgCompletion = Math.round(WEEKLY_COMPLETION.reduce((acc, d) => acc + d.value, 0) / WEEKLY_COMPLETION.length)
  const bestDay = WEEKLY_COMPLETION.reduce((max, d) => d.value > max.value ? d : max, WEEKLY_COMPLETION[0])

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
      {/* Главный график - выполнение по дням */}
      <motion.div variants={item}>
        <div className="bg-[#121214]/60 border border-white/5 rounded-[2.5rem] p-6 group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">Дисциплина</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Выполнение привычек</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums leading-none">
                {avgCompletion}<span className="text-sm text-white/30 font-medium">%</span>
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={WEEKLY_COMPLETION} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
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
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              >
                {WEEKLY_COMPLETION.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= 90 ? "#f59e0b" : entry.value >= 70 ? "rgba(245,158,11,0.6)" : "rgba(245,158,11,0.3)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Топ привычек */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Стабильность</span>
          </div>

          <div className="space-y-4">
            {HABIT_STATS.map((habit, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 rounded-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors" />
                  <div>
                    <div className="text-sm font-black text-white uppercase tracking-tight">{habit.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-white/30 uppercase">{habit.streak} дней серия</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white tabular-nums">
                    {Math.round((habit.completed / habit.total) * 100)}%
                  </div>
                  <div className={cn(
                    "text-[9px] font-bold uppercase",
                    habit.trend.startsWith('+') ? "text-emerald-400" : habit.trend.startsWith('-') ? "text-red-400" : "text-white/20"
                  )}>
                    {habit.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Ключевые метрики дисциплины */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-[2rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Лучший стрик</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums leading-none mb-2">
            21 <span className="text-sm text-white/30 font-medium">день</span>
          </div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Без сахара
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Выполнено</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums leading-none mb-2">
            156
          </div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Задач за период
          </div>
        </div>
      </motion.div>

      {/* Рекомендация */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">AI Insight</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed font-medium">
          Ваша дисциплина в выходные падает на <span className="text-amber-500 font-black">25%</span>. 
          Попробуйте перенести сложные привычки на утреннее время в субботу и воскресенье, чтобы повысить стабильность.
        </p>
      </motion.div>
    </motion.div>
  )
}

