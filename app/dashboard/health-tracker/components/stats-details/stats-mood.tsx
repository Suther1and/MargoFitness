"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Smile, Zap, TrendingUp, Award } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { getMoodStats } from "@/lib/actions/health-stats"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { serializeDateRange } from "../../utils/query-utils"
import { DateRange } from "../../types"

interface StatsMoodProps {
  userId: string | null
  dateRange: DateRange
}

const chartConfig = {
  mood: { label: "Настроение", color: "#ec4899" },
  energy: { label: "Энергия", color: "#f59e0b" }
} satisfies ChartConfig

export const StatsMood = memo(function StatsMood({ userId, dateRange }: StatsMoodProps) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['stats', 'mood', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return null
      return await getMoodStats(userId, dateRange)
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data)) return []
    
    return rawData.data.map((entry: any) => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      mood: entry.mood || 0,
      energy: entry.energy || 0
    }))
  }, [rawData])
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-400/20 border-t-pink-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о настроении...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Smile className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о настроении</h3>
          <p className="text-white/40 text-sm">Начните отслеживать настроение и энергию</p>
        </div>
      </div>
    )
  }

  const avgMood = (data.reduce((acc, d) => acc + d.mood, 0) / data.length).toFixed(1)
  const avgEnergy = (data.reduce((acc, d) => acc + d.energy, 0) / data.length).toFixed(1)
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-pink-400/10 border border-pink-400/20 flex items-center justify-center">
              <Smile className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-white/90">Настроение и энергия</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">За выбранный период</p>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 4 }} />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
          </ChartContainer>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3">
              <Smile className="w-8 h-8 text-pink-400" />
              <div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Настроение</div>
                <div className="text-2xl font-black text-white">{avgMood}<span className="text-sm text-white/40">/5</span></div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400" />
              <div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Энергия</div>
                <div className="text-2xl font-black text-white">{avgEnergy}<span className="text-sm text-white/40">/10</span></div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20 backdrop-blur-xl p-5">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-pink-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Анализ</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {parseFloat(avgMood) >= 4 && parseFloat(avgEnergy) >= 7
                  ? "Отличные показатели! Вы в гармонии с собой"
                  : parseFloat(avgMood) < 3 || parseFloat(avgEnergy) < 5
                  ? "Возможно, стоит больше отдыхать и уделить внимание восстановлению"
                  : "Хорошие показатели, продолжайте следить за самочувствием"}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
})
