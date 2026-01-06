"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, Zap, Scale, Droplets, Footprints, Moon, Camera, NotebookText, ArrowRight, Trophy, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { StatsView } from "../../types"
import Image from "next/image"

interface StatsOverallProps {
  period: string
  onNavigate?: (view: StatsView) => void
}

// Моковые данные для демонстрации
interface Insight {
  id: string
  label: string
  value: string
  subValue?: string
  change: number
  trend: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
}

const MOCK_INSIGHTS: Insight[] = [
  { id: 'weight', label: 'Вес', value: '72.4 кг', subValue: '-1.8 кг', change: -1.8, trend: 'down', icon: Scale, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { id: 'steps', label: 'Шаги', value: '9,043', subValue: 'в день', change: 12, trend: 'up', icon: Footprints, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { id: 'sleep', label: 'Сон', value: '7.6 ч', subValue: 'в день', change: 45, trend: 'up', icon: Moon, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', borderColor: 'border-indigo-400/20' },
]

const MOCK_PHOTOS = [
  { id: "1", date: "21 янв", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=200&fit=crop", weight: 72.4 },
  { id: "2", date: "14 янв", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=200&fit=crop", weight: 73.1 },
  { id: "3", date: "07 янв", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=200&fit=crop", weight: 73.9 },
]

const MOCK_LAST_NOTE = {
  id: "1",
  date: "Вчера, 20:45",
  content: "Сегодня чувствую себя отлично! Утренняя тренировка прошла на ура, энергии через край 💪",
  mood: 5
}

export function StatsOverall({ period, onNavigate }: StatsOverallProps) {
  const { settings } = useTrackerSettings()

  // Фильтруем инсайты по включенным виджетам
  const visibleInsights = MOCK_INSIGHTS.filter(insight => {
    return settings.widgets[insight.id as keyof typeof settings.widgets]?.enabled
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
      {/* Hero Section - Ключевые достижения */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-500/10 to-blue-500/20 border border-white/10 p-4">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Итоги периода</span>
          </div>

          {/* Быстрая статистика */}
          <div className="flex items-center gap-4">
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-white tabular-nums leading-none">-1.8 <span className="text-sm text-white/40">кг</span></div>
              <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Динамика веса</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-white tabular-nums leading-none">94 <span className="text-sm text-white/40">%</span></div>
              <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Выполнение целей</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Вода - горизонтальная карточка */}
      {settings.widgets.water.enabled && (
        <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Вода</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Среднее за период</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white tabular-nums leading-none">2,250</div>
              <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">мл/день</div>
            </div>
          </div>

          {/* Прогресс бар */}
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "90%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Цель: 2,500 мл</span>
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">90%</span>
          </div>
        </motion.div>
      )}

      {/* Сетка инсайтов - разнообразные карточки */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {visibleInsights.map((insight, index) => {
          const Icon = insight.icon
          const isPositive = insight.change > 0 && insight.id !== 'weight'
          const isNegative = insight.change < 0 && insight.id !== 'weight'
          const isWeightLoss = insight.id === 'weight' && insight.change < 0

          return (
            <motion.div
              key={insight.id}
              variants={item}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                insight.bgColor,
                insight.borderColor
              )}
            >
              {/* Иконка и тренд */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-xl", insight.bgColor, insight.borderColor, "border")}>
                  <Icon className={cn("w-4 h-4", insight.color)} />
                </div>
                {insight.trend === 'up' && (isPositive || isWeightLoss) && (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                )}
                {insight.trend === 'down' && (isNegative && insight.id !== 'weight') && (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                {insight.id === 'weight' && insight.trend === 'down' && (
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              {/* Значение */}
              <div className="space-y-1">
                <div className="text-2xl font-black text-white leading-none tabular-nums">
                  {insight.value}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
                    {insight.label}
                  </div>
                  {insight.subValue && (
                    <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                      {insight.subValue}
                    </div>
                  )}
                </div>
              </div>

              {/* Декоративный градиент */}
              <div className={cn("absolute bottom-0 right-0 w-20 h-20 opacity-20 blur-2xl", insight.bgColor)} />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Лучший день недели */}
      <motion.div variants={item} className="rounded-2xl bg-white/5 border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/60">Лучший день</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">Пятница</span>
            <span className="text-sm text-white/40 font-medium">18 января</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-sm font-black text-emerald-400">12.4k</div>
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Шагов</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-sm font-black text-blue-400">2.8л</div>
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Воды</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-sm font-black text-indigo-400">8.5ч</div>
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Сна</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Фото прогресса (если включены) */}
      {settings.widgets.photos.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('photos')}
          className="rounded-2xl bg-white/5 border border-white/5 p-4 cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Camera className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогресс в фото</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase">
              {MOCK_PHOTOS.length} фото
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="flex gap-3">
            {MOCK_PHOTOS.map((photo, index) => (
              <div key={photo.id} className="relative flex-1 aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src={photo.url}
                  alt={`Progress ${photo.date}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-[8px] font-black text-white/60 uppercase tracking-wider mb-0.5">
                    {photo.date}
                  </div>
                  <div className="text-xs font-black text-white tabular-nums">
                    {photo.weight} <span className="text-[9px] text-white/40">кг</span>
                  </div>
                </div>
                {index > 0 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                    <span className="text-[8px] font-black text-emerald-400">
                      {(photo.weight - MOCK_PHOTOS[0].weight).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Последняя заметка (если включены) */}
      {settings.widgets.notes.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('notes')}
          className="rounded-2xl bg-white/5 border border-white/5 p-4 cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <NotebookText className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">Дневник</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase">
              12 записей
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-sky-400/60 uppercase tracking-wider">
                {MOCK_LAST_NOTE.date}
              </span>
              {MOCK_LAST_NOTE.mood && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        i < MOCK_LAST_NOTE.mood ? "bg-amber-500" : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-medium line-clamp-2">
              {MOCK_LAST_NOTE.content}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

