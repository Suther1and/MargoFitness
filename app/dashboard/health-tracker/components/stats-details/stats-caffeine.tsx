"use client"

import { useState, useEffect } from "react"
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
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { getCaffeineStats } from "@/lib/actions/health-stats"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface StatsCaffeineProps {
  dateRange: { start: Date; end: Date }
}

const chartConfig = {
  value: {
    label: "Кофеин",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsCaffeine({ dateRange }: StatsCaffeineProps) {
  const { settings, isLoaded: isSettingsLoaded } = useTrackerSettings()
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setIsLoading(false)
          return
        }
        
        const result = await getCaffeineStats(user.id, dateRange)
        
        if (result.success && result.data) {
          const chartData = result.data.map(entry => ({
            date: format(new Date(entry.date), 'd MMM', { locale: ru }),
            value: entry.caffeine || 0
          }))
          
          setData(chartData)
        }
      } catch (err) {
        console.error('Error loading caffeine stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (isSettingsLoaded) {
      loadData()
    }
  }, [dateRange, isSettingsLoaded])
  
  if (!isSettingsLoaded || isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных о кофеине...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет данных о кофеине</h3>
          <p className="text-white/40 text-sm">Начните отслеживать потребление кофеина</p>
        </div>
      </div>
    )
  }

  const avgDaily = (data.reduce((acc, day) => acc + day.value, 0) / data.length).toFixed(1)
  const daysWithoutCaffeine = data.filter(day => day.value === 0).length

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
      className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
    >
      <div className="space-y-6">
        {/* График */}
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black uppercase tracking-wide text-white/90 truncate">Потребление кофеина</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] truncate">За выбранный период</p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  fill="#f59e0b" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      {/* Статистика справа */}
      <div className="space-y-4">
        {/* Средний показатель */}
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-amber-600" />
                <div>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Среднее в день</div>
                  <div className="text-2xl font-black text-white tracking-tight tabular-nums">{avgDaily} <span className="text-sm text-white/40">чашек</span></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Дни без кофеина */}
        <motion.div variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-8 h-8 text-indigo-400" />
                <div>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Без кофеина</div>
                  <div className="text-2xl font-black text-white tracking-tight tabular-nums">{daysWithoutCaffeine} <span className="text-sm text-white/40">дн.</span></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Оценка */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-600/20 backdrop-blur-xl p-5">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Рекомендации</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  {parseFloat(avgDaily) > 3 
                    ? "Постарайтесь снизить потребление кофеина до 2-3 чашек в день для лучшего сна"
                    : parseFloat(avgDaily) > 1.5
                    ? "Отличный баланс! Умеренное потребление кофеина помогает поддерживать энергию"
                    : "Низкое потребление кофеина. Если чувствуете усталость, можно добавить одну чашку утром"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
