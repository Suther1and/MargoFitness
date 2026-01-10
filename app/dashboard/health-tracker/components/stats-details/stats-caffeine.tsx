"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { TrackerSettings } from "../../types"
import { serializeDateRange } from "../../utils/query-utils"

interface StatsCaffeineProps {
  userId: string | null
  settings: TrackerSettings
  dateRange: { start: Date; end: Date }
}

const chartConfig = {
  value: {
    label: "Кофеин",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export const StatsCaffeine = memo(function StatsCaffeine({ userId, settings, dateRange }: StatsCaffeineProps) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data: rawData, isLoading, isFetching } = useQuery({
    queryKey: ['stats', 'caffeine', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return null
      
      const supabase = createClient()
      const startStr = format(dateRange.start, 'yyyy-MM-dd')
      const endStr = format(dateRange.end, 'yyyy-MM-dd')
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('date, metrics')
        .eq('user_id', userId)
        .gte('date', startStr)
        .lt('date', endStr)
        .order('date', { ascending: true })
      
      if (error) return { success: false, data: [] }
      
      const caffeineData = data?.map(entry => ({
        date: entry.date,
        caffeine: (entry.metrics as any)?.caffeine || 0
      })) || []
      
      return { success: true, data: caffeineData }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const data = useMemo(() => {
    if (!rawData?.success || !rawData.data || !Array.isArray(rawData.data)) return []
    
    return rawData.data.map((entry: any) => ({
      date: format(new Date(entry.date), 'd MMM', { locale: ru }),
      value: entry.caffeine || 0
    }))
  }, [rawData])
  
  if (isLoading) {
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

  const avgDaily = parseFloat((data.reduce((acc, day) => acc + day.value, 0) / data.length).toFixed(1))
  const daysWithoutCaffeine = data.filter(day => day.value === 0).length
  
  // Самый активный день
  const maxDay = data.reduce((max, day) => day.value > max.value ? day : max, data[0])
  
  // % дней без кофеина
  const detoxPercent = Math.round((daysWithoutCaffeine / data.length) * 100)

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
          <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-white/5 flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Потребление кофеина</h3>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                    За выбранный период
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white tabular-nums leading-none">
                  {avgDaily.toFixed(1)}<span className="text-sm text-white/30 font-medium">{avgDaily === 1 ? ' чашка' : ' чашки'}</span>
                </div>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-1">
                  В среднем в день
                </p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                  tickMargin={12}
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
          </div>
        </motion.div>
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ потребления</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* БЛОК 1: Главная оценка потребления кофеина */}
          {avgDaily === 0 ? (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-cyan-400 font-bold mb-1.5">🌿 Без кофеина</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы не употребляете кофеин — отличный выбор для чистого сна и стабильной энергии без зависимости.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                      Чистый режим
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgDaily > 0 && avgDaily <= 1 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">✅ Умеренное потребление</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    В среднем <span className="font-bold text-white">{avgDaily.toFixed(1)} {avgDaily === 1 ? 'чашка' : 'чашки'}</span> в день — минимальная доза для легкого тонуса без негативных эффектов.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Здоровая норма
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgDaily > 1 && avgDaily <= 3 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-400 font-bold mb-1.5">☕ Баланс найден</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее потребление <span className="font-bold text-white">{avgDaily.toFixed(1)} чашки</span> в день — оптимально для бодрости. 
                    Следите за временем последней чашки (не позже 14:00).
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Оптимальная доза
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgDaily > 3 && avgDaily <= 5 ? (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">⚠️ Высокая доза</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы употребляете <span className="font-bold text-white">{avgDaily.toFixed(1)} чашки</span> в день — это может влиять на качество сна и вызывать зависимость. 
                    Рекомендуется снизить до 2-3.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Превышение нормы
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-bold mb-1.5">🚨 Опасная доза</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Среднее <span className="font-bold text-white">{avgDaily.toFixed(1)} чашки</span> в день — критически много. 
                    Высокий риск бессонницы, тревожности и сердечно-сосудистых проблем. Срочно снижайте дозу.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                      Критично
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* БЛОК 2: Анализ паттернов */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Карточка А: Самый активный день */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Coffee className={cn(
                  "w-4 h-4",
                  maxDay.value <= 3 ? "text-emerald-400" : maxDay.value <= 5 ? "text-amber-400" : "text-red-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  maxDay.value <= 3 ? "text-emerald-400" : maxDay.value <= 5 ? "text-amber-400" : "text-red-400"
                )}>Максимум</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {maxDay.value <= 3 ? (
                  <>
                    <span className="font-bold text-white">Пик под контролем ✅</span><br />
                    {maxDay.date}: {maxDay.value} {maxDay.value === 1 ? 'чашка' : maxDay.value < 5 ? 'чашки' : 'чашек'}
                  </>
                ) : maxDay.value <= 5 ? (
                  <>
                    <span className="font-bold text-white">Высокий пик ⚡</span><br />
                    {maxDay.date}: {maxDay.value} {maxDay.value < 5 ? 'чашки' : 'чашек'}
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Опасный пик 🚨</span><br />
                    {maxDay.date}: {maxDay.value} чашек
                  </>
                )}
              </p>
            </div>

            {/* Карточка Б: Дни детокса */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Moon className={cn(
                  "w-4 h-4",
                  detoxPercent >= 30 ? "text-emerald-400" : detoxPercent >= 10 ? "text-blue-400" : "text-orange-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  detoxPercent >= 30 ? "text-emerald-400" : detoxPercent >= 10 ? "text-blue-400" : "text-orange-400"
                )}>Дни детокса</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {detoxPercent >= 30 ? (
                  <>
                    <span className="font-bold text-white">Регулярные паузы 🌿</span><br />
                    {detoxPercent}% дней без кофеина
                  </>
                ) : detoxPercent >= 10 ? (
                  <>
                    <span className="font-bold text-white">Редкие паузы 📊</span><br />
                    {detoxPercent}% дней без кофеина
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Зависимость ⚠️</span><br />
                    {detoxPercent}% дней без кофеина
                  </>
                )}
              </p>
            </div>
          </div>

          {/* БЛОК 3: Практические рекомендации */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Практические советы</span>
            </div>
            <div className="space-y-2">
              {avgDaily === 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    ✨ Вы избегаете кофеина — это здорово для сна и нервной системы
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🍵 Если нужен тонус — попробуйте зеленый чай (меньше кофеина, больше антиоксидантов)
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    💧 Для бодрости пейте больше воды и высыпайтесь
                  </p>
                </div>
              ) : avgDaily > 0 && avgDaily <= 1 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    ⏰ Пейте кофе до 12:00 для лучшего сна
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    💊 Вы не зависите от кофеина — отличная дисциплина
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🚰 Запивайте каждую чашку стаканом воды для гидратации
                  </p>
                </div>
              ) : avgDaily > 1 && avgDaily <= 3 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    ☕ Придерживайтесь правила: последняя чашка не позже 14:00
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    📉 Постепенно снижайте дозу, если чувствуете раздражительность без кофе
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🔄 Делайте 2-3 дня "детокса" в месяц для сброса толерантности
                  </p>
                </div>
              ) : avgDaily > 3 && avgDaily <= 5 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    📉 Снижайте на 1 чашку каждую неделю, чтобы избежать синдрома отмены
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🌅 Замените послеобеденный кофе на прогулку — естественный прилив энергии
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    😴 Проверьте качество сна — возможно, кофе мешает восстановлению
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🚨 Срочно снижайте дозу под контролем врача (риск абстинентного синдрома)
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    💊 Замените часть кофе на декаф — вкус останется, кофеина меньше
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🩺 Проверьте давление и сердечный ритм при таких дозах
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* БЛОК 4: Влияние кофеина на организм */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Влияние кофеина</span>
            </div>
            {avgDaily <= 2 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Кофеин повышает <span className="font-bold text-white">концентрацию и выносливость</span> на 10-15%
                </p>
                <p className="text-[11px] text-white/50">
                  Умеренное потребление снижает риск диабета 2 типа и болезни Паркинсона
                </p>
              </div>
            ) : avgDaily > 2 && avgDaily <= 3 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Период полувыведения кофеина — <span className="font-bold text-white">5-6 часов</span>. Кофе в 16:00 = 25% кофеина к 22:00
                </p>
                <p className="text-[11px] text-white/50">
                  Регулярные паузы в потреблении предотвращают развитие толерантности
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Избыток кофеина повышает <span className="font-bold text-white">кортизол</span> — гормон стресса, ухудшая восстановление
                </p>
                <p className="text-[11px] text-white/50">
                  Более 400мг/день (4-5 чашек) увеличивают риск тревожности и нарушений сна
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})
