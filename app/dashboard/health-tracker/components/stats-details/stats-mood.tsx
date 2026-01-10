"use client"

import { useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Smile, Zap, Award, Target, Frown, Meh, Laugh, Annoyed, Sun, Moon as MoonIcon } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { serializeDateRange } from "../../utils/query-utils"
import { DateRange, MoodRating } from "../../types"

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
  
  const { data: rawData, isLoading, isFetching } = useQuery({
    queryKey: ['stats', 'mood', userId, dateRangeKey],
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
      
      const moodData = data?.map(entry => ({
        date: entry.date,
        mood: (entry.metrics as any)?.mood || 0,
        energy: (entry.metrics as any)?.energy || 0
      })) || []
      
      return { success: true, data: moodData }
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

  const avgMood = parseFloat((data.reduce((acc, d) => acc + d.mood, 0) / data.length).toFixed(1))
  const avgEnergy = parseFloat((data.reduce((acc, d) => acc + d.energy, 0) / data.length).toFixed(1))
  
  // Округляем настроение до ближайшего целого для выбора смайлика
  const moodRating = Math.round(avgMood) as MoodRating
  
  // Лучший день (комбинированный показатель)
  const bestDay = data.reduce((max, day) => {
    const score = day.mood + day.energy / 2
    const maxScore = max.mood + max.energy / 2
    return score > maxScore ? day : max
  }, data[0])
  
  // Стабильность настроения (стандартное отклонение)
  const moodVariance = data.reduce((acc, d) => acc + Math.pow(d.mood - avgMood, 2), 0) / data.length
  const moodStability = Math.sqrt(moodVariance)
  
  // Смайлики для настроения
  const getMoodIcon = (rating: MoodRating) => {
    const moods = {
      1: { icon: Frown, color: 'text-red-400' },
      2: { icon: Annoyed, color: 'text-orange-400' },
      3: { icon: Meh, color: 'text-yellow-400' },
      4: { icon: Smile, color: 'text-emerald-400' },
      5: { icon: Laugh, color: 'text-pink-400' },
    }
    return moods[rating]
  }
  
  const moodIcon = getMoodIcon(moodRating)
  const MoodIcon = moodIcon.icon

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

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
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-white/5 flex items-center justify-center">
                  <Smile className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Настроение и энергия</h3>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                    За выбранный период
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Среднее настроение - смайлик */}
                <div className="flex flex-col items-center">
                  <MoodIcon className={cn("w-8 h-8", moodIcon.color)} />
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1">
                    Настроение
                  </p>
                </div>
                {/* Средняя энергия - число + палочки */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-white tabular-nums leading-none">{avgEnergy.toFixed(1)}</span>
                    <div className="flex gap-0.5 ml-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-0.5 h-4 rounded-full transition-colors",
                            avgEnergy >= i + 1 ? "bg-orange-500" : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mt-1">
                    Энергия
                  </p>
                </div>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <LineChart data={data} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                  tickMargin={12}
                />
                <YAxis 
                  domain={[0, 10]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 4 }} />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ChartContainer>
          </div>
        </motion.div>
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Эмоциональное состояние</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* БЛОК 1: Главная оценка эмоционального состояния */}
          {avgMood >= 4 && avgEnergy >= 7 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Laugh className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">✨ В отличной форме!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение {avgMood.toFixed(1)}/5 и энергия {avgEnergy.toFixed(1)}/10 — вы в гармонии с собой. 
                    Продолжайте поддерживать текущий образ жизни.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Баланс достигнут
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgMood >= 4 && avgEnergy < 7 ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Smile className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 font-bold mb-1.5">😊 Позитив есть, энергии мало</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение хорошее ({avgMood.toFixed(1)}/5), но энергия низковата ({avgEnergy.toFixed(1)}/10). 
                    Проверьте сон, питание и уровень активности.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                      Нужно восстановление
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgMood >= 3 && avgMood < 4 && avgEnergy >= 5 && avgEnergy < 7 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Meh className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">📊 Стабильное состояние</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение {avgMood.toFixed(1)}/5 и энергия {avgEnergy.toFixed(1)}/10 — средние показатели. 
                    Есть потенциал для улучшения через активность и отдых.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Есть что улучшить
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgMood < 3 && avgEnergy >= 5 ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Annoyed className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-300 font-bold mb-1.5">💭 Энергия есть, настроения нет</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    При энергии {avgEnergy.toFixed(1)}/10 настроение {avgMood.toFixed(1)}/5 — возможен стресс или выгорание. 
                    Уделите время приятным занятиям и общению.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      Эмоциональный стресс
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
                    <Frown className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-bold mb-1.5">😔 Требуется внимание</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение {avgMood.toFixed(1)}/5 и энергия {avgEnergy.toFixed(1)}/10 — низкие показатели. 
                    Важно отдохнуть, пересмотреть нагрузки и возможно обратиться к специалисту.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                      Нужен отдых
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* БЛОК 2: Анализ динамики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Карточка А: Лучший день */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Лучший день</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                <span className="font-bold text-white">{bestDay.date} — пик формы 🌟</span><br />
                Настроение {bestDay.mood}, энергия {bestDay.energy}
              </p>
            </div>

            {/* Карточка Б: Стабильность */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className={cn(
                  "w-4 h-4",
                  moodStability < 0.8 ? "text-emerald-400" : moodStability < 1.5 ? "text-blue-400" : "text-orange-400"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  moodStability < 0.8 ? "text-emerald-400" : moodStability < 1.5 ? "text-blue-400" : "text-orange-400"
                )}>Стабильность</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {moodStability < 0.8 ? (
                  <>
                    <span className="font-bold text-white">Ровное настроение ✅</span><br />
                    Высокая эмоциональная стабильность
                  </>
                ) : moodStability < 1.5 ? (
                  <>
                    <span className="font-bold text-white">Умеренные перепады 📊</span><br />
                    Есть колебания настроения
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Сильные перепады ⚡</span><br />
                    Настроение скачет — ищите триггеры
                  </>
                )}
              </p>
            </div>
          </div>

          {/* БЛОК 3: Практические рекомендации */}
          <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">Практические советы</span>
            </div>
            <div className="space-y-2">
              {avgMood >= 4 && avgEnergy >= 7 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    ✨ Вы нашли свой баланс — зафиксируйте, что работает
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    📝 Ведите дневник благодарности для закрепления позитива
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🎯 Ставьте амбициозные цели — у вас есть ресурс
                  </p>
                </div>
              ) : avgEnergy < 7 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    😴 Проверьте качество сна — возможно недосыпаете
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🥗 Сбалансируйте питание: больше белка и сложных углеводов
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🚶 Добавьте 20 минут ходьбы на свежем воздухе ежедневно
                  </p>
                </div>
              ) : avgMood < 3 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🌞 Увеличьте время на солнце — минимум 30 мин в день
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    👥 Больше общайтесь с близкими людьми
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🧘 Попробуйте медитацию или дыхательные практики 5 мин/день
                  </p>
                </div>
              ) : avgMood >= 3 && avgMood < 4 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🎨 Найдите хобби или активность, которая приносит радость
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    📱 Сократите время в соцсетях — замените на живое общение
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🏃 Добавьте физическую активность — спорт повышает эндорфины
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">
                    🛑 Возьмите паузу — переработка ухудшает все показатели
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    💊 Проверьте витамины D, B12, железо — их дефицит влияет на энергию
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    🩺 Если упадок длится {'>'} 2 недель — обратитесь к специалисту
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* БЛОК 4: Связь с другими метриками */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Влияние факторов</span>
            </div>
            {avgEnergy < 7 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Энергия напрямую связана со сном: <span className="font-bold text-white">7-9 часов</span> критичны для восстановления
                </p>
                <p className="text-[11px] text-white/50">
                  Недосып снижает настроение на 30-50% на следующий день
                </p>
              </div>
            ) : avgMood >= 3 && avgMood <= 4 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  <span className="font-bold text-white">30 минут упражнений</span> повышают настроение на 6-8 часов
                </p>
                <p className="text-[11px] text-white/50">
                  Физическая активность — естественный антидепрессант (эндорфины)
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Дефицит <span className="font-bold text-white">магния и омега-3</span> напрямую влияет на настроение
                </p>
                <p className="text-[11px] text-white/50">
                  Быстрые углеводы дают скачок энергии, но потом резкий спад
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})
