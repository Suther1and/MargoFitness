"use client"

import { motion } from "framer-motion"
import { NotebookText, Droplets, Footprints, Moon, Coffee, Scale, Smile, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import { NoteWithContext } from "../../types"

interface StatsNotesProps {
  period: string
}

// Моковые данные с контекстом дня
const NOTES_DATA: NoteWithContext[] = [
  {
    id: "1",
    date: "06 Янв, 20:45",
    content: "Сегодня чувствую себя отлично! Утренняя тренировка прошла на ура, энергии через край 💪",
    mood: 5,
    dayMetrics: {
      water: 2500,
      steps: 12400,
      sleep: 8.5,
      caffeine: 1,
      weight: 71.2,
      energy: 9,
      mood: 5,
      calories: 2100
    }
  },
  {
    id: "2",
    date: "04 Янв, 19:30",
    content: "Немного устала к вечеру, но норму по шагам выполнила. Нужно больше спать.",
    mood: 4,
    dayMetrics: {
      water: 2200,
      steps: 10500,
      sleep: 6.8,
      caffeine: 3,
      weight: 71.4,
      energy: 6,
      mood: 4,
      calories: 1950
    }
  },
  {
    id: "3",
    date: "01 Янв, 22:15",
    content: "Новогодние праздники дались тяжело, но возвращаюсь к режиму. Завтра начинаю активно тренироваться!",
    mood: 3,
    dayMetrics: {
      water: 1800,
      steps: 6200,
      sleep: 7.2,
      caffeine: 2,
      weight: 71.9,
      energy: 5,
      mood: 3,
      calories: 2300
    }
  },
]

export function StatsNotes({ period }: StatsNotesProps) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      {/* Статистика */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-purple-500/20 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/30">
              <NotebookText className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Дневник</span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{NOTES_DATA.length}</div>
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Записей</div>
          </div>
        </div>
      </motion.div>

      {/* Заметки с контекстом дня */}
      <div className="space-y-4">
        {NOTES_DATA.map((note) => (
          <motion.div
            key={note.id}
            variants={item}
            className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4"
          >
            {/* Заголовок заметки */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-sky-400/60 uppercase tracking-wider">
                    {note.date}
                  </span>
                  {note.mood && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              note.mood && i < note.mood ? "bg-amber-500" : "bg-white/10"
                            )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  {note.content}
                </p>
              </div>
            </div>

            {/* Контекст дня - метрики */}
            <div className="pt-3 border-t border-white/5">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-3">
                Метрики дня
              </div>

              <div className="grid grid-cols-4 gap-2">
                {/* Вода */}
                {note.dayMetrics.water && (
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Droplets className="w-3 h-3 text-cyan-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.water}
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">мл</div>
                  </div>
                )}

                {/* Шаги */}
                {note.dayMetrics.steps && (
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Footprints className="w-3 h-3 text-blue-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {(note.dayMetrics.steps / 1000).toFixed(1)}k
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">шагов</div>
                  </div>
                )}

                {/* Сон */}
                {note.dayMetrics.sleep && (
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Moon className="w-3 h-3 text-indigo-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.sleep}
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">часов</div>
                  </div>
                )}

                {/* Кофеин */}
                {note.dayMetrics.caffeine && (
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Coffee className="w-3 h-3 text-orange-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.caffeine}
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">чашек</div>
                  </div>
                )}

                {/* Вес */}
                {note.dayMetrics.weight && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Scale className="w-3 h-3 text-amber-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.weight}
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">кг</div>
                  </div>
                )}

                {/* Настроение */}
                {note.dayMetrics.mood && (
                  <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <Smile className="w-3 h-3 text-pink-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.mood}/5
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">mood</div>
                  </div>
                )}

                {/* Калории */}
                {note.dayMetrics.calories && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Utensils className="w-3 h-3 text-emerald-400 mb-1" />
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.calories}
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">ккал</div>
                  </div>
                )}

                {/* Энергия */}
                {note.dayMetrics.energy && (
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="w-3 h-3 text-purple-400 mb-1 text-xs">⚡</div>
                    <div className="text-xs font-black text-white tabular-nums">
                      {note.dayMetrics.energy}/10
                    </div>
                    <div className="text-[8px] font-bold text-white/40 uppercase">энергия</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Инсайт */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="text-xs text-white/60 font-medium">
          💡 Ваши заметки помогают отслеживать взаимосвязь между настроением и ежедневными метриками
        </div>
      </motion.div>
    </motion.div>
  )
}

