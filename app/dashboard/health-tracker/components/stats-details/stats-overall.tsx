"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, Zap, Scale, Droplets, Footprints, Moon, Camera, NotebookText, ArrowRight, Trophy, Calendar, Smile, Utensils, Flame, Frown, Meh, Laugh, Annoyed, Soup, Pizza, Hamburger, Apple, Salad, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { calculateBMI, getBMICategory } from "../../utils/bmi-utils"
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
  
  const bmiValue = calculateBMI(settings.userParams.height, settings.userParams.weight)
  const bmiCategory = getBMICategory(Number(bmiValue))

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
      className="space-y-6 pb-4"
    >
      {/* Hero Section - AI Insights */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-6 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Smart Analytics</span>
            </div>
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-[#121214] bg-white/5 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight">
              Ваш прогресс <span className="text-amber-500">ускорился</span> на этой неделе
            </h2>
            <p className="text-xs text-white/50 leading-relaxed font-medium max-w-[95%]">
              Вы достигли целей по шагам 5 дней из 7. Средний вес снизился на <span className="text-emerald-400 font-black">1.8 кг</span>. 
              Это лучший результат за последние 30 дней.
            </p>
          </div>

          <div className="flex items-center gap-8 pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Стрик целей</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">12</span>
                <span className="text-[9px] font-black text-amber-500 uppercase">дней</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Эффективность</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">94</span>
                <span className="text-[9px] font-black text-blue-400 uppercase">%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Вода и Вес - Сетка 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {settings.widgets.water.enabled && (
          <motion.div 
            variants={item} 
            onClick={() => onNavigate?.('water')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-6 cursor-pointer hover:border-white/10 transition-all duration-300 active:scale-[0.98] group"
          >
            {/* Background Fill Effect */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "90%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute bottom-0 left-0 right-0 bg-cyan-500/5 pointer-events-none"
            />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white tabular-nums tracking-tight">2.3 <span className="text-[10px] text-cyan-400/60 font-black">Л</span></div>
                  <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Среднее</div>
                </div>
              </div>
              
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Вода</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xs font-black text-cyan-400">90%</span>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">от цели</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Вес - Вертикальная карточка */}
        {settings.widgets.weight.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('weight')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-6 transition-all duration-300 hover:border-white/10 active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Scale className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                    <span className="text-xl font-black text-emerald-400 tabular-nums tracking-tighter">1.8</span>
                  </div>
                  <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">кг за неделю</div>
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Вес</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white tabular-nums leading-none tracking-tight">72.4</span>
                  <span className="text-[9px] font-bold text-white/20 uppercase">кг</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Шаги - Горизонтальная карточка */}
      {settings.widgets.steps.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('steps')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-5 transition-all duration-300 hover:border-white/10 active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                <Footprints className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">9,043</div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Среднее шагов</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-black text-blue-400 leading-none tabular-nums">112%</div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">От цели</div>
              </div>
              <div className="w-1.5 h-8 bg-blue-500/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "70%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="w-full bg-blue-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Питание - Соответствует виджету трекера */}
      {settings.widgets.nutrition.enabled && (
        <motion.div 
          variants={item} 
          onClick={() => onNavigate?.('nutrition')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-6 cursor-pointer hover:border-white/10 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Utensils className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Питание</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white tabular-nums tracking-tight">2,050</span>
              <span className="text-[9px] font-black text-white/20 uppercase ml-1">ккал / ср.</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-violet-500/10">
                    <Apple className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Качество еды</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">Чистое питание</span>
              </div>
              <div className="flex gap-1.5">
                {[Frown, Annoyed, Meh, Apple, Salad].map((Icon, i) => (
                  <div key={i} className={cn(
                    "flex-1 h-9 rounded-xl flex items-center justify-center border transition-all duration-500", 
                    i === 3 
                      ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "bg-white/5 border-white/5 opacity-20"
                  )}>
                    <Icon className={cn("w-4 h-4", i === 3 ? "text-emerald-400" : "text-white")} />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-px h-16 bg-white/5" />
            <div className="text-center min-w-[60px]">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", bmiCategory?.bgColor || "bg-emerald-500")} />
                <div className="text-2xl font-black text-white leading-none tracking-tight">{bmiValue || "24.2"}</div>
              </div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">ИМТ</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Дисциплина - Переработанная версия */}
      <motion.div
        variants={item}
        onClick={() => onNavigate?.('habits')}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-6 cursor-pointer hover:border-white/10 active:scale-[0.98] group"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                <motion.circle 
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 * (1 - 0.75) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-orange-500" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white tracking-tighter">75%</span>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Дисциплина</div>
              <div className="text-2xl font-black text-white tracking-tight uppercase leading-none">Стабильность</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-px h-12 bg-white/5" />
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">12</span>
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.1em] whitespace-nowrap">Лучший стрик</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Настроение и Энергия - Соответствует виджету */}
      {settings.widgets.mood.enabled && (
        <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#121214]/60 p-5">
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Smile className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Настроение</span>
                </div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Отличное / ср.</span>
              </div>
              <div className="flex gap-1.5">
                {[Frown, Annoyed, Meh, Smile, Laugh].map((Icon, i) => (
                  <div key={i} className={cn(
                    "flex-1 py-2.5 rounded-xl flex items-center justify-center transition-all duration-500 border",
                    i === 3 
                      ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "bg-white/[0.02] border-white/5 opacity-20"
                  )}>
                    <Icon className={cn("w-5 h-5", i === 3 ? "text-emerald-400" : "text-white")} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Энергия</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white tracking-tight">7.2</span>
                  <span className="text-[9px] font-black text-white/20">/ 10</span>
                </div>
              </div>
              <div className="flex gap-1 h-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-[2px] transition-all duration-700", 
                      i < 7 
                        ? "bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]" 
                        : "bg-white/5"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Peak Performance - Компактный блок-награда */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600/10 via-[#121214] to-blue-600/5 border border-white/5 p-6 group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em] mb-0.5">Peak day</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white uppercase tracking-tight">Пятница</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Рекорд</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-purple-500/30 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-around px-2 py-1 bg-white/[0.02] rounded-2xl border border-white/5">
            {[
              { label: 'Шаги', val: '12.4k', color: 'text-emerald-400' },
              { label: 'Вода', val: '2.8л', color: 'text-blue-400' },
              { label: 'Сон', val: '8.5ч', color: 'text-indigo-400' }
            ].map((stat, i) => (
              <div key={i} className="text-center group/stat">
                <div className={cn("text-lg font-black transition-transform group-hover/stat:scale-110 duration-300", stat.color)}>{stat.val}</div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em] mt-0.5">{stat.label}</div>
              </div>
            ))}
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

