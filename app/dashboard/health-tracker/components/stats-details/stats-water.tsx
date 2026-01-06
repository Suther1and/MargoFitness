"use client"

import { motion } from "framer-motion"
import { Droplets, TrendingUp, Target, Flame, Award, Zap, AlertCircle, Calendar } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
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
      {/* Главный график (AreaChart) */}
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
            <AreaChart
              data={WATER_DATA}
              margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                content={<ChartTooltipContent hideLabel indicator="line" />}
              />
              <Area
                dataKey="value"
                type="natural"
                fill="url(#fillWater)"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#0ea5e9",
                  strokeWidth: 2,
                  stroke: "#121214",
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Блок Efficiency (с круговым прогрессом и расширенными данными) */}
      <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-[#121214]/60 border border-white/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Efficiency</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Круговой прогресс */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - achievementRate / 100) }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(14, 165, 233, 0.3))" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-3xl font-black text-white leading-none">{achievementRate}%</div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Цель</div>
            </div>
          </div>

          {/* Статистика справа */}
          <div className="flex-1 w-full grid grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Среднее</div>
              <div className="text-xl font-black text-white tabular-nums">{avgDaily} <span className="text-xs text-white/30 font-medium">мл</span></div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Всего</div>
              <div className="text-xl font-black text-cyan-400 tabular-nums">{totalWaterLiters} <span className="text-xs text-cyan-400/30 font-medium">л</span></div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Без нормы</div>
              <div className="text-xl font-black text-amber-500 tabular-nums">{daysFailed} <span className="text-xs text-amber-500/30 font-medium">дн.</span></div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Цель</div>
              <div className="text-xl font-black text-white tabular-nums">{goal} <span className="text-xs text-white/30 font-medium">мл</span></div>
            </div>
          </div>
        </div>
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

