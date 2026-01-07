"use client"

import { motion } from "framer-motion"
import { TrendingDown, Scale, Droplets, Footprints, Camera, NotebookText, Smile, Utensils, Flame, Frown, Meh, Laugh, Zap, Moon, Coffee } from "lucide-react"
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
      {/* 1. Трансформация веса - Широкий блок (2 колонки) */}
      {settings.widgets.weight?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('weight')}
          className="col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-emerald-500/20 transition-all duration-500 group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <Scale className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Вес</div>
                <div className="text-xl font-black text-white tracking-tight uppercase">Трансформация</div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-black text-emerald-400 tabular-nums">-1.8 кг</span>
            </div>
          </div>

          <div className="flex items-center justify-between relative px-4">
            <div className="text-center">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Старт ({MOCK_PHOTOS[0].date})</div>
              <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{MOCK_PHOTOS[0].weight}<span className="text-lg text-white/20 ml-1">кг</span></div>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-10">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-sm" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Финиш ({MOCK_PHOTOS[1].date})</div>
              <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{MOCK_PHOTOS[1].weight}<span className="text-lg text-white/20 ml-1">кг</span></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Дисциплина и Привычки - 1 колонка */}
      {settings.widgets.habits?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('habits')}
          className="col-span-1 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-amber-500/20 transition-all duration-500 group"
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Дисциплина</div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-20 h-20 shrink-0">
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
                  <span className="text-xl font-black text-white">75%</span>
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-0.5">12</div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Дней стрик</div>
              </div>
            </div>

            <div className="flex gap-1.5 mt-auto">
              {Array.from({ length: 14 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 h-6 rounded-md border transition-colors",
                    i > 10 ? "bg-white/5 border-white/5" : "bg-amber-500/20 border-amber-500/30"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Питание - 1 колонка */}
      {settings.widgets.nutrition?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('nutrition')}
          className="col-span-1 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-violet-500/20 transition-all duration-500 group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
              <Utensils className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Среднее ккал</div>
          </div>

          <div className="mb-4">
            <div className="text-4xl font-black text-white tabular-nums tracking-tighter mb-1">2,050</div>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Цель: {settings.widgets.nutrition?.goal || 2200} ккал</div>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">В рамках нормы</span>
          </div>
        </motion.div>
      )}

      {/* 4. Сравнение фото - Широкий блок (2 колонки) */}
      {settings.widgets.photos?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('photos')}
          className="col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-violet-500/20 transition-all duration-500 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                <Camera className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Фотоотчеты</div>
                <div className="text-xl font-black text-white tracking-tight uppercase">Прогресс формы</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">За период: {period === '1y' ? 'Год' : period}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-[240px]">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 group/photo">
              <Image src={MOCK_PHOTOS[0].url} alt="" fill className="object-cover transition-transform duration-700 group-hover/photo:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-black text-white/40 uppercase mb-0.5">Старт: {MOCK_PHOTOS[0].date}</div>
                <div className="text-lg font-black text-white">{MOCK_PHOTOS[0].weight} кг</div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-white/60 tracking-widest">До</div>
            </div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 group/photo">
              <Image src={MOCK_PHOTOS[1].url} alt="" fill className="object-cover transition-transform duration-700 group-hover/photo:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-black text-white/40 uppercase mb-0.5">Финиш: {MOCK_PHOTOS[1].date}</div>
                <div className="text-lg font-black text-white">{MOCK_PHOTOS[1].weight} кг</div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500/40 backdrop-blur-md border border-emerald-500/20 text-[9px] font-black uppercase text-white tracking-widest">После</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5. Шаги и Вода - 1 колонка каждый */}
      {settings.widgets.steps?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('steps')}
          className="col-span-1 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-red-500/20 transition-all duration-500 group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
              <Footprints className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Шаги</div>
          </div>
          
          <div className="mb-8">
            <div className="text-4xl font-black text-white tabular-nums tracking-tighter mb-1">11,200</div>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">В среднем за день</div>
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Выполнение цели</span>
              <span className="text-red-400">5 / 7 дней</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "71%" }}
                className="h-full bg-red-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {settings.widgets.water?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('water')}
          className="col-span-1 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-blue-500/20 transition-all duration-500 group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Вода</div>
          </div>

          <div className="mb-8">
            <div className="text-4xl font-black text-white tabular-nums tracking-tighter mb-1">2.3<span className="text-lg text-white/20 ml-1">л</span></div>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Средний объем</div>
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Цель выполнена</span>
              <span className="text-blue-400">85% времени</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* 6. Режим: Сон + Кофеин + Самочувствие - 2 колонки */}
      <motion.div
        variants={item}
        className="col-span-2 grid grid-cols-2 gap-4"
      >
        <div className="flex flex-col gap-4">
          {settings.widgets.sleep?.enabled && (
            <div onClick={() => onNavigate?.('sleep')} className="flex-1 bg-indigo-500/5 border border-white/5 rounded-[2.5rem] p-5 cursor-pointer hover:bg-indigo-500/10 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Сон</div>
              </div>
              <div className="text-2xl font-black text-white tabular-nums">7.6<span className="text-sm text-white/20 ml-1">ч</span></div>
              <div className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mt-1">Качество 95%</div>
            </div>
          )}
          {settings.widgets.caffeine?.enabled && (
            <div onClick={() => onNavigate?.('caffeine')} className="flex-1 bg-amber-600/5 border border-white/5 rounded-[2.5rem] p-5 cursor-pointer hover:bg-amber-600/10 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-600/10 border border-amber-600/20 group-hover:scale-110 transition-transform">
                  <Coffee className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Кофеин</div>
              </div>
              <div className="text-2xl font-black text-white tabular-nums">2.1</div>
              <div className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mt-1">Среднее в день</div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {settings.widgets.mood?.enabled && (
            <div onClick={() => onNavigate?.('mood')} className="flex-1 bg-pink-500/5 border border-white/5 rounded-[2.5rem] p-5 cursor-pointer hover:bg-pink-500/10 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 group-hover:scale-110 transition-transform">
                    <Smile className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Настроение</div>
                </div>
                <div className="text-xl font-black text-white uppercase tracking-tight">Отличное</div>
              </div>
              <Laugh className="w-10 h-10 text-pink-400/20 self-end" />
            </div>
          )}
        </div>
      </motion.div>

      {/* 7. Заметки - 2 колонки */}
      {settings.widgets.notes?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('notes')}
          className="col-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-sky-500/20 transition-all duration-500 group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:scale-110 transition-transform duration-500">
              <NotebookText className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Последние записи</div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 relative">
            <div className="absolute top-4 right-4 text-[9px] font-black text-white/10 uppercase tracking-widest">{MOCK_LAST_NOTE.date}</div>
            <p className="text-sm text-white/60 leading-relaxed italic line-clamp-3">
              "{MOCK_LAST_NOTE.content}"
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Всего 12 заметок за период</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )

  return layout === 'grid' ? renderDesktopLayout() : renderMobileLayout()
}
