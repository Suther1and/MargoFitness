"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Utensils, Target, Award, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ReferenceLine } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { getNutritionStats } from "@/lib/actions/health-stats"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { TrackerSettings } from "../../types"

interface StatsNutritionProps {
  userId: string | null
  settings: TrackerSettings
  dateRange: { start: Date; end: Date }
}

const chartConfig = { calories: { label: "Калории", color: "#8b5cf6" } } satisfies ChartConfig

export const StatsNutrition = memo(function StatsNutrition({ userId, settings, dateRange }: StatsNutritionProps) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['stats', 'nutrition', userId, dateRange],
    queryFn: async () => {
      if (!userId) return null
      return await getNutritionStats(userId, dateRange)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data) return []
    
    return rawData.data.map(entry => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      calories: entry.calories || 0,
      goal: settings.widgets.nutrition?.goal || 2000
    }))
  }, [rawData, settings.widgets.nutrition?.goal])
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-400/20 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о питании...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Utensils className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о питании</h3>
          <p className="text-white/40 text-sm">Начните отслеживать калории в трекере</p>
        </div>
      </div>
    )
  }

  const avgCalories = Math.round(data.reduce((acc, d) => acc + d.calories, 0) / data.length)
  const goal = settings.widgets.nutrition?.goal || 2000
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
      <div className="space-y-6">
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-white/90">Калории</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">За выбранный период</p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <ReferenceLine y={goal} stroke="#8b5cf6" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="calories" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-violet-400" />
              <div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Среднее в день</div>
                <div className="text-2xl font-black text-white">{avgCalories}<span className="text-sm text-white/40">ккал</span></div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Цель</div>
                <div className="text-2xl font-black text-white">{goal}<span className="text-sm text-white/40">ккал</span></div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 backdrop-blur-xl p-5">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-violet-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Рекомендации</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  {avgCalories < goal * 0.8
                    ? "Возможно, вы недоедаете. Убедитесь, что получаете достаточно энергии"
                    : avgCalories > goal * 1.2
                    ? "Превышение нормы калорий. Проверьте размеры порций"
                    : "Отличный баланс калорий для поддержания формы!"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
})
