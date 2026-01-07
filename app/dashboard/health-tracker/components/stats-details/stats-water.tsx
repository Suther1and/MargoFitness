"use client"

import { motion } from "framer-motion"
import { Droplets, TrendingUp, Target, Award, Zap } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"

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
  const { settings } = useTrackerSettings()
  const totalWaterMl = WATER_DATA.reduce((acc, day) => acc + day.value, 0)
  const totalWaterLiters = (totalWaterMl / 1000).toFixed(1)
  const avgDaily = Math.round(totalWaterMl / WATER_DATA.length)
  const goal = settings.widgets.water?.goal || 2500
  const daysAchieved = WATER_DATA.filter(day => day.value >= (day.goal || goal)).length
  const daysFailed = WATER_DATA.length - daysAchieved
  const achievementRate = Math.round((daysAchieved / WATER_DATA.length) * 100)
  
  // Расчет рекомендуемой нормы на основе среднего веса
  const userWeight = settings.userParams.weight || 72
  const minWaterRecommended = userWeight * 30
  const maxWaterRecommended = userWeight * 40
  const trainingExtraWater = 600 // среднее значение 500-700

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
      className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
    >
      <div className="space-y-6">
        {/* Главный график (AreaChart) */}
        <motion.div variants={item}>
          <div className="bg-[#121214]/60 border border-white/5 rounded-[2.5rem] p-6 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Droplets className="w-5 h-5 text-blue-400" />
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
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">На основе ваших данных</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {avgDaily >= goal ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-400 font-bold mb-1.5">💧 Отличная гидратация!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы превышаете дневную норму. Правильный уровень гидратации улучшает метаболизм и общее самочувствие!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                      +{avgDaily - goal} мл сверх нормы
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">Недостаточно воды</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    До нормы осталось <span className="font-bold text-white">{goal - avgDaily} мл</span> в день. 
                    Это всего <span className="font-bold text-amber-300">{Math.round((goal - avgDaily) / 250)}</span> дополнительных стакана!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Droplets className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Пейте каждые 2 часа
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ и рекомендации */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Ваша норма</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Для веса {userWeight} кг рекомендуется <span className="font-bold text-white">{minWaterRecommended}-{maxWaterRecommended} мл</span> в день. 
                Это 30-40 мл на кг веса.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">При тренировках</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                В дни тренировок увеличивайте потребление на <span className="font-bold text-white">{trainingExtraWater} мл</span> для 
                восполнения потерь.
              </p>
            </div>
          </div>

          {/* Анализ выполнения */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Дней с выполнением нормы:</span>
                <span className="font-bold text-white">{daysAchieved} / {WATER_DATA.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Всего за неделю:</span>
                <span className="font-bold text-blue-400">{totalWaterLiters} литров</span>
              </div>
              {daysFailed > 0 && (
                <p className="text-[11px] text-white/50 mt-2 pt-2 border-t border-white/10">
                  💡 Совет: Используйте напоминания на телефоне, чтобы не забывать пить воду в течение дня
                </p>
              )}
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Улучшите результат</span>
            </div>
            <div className="space-y-2">
              {achievementRate < 50 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Начните утро со стакана воды. Поставьте бутылку на рабочий стол и выпивайте каждые 2 часа. 
                  Это поможет достичь нормы без усилий.
                </p>
              )}
              {achievementRate >= 50 && achievementRate < 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Вы на правильном пути! Добавьте еще один стакан воды перед каждым приемом пищи, 
                  чтобы гарантированно выполнять норму.
                </p>
              )}
              {achievementRate >= 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Отличная дисциплина! Продолжайте в том же духе. Помните о дополнительной воде в дни тренировок 
                  и в жаркую погоду.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

