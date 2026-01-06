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

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-emerald-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <Award className="w-4 h-4 text-pink-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Инсайты</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Ваше настроение в целом хорошее - средний балл {avgMood}/5
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

