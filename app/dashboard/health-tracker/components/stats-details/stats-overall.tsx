"use client"

import { motion } from "framer-motion"
import { TrendingDown, Scale, Droplets, Footprints, Camera, NotebookText, Smile, Utensils, Flame, Frown, Meh, Laugh, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { calculateBMI, getBMICategory } from "../../utils/bmi-utils"
import { StatsView } from "../../types"
import Image from "next/image"

interface StatsOverallProps {
  period: string
  onNavigate?: (view: StatsView) => void
}

const MOCK_PHOTOS = [
  { id: "1", date: "21 янв", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=200&fit=crop", weight: 72.4 },
  { id: "2", date: "14 янв", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=200&fit=crop", weight: 73.1 },
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

  if (!settings?.widgets) {
    return null
  }

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
      className="space-y-4 pb-4"
    >
      {/* Дисциплина - Эталонный блок */}
      {settings.widgets.habits.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('habits')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-amber-500/20 active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                  <motion.circle 
                    cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" 
                    strokeDasharray="264" 
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 * (1 - 0.75) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-amber-500" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white">75%</span>
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5 truncate">Дисциплина</div>
                <div className="text-lg font-black text-white tracking-tight uppercase leading-none truncate">Стабильность</div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-px h-10 bg-white/5" />
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="text-2xl font-black text-white tabular-nums tracking-tight">12</span>
                </div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em] whitespace-nowrap">Лучший стрик</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Шаги - Горизонтальная карточка */}
      {settings.widgets.steps.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('steps')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-all duration-300 hover:border-red-500/20 active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                <Footprints className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Шаги</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">11,200</div>
              </div>
            </div>

            <div className="flex-1 max-w-[120px] h-10 relative">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d="M 0,30 L 14,28 L 28,32 L 42,25 L 56,20 L 70,15 L 84,18 L 100,12"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  d="M 0,30 L 14,28 L 28,32 L 42,25 L 56,20 L 70,15 L 84,18 L 100,12 L 100,40 L 0,40 Z"
                  fill="url(#stepsGradient)"
                />
              </svg>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-px h-10 bg-white/5" />
              <div className="text-right">
                <div className="text-2xl font-black text-red-500 leading-none tabular-nums">112%</div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">От цели</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Вода - Горизонтальная с заливкой */}
      {settings.widgets.water.enabled && (
        <motion.div 
          variants={item} 
          onClick={() => onNavigate?.('water')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-blue-500/20 transition-all duration-300 active:scale-[0.98] group"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-blue-500/5 pointer-events-none border-r border-blue-500/10"
          />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                <Droplets className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Вода</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">2.3<span className="text-sm text-blue-400/60 font-black ml-1 uppercase">л</span></div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-px h-10 bg-white/5" />
              <div className="text-right">
                <div className="text-2xl font-black text-blue-400 leading-none tabular-nums">85%</div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Цель достигнута</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Вес - Горизонтальная */}
      {settings.widgets.weight.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('weight')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-all duration-300 hover:border-emerald-500/20 active:scale-[0.98] cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Текущий вес</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">72.4<span className="text-sm text-white/40 font-bold ml-1 uppercase">кг</span></div>
              </div>
            </div>

            <div className="flex-1 max-w-[100px] flex items-end gap-1 h-8">
              {[74.2, 73.9, 73.6, 73.1, 72.8, 72.6, 72.4].map((v, i) => {
                const h = ((v - 72) / (75 - 72)) * 100
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="flex-1 bg-emerald-500/20 rounded-t-[1px]"
                  />
                )
              })}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-px h-10 bg-white/5" />
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-xl font-black text-emerald-400 tabular-nums leading-none tracking-tight">-1.8</span>
                </div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">ИМТ: {bmiValue}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Питание - Горизонтальная исправленная */}
      {settings.widgets.nutrition.enabled && (
        <motion.div 
          variants={item} 
          onClick={() => onNavigate?.('nutrition')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-violet-500/20 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                <Utensils className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Питание</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">2,050<span className="text-sm text-white/20 font-bold ml-1 uppercase">ккал</span></div>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Баланс</span>
              </div>
              
              <div className="w-px h-10 bg-white/5" />
              
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", bmiCategory?.bgColor || "bg-emerald-500")} />
                  <span className="text-xl font-black text-white leading-none tracking-tight">{bmiValue || "24.2"}</span>
                </div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Индекс массы</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Настроение и Энергия - Горизонтальная редизайн */}
      {settings.widgets.mood.enabled && (
        <motion.div 
          variants={item}
          onClick={() => onNavigate?.('mood')}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121214]/60 p-5 cursor-pointer hover:border-pink-500/20 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                <Smile className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Состояние</div>
                <div className="text-lg font-black text-white tracking-tight uppercase leading-none">Отличное</div>
              </div>
            </div>

            <div className="flex-1 max-w-[140px] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Энергия</span>
                <span className="text-[10px] font-black text-orange-400 tracking-tight">7.8/10</span>
              </div>
              <div className="flex gap-0.5 h-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-[1px]", 
                      i < 8 ? "bg-gradient-to-t from-orange-600 to-orange-400" : "bg-white/5"
                    )} 
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-px h-10 bg-white/5" />
              <div className="flex gap-1">
                {[Meh, Smile, Laugh].map((Icon, i) => (
                  <div key={i} className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                    i === 2 ? "bg-pink-500/20 border-pink-500/30" : "bg-white/5 border-white/5 opacity-20"
                  )}>
                    <Icon className={cn("w-4 h-4", i === 2 ? "text-pink-400" : "text-white")} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Фото и Заметки - Нижние компактные блоки */}
      <div className="grid grid-cols-2 gap-4">
        {settings.widgets.photos.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('photos')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-violet-500/20 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Camera className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Фото</span>
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase">{MOCK_PHOTOS.length}</span>
            </div>
            <div className="flex gap-2 overflow-hidden">
              {MOCK_PHOTOS.map((photo) => (
                <div key={photo.id} className="relative flex-1 aspect-square rounded-2xl overflow-hidden border border-white/10">
                  <Image src={photo.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {settings.widgets.notes.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('notes')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-sky-500/20 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <NotebookText className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Заметки</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{MOCK_LAST_NOTE.content}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
