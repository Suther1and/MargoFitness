"use client"

import { motion } from "framer-motion"
import { TrendingDown, Scale, Droplets, Footprints, Camera, NotebookText, Smile, Utensils, Flame, Frown, Meh, Laugh, Zap, Moon, Coffee, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { calculateBMI, getBMICategory } from "../../utils/bmi-utils"
import { StatsView, DailyMetrics } from "../../types"
import Image from "next/image"

interface StatsOverallProps {
  period: string
  onNavigate?: (view: StatsView) => void
  layout?: 'column' | 'grid'
  data?: DailyMetrics
}

const MOCK_PHOTOS = [
  { id: "1", date: "31 дек", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", weight: 74.2 },
  { id: "2", date: "7 янв", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=400&fit=crop", weight: 72.4 },
]

const MOCK_LAST_NOTE = {
  id: "1",
  date: "Вчера, 20:45",
  content: "Сегодня чувствую себя отлично! Утренняя тренировка прошла на ура, энергии через край 💪",
  mood: 5
}

export function StatsOverall({ period, onNavigate, layout = 'column', data }: StatsOverallProps) {
  const { settings } = useTrackerSettings()
  
  const bmiValue = calculateBMI(settings.userParams.height, settings.userParams.weight)
  
  if (!settings?.widgets) {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  const renderMobileLayout = () => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-4 contain-paint"
    >
      {/* Дисциплина - Эталонный блок */}
      {settings.widgets.habits?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('habits')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-amber-500/20 transition-[border-color,transform] duration-300 active:scale-[0.98] group transform-gpu"
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
              <div className="w-px h-10 bg-white/10" />
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
      {settings.widgets.steps?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('steps')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-[border-color,transform] duration-300 hover:border-red-500/20 active:scale-[0.98] group transform-gpu"
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
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <div className="text-2xl font-black text-red-500 leading-none tabular-nums">112%</div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">От цели</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Вода - Горизонтальная с заливкой */}
      {settings.widgets.water?.enabled && (
        <motion.div 
          variants={item} 
          onClick={() => onNavigate?.('water')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-blue-500/20 transition-[border-color,transform] duration-300 active:scale-[0.98] group transform-gpu"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-blue-500/10 pointer-events-none border-r border-blue-500/5"
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
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <div className="text-2xl font-black text-blue-400 leading-none tabular-nums">85%</div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Цель достигнута</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Вес - Горизонтальная */}
      {settings.widgets.weight?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('weight')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-[border-color,transform] duration-300 hover:border-emerald-500/20 active:scale-[0.98] cursor-pointer group transform-gpu"
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
              <div className="w-px h-10 bg-white/10" />
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

      {/* Сон и Кофеин - В одну строку */}
      <div className="grid grid-cols-2 gap-4">
        {settings.widgets.sleep?.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('sleep')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-[border-color,transform] duration-300 hover:border-indigo-500/20 active:scale-[0.98] cursor-pointer group transform-gpu"
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "95%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-indigo-500/10 pointer-events-none border-r border-indigo-500/5"
            />
            
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Сон</div>
                  <div className="text-lg font-black text-white tabular-nums tracking-tight">7.6<span className="text-xs text-white/40 font-bold ml-1">ч</span></div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg font-black text-indigo-400 leading-none tabular-nums">95%</div>
              </div>
            </div>
          </motion.div>
        )}

        {settings.widgets.caffeine?.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('caffeine')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-[border-color,transform] duration-300 hover:border-amber-600/20 active:scale-[0.98] cursor-pointer group transform-gpu"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-600/10 border border-amber-600/20 group-hover:scale-110 transition-transform duration-500">
                  <Coffee className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Кофеин</div>
                  <div className="text-lg font-black text-white tabular-nums tracking-tight">2.1<span className="text-xs text-white/40 font-bold ml-1">среднее</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Питание - Горизонтальная исправленная */}
      {settings.widgets.nutrition?.enabled && (
        <motion.div 
          variants={item} 
          onClick={() => onNavigate?.('nutrition')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-violet-500/20 transition-[border-color,transform] active:scale-[0.98] group transform-gpu"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                <Utensils className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Питание</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">
                  2,050
                  <span className="text-sm text-white/50 font-bold ml-1 uppercase">/ {settings.widgets.nutrition?.goal || 2200} ккал</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-px h-10 bg-white/10" />
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Баланс</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Настроение и Энергия - В одну строку */}
      {settings.widgets.mood?.enabled && (
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            variants={item}
            onClick={() => onNavigate?.('mood')}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121214]/60 p-5 cursor-pointer hover:border-pink-500/20 transition-[border-color,transform] active:scale-[0.98] group transform-gpu"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Smile className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Настроение</div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-black text-white tracking-tight uppercase">Отличное</div>
                <Laugh className="w-5 h-5 text-pink-400 animate-pulse" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={item} 
            onClick={() => onNavigate?.('mood')}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121214]/60 p-5 cursor-pointer hover:border-orange-500/20 transition-[border-color,transform] active:scale-[0.98] group transform-gpu"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Энергия</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-orange-400 tabular-nums">7.8<span className="text-[10px] text-white/20 ml-1">/10</span></div>
                <div className="flex gap-1 h-3 items-end">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 rounded-full", 
                        i < 4 ? "bg-orange-500" : "bg-white/5",
                        i === 0 ? "h-1" : i === 1 ? "h-2" : i === 2 ? "h-3" : i === 3 ? "h-2.5" : "h-1.5"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Фото и Заметки - Нижние компактные блоки */}
      <div className="grid grid-cols-2 gap-4">
        {settings.widgets.photos?.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('photos')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-violet-500/20 transition-[border-color,transform] active:scale-[0.98] group transform-gpu"
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

        {settings.widgets.notes?.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('notes')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 cursor-pointer hover:border-sky-500/20 transition-[border-color,transform] active:scale-[0.98] group transform-gpu"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <NotebookText className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Заметки</span>
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase">12</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{MOCK_LAST_NOTE.content}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )

  const renderDesktopLayout = () => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-4 gap-6 pb-8 contain-paint"
    >
      {/* 1. Блок Трансформации (2x1) - Эстетичный и сбалансированный */}
      {settings.widgets.weight?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('weight')}
          className="col-span-2 relative overflow-hidden rounded-[2rem] bg-[#121214]/60 border border-white/10 p-7 cursor-pointer hover:border-emerald-500/20 transition-all group"
        >
          {/* Декоративный фон */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/[0.02] blur-[40px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Scale className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5">Динамика веса</div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Трансформация</h3>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-xl font-black text-emerald-400 tabular-nums">-1.8</span>
                  <span className="text-[10px] font-black text-emerald-400/40 uppercase">кг</span>
                </div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1.5">за выбранный период</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 relative">
              <div className="flex flex-col">
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Старт ({MOCK_PHOTOS[0].date})</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{MOCK_PHOTOS[0].weight}</span>
                  <span className="text-[11px] font-black text-white/20 uppercase">кг</span>
                </div>
              </div>

              <div className="flex-1 px-12 relative flex items-center justify-center">
                <div className="w-full h-px bg-white/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-[2px]" />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5 text-right">Финиш ({MOCK_PHOTOS[1].date})</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{MOCK_PHOTOS[1].weight}</span>
                  <span className="text-[11px] font-black text-white/20 uppercase">кг</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Привычки (1x1) - Как на мобилке (Circular) */}
      {settings.widgets.habits?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('habits')}
          className="col-span-1 relative overflow-hidden rounded-[2rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-amber-500/20 transition-all group flex flex-col items-center justify-center"
        >
          <div className="absolute top-3 left-6">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Дисциплина</div>
          </div>
          
          <div className="relative w-32 h-32 shrink-0 my-2">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white leading-none">75%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-lg font-black text-white tabular-nums leading-none">12</span>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">стрик</span>
          </div>
        </motion.div>
      )}

      {/* 3. Питание (1x1) - Чистый */}
      {settings.widgets.nutrition?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('nutrition')}
          className="col-span-1 relative overflow-hidden rounded-[2rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-violet-500/20 transition-all group"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Питание</span>
          </div>

          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-white tabular-nums tracking-tighter">2,050</span>
              <span className="text-[11px] font-black text-white/20 uppercase">ккал</span>
            </div>
            <div className="text-[9px] font-black text-white/10 uppercase tracking-widest">Цель: {settings.widgets.nutrition?.goal || 2200}</div>
          </div>

          <div className="mt-auto flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
            </div>
            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Норма</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Шаги (1x1) - Компактный */}
      {settings.widgets.steps?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('steps')}
          className="col-span-1 relative overflow-hidden rounded-[2rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-red-500/20 transition-all group flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <Footprints className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Шаги</span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-4xl font-black text-white tabular-nums tracking-tighter leading-none">11,200</span>
          </div>
          <div className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-6">Среднее в день</div>

          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Цель: 10,000</span>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">5 / 7 дней</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '71%' }} className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
            </div>
          </div>
        </motion.div>
      )}

      {/* 5. Вода (1x1) - Компактный */}
      {settings.widgets.water?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('water')}
          className="col-span-1 relative overflow-hidden rounded-[2rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-blue-500/20 transition-all group flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.1)]">
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Вода</span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-4xl font-black text-white tabular-nums tracking-tighter leading-none">2.3</span>
            <span className="text-[11px] font-black text-white/20 uppercase">л</span>
          </div>
          <div className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-6">Общий объем</div>

          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Стабильность</span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">85%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]" />
            </div>
          </div>
        </motion.div>
      )}

      {/* 6. Прогресс Формы (2x1) - Широкий с заглушками */}
      {settings.widgets.photos?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('photos')}
          className="col-span-2 relative overflow-hidden rounded-[2rem] bg-[#121214]/60 border border-white/10 p-7 cursor-pointer hover:border-violet-500/20 transition-all group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                <Camera className="w-5 h-5 text-violet-400" />
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Прогресс формы</h4>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">период: {period === '1y' ? 'Год' : period === '30d' ? '30д' : '7д'}</div>
          </div>

          <div className="grid grid-cols-2 gap-5 h-[180px]">
            <div className="group/photo relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
              {/* Плейсхолдер Старт */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 group-hover/photo:opacity-40 transition-opacity">
                <Camera className="w-12 h-12 text-white/20 mb-2" />
                <span className="text-[8px] font-black uppercase tracking-widest">Нет фото</span>
              </div>
              <div className="absolute top-4 left-4 px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-white/60 tracking-widest">До</div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="text-[10px] font-bold text-white/20">31 дек</div>
                <div className="text-sm font-black text-white/30 tracking-tight">74.2 <span className="text-[8px] font-black text-white/10 uppercase">кг</span></div>
              </div>
            </div>

            <div className="group/photo relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
              {/* Плейсхолдер Финиш */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 group-hover/photo:opacity-50 transition-opacity">
                <Camera className="w-12 h-12 text-violet-500/20 mb-2" />
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-500/40">Ожидание фото</span>
              </div>
              <div className="absolute top-4 right-4 px-2 py-1 rounded bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400 tracking-widest">После</div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="text-[10px] font-bold text-white/20">7 янв</div>
                <div className="text-sm font-black text-white/30 tracking-tight">72.4 <span className="text-[8px] font-black text-white/10 uppercase">кг</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 7. Режим и Заметки (4x1) - Компактный нижний ряд */}
      <div className="col-span-4 grid grid-cols-4 gap-6">
        {/* Сон и Кофе */}
        <div className="col-span-1 flex flex-col gap-4">
          <div onClick={() => onNavigate?.('sleep')} className="flex-1 bg-indigo-500/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-500/[0.06] transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Сон</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white tabular-nums">7.6</span>
              <span className="text-[9px] font-black text-white/20 uppercase">ч</span>
            </div>
          </div>
          <div onClick={() => onNavigate?.('caffeine')} className="flex-1 bg-amber-600/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-600/[0.06] transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-600/10 border border-amber-600/20 group-hover:scale-110 transition-transform">
                <Coffee className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Кофе</span>
            </div>
            <span className="text-lg font-black text-white tabular-nums">2.1</span>
          </div>
        </div>

        {/* Настроение */}
        <div onClick={() => onNavigate?.('mood')} className="col-span-1 bg-pink-500/[0.03] border border-white/5 rounded-[2rem] p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-500/[0.06] transition-all group text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-pink-500/[0.01] blur-[30px]" />
          <div className="relative z-10">
            <Smile className="w-7 h-7 text-pink-400 mb-2.5 group-hover:scale-125 transition-transform duration-500" />
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Настроение</div>
            <div className="text-sm font-black text-white uppercase tracking-tight">Отличное</div>
          </div>
        </div>

        {/* Заметки */}
        <div onClick={() => onNavigate?.('notes')} className="col-span-2 bg-[#121214]/40 border border-white/5 rounded-[2rem] p-6 cursor-pointer hover:border-sky-500/20 transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <NotebookText className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Последние мысли</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-sky-500/20 transition-colors">
              <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-sky-400" />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-sky-500/20 rounded-full" />
            <p className="text-[11px] text-white/50 leading-relaxed italic line-clamp-2 pl-2">
              "{MOCK_LAST_NOTE.content}"
            </p>
          </div>
          <div className="absolute bottom-4 right-7 text-[8px] font-black text-white/10 uppercase tracking-widest">12 записей за неделю</div>
        </div>
      </div>
    </motion.div>
  )



  return layout === 'grid' ? renderDesktopLayout() : renderMobileLayout()
}
