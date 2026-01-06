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
  { name: "Креатин 5г", completed: 28, total: 30, streak: 12 },
  { name: "Вакуум живота", completed: 22, total: 30, streak: 5 },
  { name: "Без сахара", completed: 29, total: 30, streak: 21 },
  { name: "Чтение 20 мин", completed: 18, total: 30, streak: 3 },
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

// Добавляем моковые данные для тепловой карты
const getHeatmapData = (period: string) => {
  if (period === '7d') return Array.from({ length: 7 }, (_, i) => ({ value: Math.random() * 100, label: `${i + 1}` }))
  if (period === '30d') return Array.from({ length: 30 }, (_, i) => ({ value: Math.random() * 100, label: `${i + 1}` }))
  if (period === '180d') return Array.from({ length: 26 }, (_, i) => ({ value: Math.random() * 100, label: `W${i + 1}` }))
  return Array.from({ length: 12 }, (_, i) => ({ value: Math.random() * 100, label: `M${i + 1}` }))
}

const chartConfig = {
  value: {
    label: "Выполнение",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsHabits({ period }: StatsHabitsProps) {
  const avgCompletion = Math.round(WEEKLY_COMPLETION.reduce((acc, d) => acc + d.value, 0) / WEEKLY_COMPLETION.length)
  const heatmapData = getHeatmapData(period)

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

      {/* Тепловая карта */}
      <motion.div variants={item}>
        <div className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Активность</span>
            </div>
            {/* Микро-легенда */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-white/20 uppercase">Min</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-[2px] bg-white/5" />
                <div className="w-2 h-2 rounded-[2px] bg-amber-500/30" />
                <div className="w-2 h-2 rounded-[2px] bg-amber-500/60" />
                <div className="w-2 h-2 rounded-[2px] bg-amber-500" />
              </div>
              <span className="text-[8px] font-bold text-white/20 uppercase">Max</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={cn(
              "grid gap-2",
              period === '7d' ? "grid-cols-7" : 
              period === '30d' ? "grid-cols-10" : 
              "grid-cols-13"
            )}>
              {heatmapData.map((data, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-sm md:rounded-md transition-colors"
                  style={{ 
                    backgroundColor: data.value > 80 ? 'rgba(245,158,11,1)' : 
                                     data.value > 50 ? 'rgba(245,158,11,0.6)' : 
                                     data.value > 20 ? 'rgba(245,158,11,0.3)' : 
                                     'rgba(255,255,255,0.03)'
                  }}
                  title={`${Math.round(data.value)}%`}
                />
              ))}
            </div>

            {/* Подписи для 7 дней */}
            {period === '7d' && (
              <div className="grid grid-cols-7 gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <span key={day} className="text-[9px] font-black text-white/20 text-center uppercase">{day}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Список привычек */}
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
                  <div className="w-2.5 h-10 rounded-full bg-amber-500/5 group-hover:bg-amber-500 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0)] group-hover:shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                  <div>
                    <div className="text-sm font-black text-white uppercase tracking-tight">{habit.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-white/30 uppercase">{habit.streak} дней серия</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white tabular-nums leading-none">
                    {Math.round((habit.completed / habit.total) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Ключевые метрики дисциплины */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        {/* Лучший стрик */}
        <div className="p-5 rounded-[2rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Лучший стрик</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-1.5">
            21 <span className="text-xs text-white/30 font-medium">дн.</span>
          </div>
          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest truncate">
            Без сахара
          </div>
        </div>

        {/* Процент выполнения */}
        <div className="p-5 rounded-[2rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Процент</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-1.5">
            82<span className="text-xs text-white/30 font-medium">%</span>
          </div>
          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            156 / 190 задач
          </div>
        </div>

        {/* Всего задач */}
        <div className="p-5 rounded-[2rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Выполнено</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-1.5">
            156
          </div>
          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            Всего за период
          </div>
        </div>

        {/* Всего привычек */}
        <div className="p-5 rounded-[2rem] bg-[#121214]/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Привычки</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none mb-1.5">
            12
          </div>
          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            Активных целей
          </div>
        </div>
      </motion.div>


      {/* Рекомендация */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Рекомендация</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed font-medium">
          Ваша дисциплина в выходные обычно ниже на 25%. 
          Попробуйте перенести сложные привычки на утреннее время в субботу и воскресенье, чтобы повысить стабильность.
        </p>
      </motion.div>
    </motion.div>
  )
}

