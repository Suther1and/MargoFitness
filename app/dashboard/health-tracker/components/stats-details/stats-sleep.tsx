"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Moon, Target, Award } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ReferenceLine } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSleepStats } from "@/lib/actions/health-stats"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { TrackerSettings } from "../../types"

interface StatsSleepProps {
  userId: string | null
  settings: TrackerSettings
  dateRange: { start: Date; end: Date }
}

const chartConfig = { value: { label: "Часы сна", color: "#6366f1" } } satisfies ChartConfig

export const StatsSleep = memo(function StatsSleep({ userId, settings, dateRange }: StatsSleepProps) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['stats', 'sleep', userId, dateRange],
    queryFn: async () => {
      if (!userId) return null
      return await getSleepStats(userId, dateRange)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data) return []
    
    return rawData.data.map(entry => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      hours: entry.hours || 0
    }))
  }, [rawData])
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о сне...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Moon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о сне</h3>
          <p className="text-white/40 text-sm">Начните отслеживать сон в трекере</p>
        </div>
      </div>
    )
  }

  const avgHours = (data.reduce((acc, day) => acc + day.hours, 0) / data.length).toFixed(1)
  const goal = settings.widgets.sleep?.goal || 8
  const bestSleep = data.reduce((max, day) => day.hours > max.hours ? day : max, data[0])
  const worstSleep = data.reduce((min, day) => day.hours < min.hours ? day : min, data[0])
  const daysWithGoodSleep = data.filter(day => day.hours >= 7).length

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
      <div className="space-y-6">
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-white/90">Сон</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">За выбранный период</p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
                <ReferenceLine y={goal} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-indigo-400" />
                <div>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Среднее</div>
                  <div className="text-2xl font-black text-white tracking-tight tabular-nums">{avgHours}<span className="text-sm text-white/40">ч</span></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Статистика</div>
            <div className="space-y-2 text-xs text-white/60">
              <div>Лучший день: <span className="font-bold text-white">{bestSleep.date}</span> — <span className="font-bold text-indigo-400">{bestSleep.hours}ч</span></div>
              <div>Худший день: <span className="font-bold text-white">{worstSleep.date}</span> — <span className="font-bold text-amber-400">{worstSleep.hours}ч</span></div>
              <div>Дней с хорошим сном (7+ч): <span className="font-bold text-white">{daysWithGoodSleep} из {data.length}</span></div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 backdrop-blur-xl p-5">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Рекомендации</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  {parseFloat(avgHours) >= 7 
                    ? "Отличный сон! Продолжайте придерживаться режима для восстановления организма"
                    : "Старайтесь спать минимум 7 часов для полноценного восстановления"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
})
