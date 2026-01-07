"use client"

import { motion } from "framer-motion"
import { Moon, Target, Award } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface StatsSleepProps {
  period: string
}

const SLEEP_DATA = [
  { date: "Пн", hours: 7.2 },
  { date: "Вт", hours: 8.1 },
  { date: "Ср", hours: 6.8 },
  { date: "Чт", hours: 7.5 },
  { date: "Пт", hours: 7.8 },
  { date: "Сб", hours: 8.5 },
  { date: "Вс", hours: 7.3 },
]

const chartConfig = {
  hours: {
    label: "Часы сна",
    color: "#818cf8",
  },
} satisfies ChartConfig

export function StatsSleep({ period }: StatsSleepProps) {
  const avgHours = (SLEEP_DATA.reduce((acc, day) => acc + day.hours, 0) / SLEEP_DATA.length).toFixed(1)
  const goal = 8.0
  const bestSleep = SLEEP_DATA.reduce((max, day) => day.hours > max.hours ? day : max, SLEEP_DATA[0])
  const worstSleep = SLEEP_DATA.reduce((min, day) => day.hours < min.hours ? day : min, SLEEP_DATA[0])
  const daysWithGoodSleep = SLEEP_DATA.filter(day => day.hours >= 7).length

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
      {/* График */}
      <motion.div variants={item}>
        <div className="bg-[#121214]/60 border border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-white/5 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">Сон</h3>
                <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                  {daysWithGoodSleep}/{SLEEP_DATA.length} дней с хорошим сном (7+ ч)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums leading-none">
                {avgHours}<span className="text-sm text-white/30 font-medium">ч</span>
              </div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-1 whitespace-nowrap">
                Средн.
              </p>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={SLEEP_DATA} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
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
              <YAxis hide domain={[0, 10]} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  formatter={(value) => [`${value} часов`, 'Сон']}
                />}
              />
              <ReferenceLine 
                y={goal} 
                stroke="rgba(129, 140, 248, 0.3)" 
                strokeDasharray="5 5"
                label={{ value: 'Цель', position: 'right', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              />
              <Bar
                dataKey="hours"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              >
                {SLEEP_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.hours >= 8 ? "#818cf8" : 
                      entry.hours >= 7 ? "rgba(129, 140, 248, 0.6)" : 
                      entry.hours >= 6 ? "rgba(251, 191, 36, 0.6)" :
                      "rgba(239, 68, 68, 0.6)"
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Легенда */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#818cf8]" />
              <span className="text-white/60 font-medium">≥8ч (отлично)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[rgba(129,140,248,0.6)]" />
              <span className="text-white/60 font-medium">7-8ч (хорошо)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[rgba(251,191,36,0.6)]" />
              <span className="text-white/60 font-medium">6-7ч (мало)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[rgba(239,68,68,0.6)]" />
              <span className="text-white/60 font-medium">&lt;6ч (недостаток)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ сна</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {parseFloat(avgHours) >= 8 ? (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-indigo-400 font-bold mb-1.5">⭐ Идеально!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы спите <span className="font-bold text-white">{avgHours} часов</span> — это оптимальная продолжительность
                    для полноценного восстановления организма и отличного самочувствия.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Продолжайте в том же духе
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgHours) >= 7 ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-300 font-bold mb-1.5">Хорошо, но можно лучше</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Спите <span className="font-bold text-white">{avgHours} ч</span> — это нормально, но для полноценного
                    восстановления рекомендуется <span className="font-bold text-white">8+ часов</span>.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Target className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      Добавьте {(goal - parseFloat(avgHours)).toFixed(1)} ч
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgHours) >= 6 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">⚠️ Мало спите</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Спите всего <span className="font-bold text-white">{avgHours} ч</span>. 
                    Это может привести к усталости и снижению продуктивности. 
                    Добавьте <span className="font-bold text-amber-300">{(goal - parseFloat(avgHours)).toFixed(1)} ч</span>.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Target className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Ложитесь раньше
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
                    <Moon className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-bold mb-1.5">🚨 Критический недостаток сна</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Спите <span className="font-bold text-white">{avgHours} ч</span> — это значительно ниже нормы
                    и негативно влияет на здоровье, иммунитет и когнитивные функции.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Target className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                      Срочно увеличьте сон до {goal}ч
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ продолжительности */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Продолжительность</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              {parseFloat(avgHours) >= 8 ? (
                <>Оптимально! <span className="font-bold text-white">8+ часов</span> восстанавливают организм.</>
              ) : parseFloat(avgHours) >= 7 ? (
                <>Неплохо, но <span className="font-bold text-white">8 часов</span> — идеал для большинства.</>
              ) : (
                <>Критично мало. Нужно минимум <span className="font-bold text-white">7-8 часов</span> для восстановления.</>
              )}
            </p>
          </div>

          {/* Статистика */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Статистика</span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-white/60">
                Лучший день: <span className="font-bold text-white">{bestSleep.date}</span> — 
                <span className="font-bold text-indigo-400"> {bestSleep.hours}ч</span>
              </p>
              <p className="text-[11px] text-white/60">
                Худший день: <span className="font-bold text-white">{worstSleep.date}</span> — 
                <span className="font-bold text-amber-400"> {worstSleep.hours}ч</span>
              </p>
              <p className="text-[11px] text-white/60">
                Дней с хорошим сном (7+ч): <span className="font-bold text-white">{daysWithGoodSleep} из {SLEEP_DATA.length}</span>
              </p>
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Рекомендации</span>
            </div>
            <div className="space-y-2">
              {parseFloat(avgHours) < 7 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Ложитесь на <span className="font-bold text-white">{Math.round((goal - parseFloat(avgHours)) * 60)} минут</span> раньше. 
                  Установите будильник за час до сна для подготовки.
                </p>
              )}
              {parseFloat(avgHours) >= goal && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Идеальный режим! Поддерживайте <span className="font-bold text-white">постоянное время</span> отхода ко сну 
                  даже в выходные для стабильного циркадного ритма.
                </p>
              )}
              {parseFloat(avgHours) >= 7 && parseFloat(avgHours) < 8 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Для достижения идеала: <span className="font-bold text-white">темнота, тишина, 18-20°C</span> в комнате. 
                  Проветривайте перед сном.
                </p>
              )}
              <p className="text-xs text-white/70 leading-relaxed pt-2 border-t border-white/10">
                💡 Избегайте экранов за <span className="font-bold text-white">1-2 часа</span> до сна. 
                Синий свет подавляет мелатонин.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

