"use client"

import { motion } from "framer-motion"
import { Droplets, TrendingUp, Target, Flame, Award, Zap, AlertCircle, Calendar } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
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
  background: {
    label: "Цель",
    color: "rgba(255,255,255,0.03)",
  }
} satisfies ChartConfig

export function StatsWater({ period }: StatsWaterProps) {
  const totalWaterMl = WATER_DATA.reduce((acc, day) => acc + day.value, 0)
  const totalWaterLiters = (totalWaterMl / 1000).toFixed(1)
  const avgDaily = Math.round(totalWaterMl / WATER_DATA.length)
  const goal = 2500
  const daysAchieved = WATER_DATA.filter(day => day.value >= day.goal).length
  const daysFailed = WATER_DATA.length - daysAchieved
  const achievementRate = Math.round((daysAchieved / WATER_DATA.length) * 100)

  // Подготовка данных для графика с подложкой
  const chartData = WATER_DATA.map(d => ({
    ...d,
    bgValue: Math.max(d.goal, d.value) // Подложка всегда до цели или выше, если выпито больше
  }))

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
        <div className="bg-[#121214]/60 border border-white/5 rounded-[2.5rem] p-6 group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">Гидрация</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Потребление воды</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums leading-none">
                {avgDaily} <span className="text-sm text-white/30 font-medium">мл/день</span>
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart 
              data={chartData} 
              margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
              barGap={-32} // Наложение столбиков друг на друга
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                stroke="rgba(255,255,255,0.2)"
                fontSize={10}
                fontWeight="bold"
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              {/* Фоновые столбики (подложка до цели) */}
              <Bar
                dataKey="goal"
                fill="rgba(255,255,255,0.03)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                isAnimationActive={false}
              />
              {/* Реальные значения */}
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= entry.goal ? "#0ea5e9" : "rgba(14, 165, 233, 0.4)"} 
                  />
                ))}
              </Bar>
              <ReferenceLine y={goal} stroke="rgba(14, 165, 233, 0.2)" strokeDasharray="3 3" />
            </BarChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Ключевые метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        {[
          { icon: Droplets, label: 'Среднее', val: avgDaily, unit: 'мл', sub: 'В день', color: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-500/10' },
          { icon: Calendar, label: 'Всего', val: totalWaterLiters, unit: 'л', sub: 'За период', color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
          { icon: AlertCircle, label: 'Без нормы', val: daysFailed, unit: 'дн.', sub: 'Цель не достигнута', color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
          { icon: Target, label: 'Цель', val: achievementRate, unit: '%', sub: `${daysAchieved}/${WATER_DATA.length} дней достигнуто`, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/10' }
        ].map((m, i) => (
          <div key={i} className={cn("p-6 rounded-[2rem] bg-[#121214]/60 border border-white/5", m.bg, m.border)}>
            <div className="flex items-center gap-2 mb-3">
              <m.icon className={cn("w-4 h-4", m.color)} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{m.label}</span>
            </div>
            <div className="text-3xl font-black text-white tabular-nums leading-none mb-2">
              {m.val} <span className="text-sm text-white/30 font-medium">{m.unit}</span>
            </div>
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              {m.sub}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Рекомендации</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
            </div>
            <div>
              <p className="text-sm text-white/80 font-bold mb-1 uppercase tracking-tight">Норма для вашего веса</p>
              <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                Рекомендуется пить 30-40 мл на кг веса. Для веса 72 кг это 2160-2880 мл в день.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
            </div>
            <div>
              <p className="text-sm text-white/80 font-bold mb-1 uppercase tracking-tight">При активности</p>
              <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                В дни тренировок увеличивайте потребление на 500-700 мл для восполнения потерь.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

    </motion.div>
  )
}

