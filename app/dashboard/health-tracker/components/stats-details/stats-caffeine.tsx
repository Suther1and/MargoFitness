"use client"

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

interface StatsCaffeineProps {
  period: string
}

const CAFFEINE_DATA = [
  { date: "Пн", value: 2 },
  { date: "Вт", value: 3 },
  { date: "Ср", value: 1 },
  { date: "Чт", value: 2 },
  { date: "Пт", value: 1 },
  { date: "Сб", value: 0 },
  { date: "Вс", value: 1 },
]

const chartConfig = {
  value: {
    label: "Кофеин",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function StatsCaffeine({ period }: StatsCaffeineProps) {
  const avgDaily = (CAFFEINE_DATA.reduce((acc, day) => acc + day.value, 0) / CAFFEINE_DATA.length).toFixed(1)
  const daysWithoutCaffeine = CAFFEINE_DATA.filter(day => day.value === 0).length

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
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Кофеин</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Потребление за период</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white tabular-nums">
                {avgDaily}
              </div>
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                чашек/день
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={CAFFEINE_DATA} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="caffeineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                </linearGradient>
              </defs>
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
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="value"
                fill="url(#caffeineGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </Card>
      </motion.div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ потребления</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {parseFloat(avgDaily) <= 2 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">✅ Умеренное потребление</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    В среднем <span className="font-bold text-white">{avgDaily} чашек в день</span> — 
                    это безопасный уровень! Кофеин не влияет негативно на ваше здоровье.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      В пределах нормы
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgDaily) <= 4 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">⚠️ Повышенное потребление</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    В среднем <span className="font-bold text-white">{avgDaily} чашек в день</span>. 
                    Рекомендуется снизить до 2-3 чашек для улучшения качества сна.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Moon className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Следите за сном
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
                    <Coffee className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">🚨 Высокое потребление</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    <span className="font-bold text-white">{avgDaily} чашек в день</span> — это много! 
                    Избыток кофеина вызывает тревожность и нарушает сон.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Target className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Снизьте дозу
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ паттернов */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {daysWithoutCaffeine > 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Отлично!</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Вы делали перерывы <span className="font-bold text-white">{daysWithoutCaffeine} {daysWithoutCaffeine === 1 ? 'день' : 'дня'}</span>. 
                  Это помогает избежать зависимости.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Без перерывов</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Вы пили кофе каждый день. Рекомендуем делать <span className="font-bold text-white">1-2 дня</span> отдыха 
                  в неделю.
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Влияние на сон</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {parseFloat(avgDaily) > 3 ? (
                  <>При <span className="font-bold text-white">3+ чашках</span> качество сна снижается на <span className="font-bold text-orange-400">15%</span>.</>
                ) : (
                  <>Ваш уровень кофеина незначительно влияет на сон.</>
                )}
              </p>
            </div>
          </div>

          {/* Информация о норме */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Безопасная норма:</span>
                <span className="font-bold text-white">до 400 мг/день</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Ваше потребление:</span>
                <span className="font-bold text-orange-400">~{Math.round(parseFloat(avgDaily) * 95)} мг/день</span>
              </div>
              <p className="text-[11px] text-white/50 mt-2 pt-2 border-t border-white/10">
                💡 Одна чашка кофе содержит в среднем 95 мг кофеина
              </p>
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Coffee className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Рекомендации</span>
            </div>
            <div className="space-y-2">
              {parseFloat(avgDaily) <= 2 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Отличный баланс! Продолжайте пить кофе в первой половине дня. 
                  Последнюю чашку — <span className="font-bold text-white">не позднее 15:00</span>.
                </p>
              )}
              {parseFloat(avgDaily) > 2 && parseFloat(avgDaily) <= 4 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Попробуйте заменить <span className="font-bold text-white">1-2 чашки кофе</span> на зеленый чай. 
                  Он содержит меньше кофеина, но тоже бодрит.
                </p>
              )}
              {parseFloat(avgDaily) > 4 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Снижайте постепенно на <span className="font-bold text-white">1 чашку в неделю</span>, 
                  чтобы избежать головных болей. Целевая норма — 2-3 чашки в день.
                </p>
              )}
              {daysWithoutCaffeine === 0 && (
                <p className="text-xs text-white/70 leading-relaxed mt-2">
                  🎯 Делайте <span className="font-bold text-white">caffeine-free дни</span> в выходные, 
                  чтобы сохранить чувствительность к кофеину.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

