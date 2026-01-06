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
  if (period === '360d') return Array.from({ length: 52 }, (_, i) => ({ value: Math.random() * 100, label: `W${i + 1}` }))
  return Array.from({ length: 52 }, (_, i) => ({ value: Math.random() * 100, label: `W${i + 1}` }))
}

const chartConfig = {
  value: {
    label: "Выполнение",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsHabits({ period }: StatsHabitsProps) {
  const avgCompletion = WEEKLY_COMPLETION.length > 0 
    ? Math.round(WEEKLY_COMPLETION.reduce((acc, d) => acc + d.value, 0) / WEEKLY_COMPLETION.length)
    : 0
  const heatmapData = getHeatmapData(period)
  
  // Расчет динамических метрик из данных
  const bestHabit = HABIT_STATS.length > 0 
    ? HABIT_STATS.reduce((max, habit) => habit.streak > max.streak ? habit : max, HABIT_STATS[0])
    : { name: "Привычки", streak: 0 }
  const totalTasks = HABIT_STATS.reduce((acc, h) => acc + h.total, 0)
  const completedTasks = HABIT_STATS.reduce((acc, h) => acc + h.completed, 0)
  const totalHabits = HABIT_STATS.length
  
  // Анализ выходных vs будни
  const weekdayCompletion = WEEKLY_COMPLETION.slice(0, 5).length > 0
    ? WEEKLY_COMPLETION.slice(0, 5).reduce((acc, d) => acc + d.value, 0) / Math.max(1, WEEKLY_COMPLETION.slice(0, 5).length)
    : 0
  const weekendCompletion = WEEKLY_COMPLETION.slice(5).length > 0
    ? WEEKLY_COMPLETION.slice(5).reduce((acc, d) => acc + d.value, 0) / Math.max(1, WEEKLY_COMPLETION.slice(5).length)
    : 0
  const weekendDrop = weekdayCompletion > 0 
    ? Math.round(((weekdayCompletion - weekendCompletion) / weekdayCompletion) * 100)
    : 0

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
      {/* Объединенный блок: График + Тепловая карта */}
      <motion.div variants={item}>
        <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
          {/* Заголовок с показателем */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-white/5 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">Дисциплина</h3>
                <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                  {period === '7d' ? 'Последние 7 дней' : 
                   period === '30d' ? 'Последние 30 дней' : 
                   period === '180d' ? 'Последние 6 месяцев' : 
                   'Последний год'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums leading-none">
                {avgCompletion}<span className="text-sm text-white/30 font-medium">%</span>
              </div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-1">
                Средний процент
              </p>
            </div>
          </div>

          {/* График для 7 дней */}
          {period === '7d' && (
            <div className="mb-6">
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
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
          )}

          {/* Тепловая карта активности */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {period === '7d' ? 'Недельная активность' : 
                 period === '30d' ? 'Месячная активность' : 
                 period === '180d' ? 'Активность за 6 месяцев' : 
                 'Годовая активность'}
              </span>
              {/* Легенда */}
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

            <div className={cn(
              "grid gap-2",
              period === '7d' ? "grid-cols-7" : 
              period === '30d' ? "grid-cols-10" : 
              period === '180d' ? "grid-cols-13" :
              "grid-cols-15"
            )}>
              {heatmapData.map((data, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-sm md:rounded-md transition-colors hover:scale-110 cursor-pointer"
                  style={{ 
                    backgroundColor: data.value > 80 ? 'rgba(245,158,11,0.8)' : 
                                     data.value > 50 ? 'rgba(245,158,11,0.5)' : 
                                     data.value > 20 ? 'rgba(245,158,11,0.25)' : 
                                     'rgba(255,255,255,0.05)'
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

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ дисциплины</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {avgCompletion >= 80 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-400 font-bold mb-1.5">🔥 Железная дисциплина!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Средний процент выполнения <span className="font-bold text-white">{avgCompletion}%</span> — это отличный результат! 
                    Вы формируете устойчивые привычки.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Продолжайте в том же духе
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : avgCompletion >= 60 ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 font-bold mb-1.5">Хороший прогресс</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Выполнение на уровне <span className="font-bold text-white">{avgCompletion}%</span>. 
                    До отличного результата осталось совсем немного!
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Flame className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                      Еще {80 - avgCompletion}% до цели
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">Есть потенциал для роста</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Выполнение <span className="font-bold text-white">{avgCompletion}%</span>. 
                    Начните с 2-3 простых привычек и постепенно добавляйте новые.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Zap className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Фокус на приоритетах
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ паттернов */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Лучший стрик</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Привычка <span className="font-bold text-white">"{bestHabit.name}"</span> с серией 
                <span className="font-bold text-orange-400"> {bestHabit.streak} {bestHabit.streak === 1 ? 'день' : bestHabit.streak < 5 ? 'дня' : 'дней'}</span> — ваша суперсила!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Слабое место</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {weekendDrop > 0 ? (
                  <>В выходные выполнение падает на <span className="font-bold text-white">{weekendDrop}%</span>. Планируйте привычки заранее.</>
                ) : (
                  <>В выходные выполнение <span className="font-bold text-emerald-400">стабильное</span>. Отличная дисциплина!</>
                )}
              </p>
            </div>
          </div>

          {/* Статистика привычек */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Всего выполнено:</span>
                <span className="font-bold text-white">{completedTasks} / {totalTasks} задач</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Активных привычек:</span>
                <span className="font-bold text-amber-400">{totalHabits} {totalHabits === 1 ? 'цель' : totalHabits < 5 ? 'цели' : 'целей'}</span>
              </div>
              <p className="text-[11px] text-white/50 mt-2 pt-2 border-t border-white/10">
                💡 Совет: {totalHabits > 8 ? 'Вы отслеживаете много привычек. Сфокусируйтесь на 3-5 ключевых.' : 'Не перегружайте себя. Начните с 3-5 ключевых привычек и доведите их до автоматизма.'}
              </p>
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Стратегия на неделю</span>
            </div>
            <div className="space-y-2">
              {avgCompletion < 60 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Сократите количество привычек до <span className="font-bold text-white">3-5 самых важных</span>. 
                  Лучше выполнять меньше, но стабильно, чем много и хаотично.
                </p>
              )}
              {avgCompletion >= 60 && avgCompletion < 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Перенесите сложные привычки на <span className="font-bold text-white">утреннее время</span> в выходные. 
                  Это повысит стабильность выполнения на 20-30%.
                </p>
              )}
              {avgCompletion >= 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Отличная дисциплина! Теперь можно добавить <span className="font-bold text-white">1-2 новые привычки</span>, 
                  которые выведут вас на следующий уровень.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

