"use client"

import { motion } from "framer-motion"
import { Smile, Frown, Meh, Laugh, Annoyed, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsMoodProps {
  period: string
}

const MOOD_DATA = [
  { date: "Пн", mood: 4, energy: 7 },
  { date: "Вт", mood: 5, energy: 8 },
  { date: "Ср", mood: 3, energy: 6 },
  { date: "Чт", mood: 4, energy: 7 },
  { date: "Пт", mood: 5, energy: 9 },
  { date: "Сб", mood: 4, energy: 7 },
  { date: "Вс", mood: 3, energy: 6 },
]

const MOOD_ICONS = [
  { rating: 1, icon: Frown, color: "text-red-400", label: "Плохое" },
  { rating: 2, icon: Annoyed, color: "text-orange-400", label: "Так себе" },
  { rating: 3, icon: Meh, color: "text-yellow-400", label: "Нормальное" },
  { rating: 4, icon: Smile, color: "text-emerald-400", label: "Хорошее" },
  { rating: 5, icon: Laugh, color: "text-pink-400", label: "Отличное" },
]

export function StatsMood({ period }: StatsMoodProps) {
  const avgMood = (MOOD_DATA.reduce((acc, day) => acc + day.mood, 0) / MOOD_DATA.length).toFixed(1)
  const avgEnergy = (MOOD_DATA.reduce((acc, day) => acc + day.energy, 0) / MOOD_DATA.length).toFixed(1)

  const moodCounts = MOOD_DATA.reduce((acc, day) => {
    acc[day.mood] = (acc[day.mood] || 0) + 1
    return acc
  }, {} as Record<number, number>)

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
      {/* Календарная тепловая карта */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
            <Smile className="w-4 h-4 text-pink-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Настроение за период</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {MOOD_DATA.map((day, index) => {
            const moodIcon = MOOD_ICONS.find(m => m.rating === day.mood)
            const Icon = moodIcon?.icon || Smile

            return (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "aspect-square rounded-xl p-2 flex flex-col items-center justify-center gap-1",
                  day.mood >= 4 ? "bg-emerald-500/20 border border-emerald-500/30" :
                  day.mood === 3 ? "bg-yellow-500/20 border border-yellow-500/30" :
                  "bg-orange-500/20 border border-orange-500/30"
                )}
              >
                <Icon className={cn("w-5 h-5", moodIcon?.color)} />
                <span className="text-[8px] font-bold text-white/60">{day.date}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Средние показатели */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-pink-400/60">Настроение</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgMood}<span className="text-sm text-white/40">/5</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            В среднем
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/60">Энергия</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {avgEnergy}<span className="text-sm text-white/40">/10</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            В среднем
          </div>
        </div>
      </motion.div>

      {/* Распределение настроения */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Smile className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Распределение</span>
        </div>

        <div className="space-y-2">
          {MOOD_ICONS.reverse().map((mood) => {
            const count = moodCounts[mood.rating] || 0
            const percent = (count / MOOD_DATA.length) * 100
            const Icon = mood.icon

            return (
              <div key={mood.rating} className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 flex-shrink-0", mood.color)} />
                <span className="text-xs text-white/60 w-20">{mood.label}</span>
                <div className="flex-1 relative h-6 bg-white/5 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8 }}
                    className={cn("absolute inset-y-0 left-0 rounded-lg", 
                      mood.rating >= 4 ? "bg-emerald-500/30" :
                      mood.rating === 3 ? "bg-yellow-500/30" :
                      "bg-orange-500/30"
                    )}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white">
                    {count} {count === 1 ? 'день' : 'дня'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ самочувствия</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {parseFloat(avgMood) >= 4.5 && parseFloat(avgEnergy) >= 8 ? (
            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                    <Laugh className="w-4 h-4 text-pink-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-pink-400 font-bold mb-1.5">🌟 Отличное состояние!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение <span className="font-bold text-white">{avgMood}/5</span> и энергия 
                    <span className="font-bold text-white"> {avgEnergy}/10</span> на высоте! 
                    Вы в прекрасной форме.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider">
                      Продолжайте в том же духе
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgMood) >= 3.5 && parseFloat(avgEnergy) >= 6.5 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Smile className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">😊 Хорошее самочувствие</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение <span className="font-bold text-white">{avgMood}/5</span> и энергия 
                    <span className="font-bold text-white"> {avgEnergy}/10</span> на хорошем уровне. 
                    Стабильное состояние.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Поддерживайте баланс
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : parseFloat(avgMood) >= 3 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Meh className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">😐 Среднее состояние</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение <span className="font-bold text-white">{avgMood}/5</span> и энергия 
                    <span className="font-bold text-white"> {avgEnergy}/10</span>. 
                    Есть потенциал для улучшения.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Smile className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Добавьте активности
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
                    <Frown className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">😔 Низкое настроение</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Настроение <span className="font-bold text-white">{avgMood}/5</span> и энергия 
                    <span className="font-bold text-white"> {avgEnergy}/10</span> ниже нормы. 
                    Стоит обратить внимание.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Award className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Позаботьтесь о себе
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ настроения и энергии */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Smile className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Настроение</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {parseFloat(avgMood) >= 4 ? (
                  <>Отлично! <span className="font-bold text-white">{avgMood}/5</span> — позитивное состояние.</>
                ) : parseFloat(avgMood) >= 3 ? (
                  <>Норма. <span className="font-bold text-white">{avgMood}/5</span> — можно улучшить.</>
                ) : (
                  <>Низко. <span className="font-bold text-white">{avgMood}/5</span> — нужна поддержка.</>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Энергия</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {parseFloat(avgEnergy) >= 8 ? (
                  <>Высокая! <span className="font-bold text-white">{avgEnergy}/10</span> — отличная бодрость.</>
                ) : parseFloat(avgEnergy) >= 6 ? (
                  <>Норма. <span className="font-bold text-white">{avgEnergy}/10</span> — стабильный уровень.</>
                ) : (
                  <>Низкая. <span className="font-bold text-white">{avgEnergy}/10</span> — нужен отдых.</>
                )}
              </p>
            </div>
          </div>

          {/* Анализ распределения */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Распределение дней</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Отличных дней:</span>
                <span className="font-bold text-pink-400">{moodCounts[5] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Хороших дней:</span>
                <span className="font-bold text-emerald-400">{moodCounts[4] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Средних дней:</span>
                <span className="font-bold text-yellow-400">{moodCounts[3] || 0}</span>
              </div>
              {(moodCounts[2] || 0) + (moodCounts[1] || 0) > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Плохих дней:</span>
                  <span className="font-bold text-orange-400">{(moodCounts[2] || 0) + (moodCounts[1] || 0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">Рекомендации</span>
            </div>
            <div className="space-y-2">
              {parseFloat(avgMood) < 3 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Низкое настроение может быть связано со сном, питанием или стрессом. 
                  Проверьте <span className="font-bold text-white">сон (8ч)</span> и 
                  <span className="font-bold text-white"> активность</span>.
                </p>
              )}
              {parseFloat(avgEnergy) < 6 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Низкая энергия: добавьте <span className="font-bold text-white">30 мин прогулки</span> утром, 
                  проверьте уровень витамина D и железа.
                </p>
              )}
              {parseFloat(avgMood) >= 4 && parseFloat(avgEnergy) >= 7 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Отличное состояние! Поддерживайте <span className="font-bold text-white">регулярность</span>: 
                  сон, питание, активность, общение.
                </p>
              )}
              {parseFloat(avgMood) >= 3 && parseFloat(avgMood) < 4 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Добавьте <span className="font-bold text-white">приятных активностей</span>: 
                  хобби, встречи с друзьями, природа, музыка.
                </p>
              )}
              <p className="text-xs text-white/70 leading-relaxed pt-2 border-t border-white/10">
                💡 Настроение связано с физическим здоровьем. Следите за <span className="font-bold text-white">сном, 
                питанием и движением</span> — это основа хорошего самочувствия.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

