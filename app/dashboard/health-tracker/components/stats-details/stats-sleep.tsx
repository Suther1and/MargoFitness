"use client"

import { motion } from "framer-motion"
import { Moon, Target, Award, Zap } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsSleepProps {
  period: string
}

const SLEEP_DATA = [
  { date: "Пн", hours: 7.2, quality: 75 },
  { date: "Вт", hours: 8.1, quality: 88 },
  { date: "Ср", hours: 6.8, quality: 70 },
  { date: "Чт", hours: 7.5, quality: 80 },
  { date: "Пт", hours: 7.8, quality: 85 },
  { date: "Сб", hours: 8.5, quality: 92 },
  { date: "Вс", hours: 7.3, quality: 78 },
]

const chartConfig = {
  hours: {
    label: "Часы",
    color: "#818cf8",
  },
  quality: {
    label: "Качество",
    color: "#a78bfa",
  },
} satisfies ChartConfig

export function StatsSleep({ period }: StatsSleepProps) {
  const avgHours = (SLEEP_DATA.reduce((acc, day) => acc + day.hours, 0) / SLEEP_DATA.length).toFixed(1)
  const avgQuality = Math.round(SLEEP_DATA.reduce((acc, day) => acc + day.quality, 0) / SLEEP_DATA.length)
  const goal = 8.0
  const bestSleep = SLEEP_DATA.reduce((max, day) => day.quality > max.quality ? day : max, SLEEP_DATA[0])

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
      className="space-y-6"
    >
      {/* График */}
      <motion.div variants={item}>
        <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Сон</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Продолжительность и качество</p>
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart data={SLEEP_DATA} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="rgba(255,255,255,0.2)"
                fontSize={10}
                fontWeight="bold"
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="hours"
                type="monotone"
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ r: 4, fill: "#818cf8" }}
              />
              <Line
                dataKey="quality"
                type="monotone"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={{ r: 4, fill: "#a78bfa" }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ChartContainer>
        </Card>
      </motion.div>

      {/* Метрики */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400/60">Среднее</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgHours} <span className="text-sm text-white/40">ч</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Часов сна
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60">Качество</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgQuality}<span className="text-sm text-white/40">%</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            В среднем
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
          {parseFloat(avgHours) >= goal && avgQuality >= 80 ? (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-indigo-400 font-bold mb-1.5">⭐ Отличный сон!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Спите <span className="font-bold text-white">{avgHours} часов</span> с качеством 
                    <span className="font-bold text-white"> {avgQuality}%</span> — идеальные показатели! 
                    Это основа вашего здоровья.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Продолжайте в том же духе
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgHours) >= goal && avgQuality < 80 ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-300 font-bold mb-1.5">Хорошо, но можно лучше</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Спите достаточно (<span className="font-bold text-white">{avgHours} ч</span>), 
                    но качество <span className="font-bold text-white">{avgQuality}%</span> можно улучшить. 
                    Проверьте условия для сна.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Moon className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      Улучшите гигиену сна
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgHours) < goal && avgQuality >= 80 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">Мало спите</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Качество сна хорошее (<span className="font-bold text-white">{avgQuality}%</span>), 
                    но спите всего <span className="font-bold text-white">{avgHours} ч</span>. 
                    Добавьте еще <span className="font-bold text-amber-300">{(goal - parseFloat(avgHours)).toFixed(1)} ч</span>.
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
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">⚠️ Недостаток сна</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Спите <span className="font-bold text-white">{avgHours} ч</span> с качеством 
                    <span className="font-bold text-white"> {avgQuality}%</span>. 
                    Оба показателя ниже нормы — это влияет на здоровье.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Target className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Пересмотрите режим
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ продолжительности и качества */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Качество</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {avgQuality >= 85 ? (
                  <>Отлично! <span className="font-bold text-white">{avgQuality}%</span> — глубокий восстановительный сон.</>
                ) : avgQuality >= 70 ? (
                  <>Норма. <span className="font-bold text-white">{avgQuality}%</span> — можно улучшить условия.</>
                ) : (
                  <>Плохо. <span className="font-bold text-white">{avgQuality}%</span> — проверьте матрас, шум, свет.</>
                )}
              </p>
            </div>
          </div>

          {/* Лучший день */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Лучший сон</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/60">
                <span className="font-bold text-white">{bestSleep.date}</span> — 
                <span className="font-bold text-white"> {bestSleep.hours}ч</span> с качеством 
                <span className="font-bold text-indigo-400"> {bestSleep.quality}%</span>
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
              {avgQuality < 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Для улучшения качества: <span className="font-bold text-white">темнота, тишина, 18-20°C</span> в комнате. 
                  Проветривайте перед сном.
                </p>
              )}
              {parseFloat(avgHours) >= goal && avgQuality >= 80 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Идеальный режим! Поддерживайте <span className="font-bold text-white">постоянное время</span> отхода ко сну 
                  даже в выходные.
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

