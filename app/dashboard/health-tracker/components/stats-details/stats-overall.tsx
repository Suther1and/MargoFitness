"use client"

import { motion } from "framer-motion"
import { TrendingDown, Scale, Droplets, Footprints, Camera, NotebookText, Smile, Utensils, Flame, Laugh, Zap, Moon, Coffee, ChevronRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { useHabits } from "../../hooks/use-habits"
import { calculateBMI } from "../../utils/bmi-utils"
import { StatsView, DailyMetrics } from "../../types"
import Image from "next/image"
import Link from "next/link"

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
  const { habits } = useHabits()
  const bmiValue = calculateBMI(settings.userParams.height, settings.userParams.weight)
  
  if (!settings?.widgets) return null

  // Проверка наличия активных виджетов (только основные метрики здоровья)
  const mainHealthWidgets = ['water', 'steps', 'weight', 'caffeine', 'sleep', 'mood', 'nutrition']
  const hasMainWidgets = mainHealthWidgets.some(id => settings.widgets[id as keyof typeof settings.widgets]?.enabled)
  const hasAnyContent = hasMainWidgets || habits.length > 0

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

  const renderMobileLayout = () => {
    if (!hasAnyContent) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-2xl font-oswald font-black text-white mb-3 text-center uppercase tracking-tight">
            Выберите виджеты
          </h3>
          <p className="text-sm text-white/50 text-center mb-8 max-w-[320px] leading-relaxed">
            Настройте метрики для отслеживания, чтобы увидеть статистику и прогресс
          </p>
          <Link 
            href="/dashboard/health-tracker?tab=settings"
            className="px-8 py-4 rounded-2xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/40 text-green-400 font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center gap-3"
          >
            <BarChart3 className="w-5 h-5" />
            Настроить трекер
          </Link>
        </div>
      )
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 pb-4 contain-paint"
      >
        {/* Дисциплина - Эталонный блок */}
        {habits.length > 0 && (
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
  }

  const renderDesktopLayout = () => {
    if (!hasAnyContent) {
      return (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-8">
            <BarChart3 className="w-12 h-12 text-green-400" />
          </div>
          <h3 className="text-4xl font-oswald font-black text-white mb-4 text-center uppercase tracking-tight">
            Выберите виджеты
          </h3>
          <p className="text-base text-white/50 text-center mb-10 max-w-[480px] leading-relaxed">
            Настройте метрики для отслеживания, чтобы увидеть статистику и прогресс
          </p>
          <Link 
            href="/dashboard/health-tracker?tab=settings"
            className="px-10 py-5 rounded-2xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/40 text-green-400 font-black text-base uppercase tracking-wider transition-all active:scale-95 flex items-center gap-3"
          >
            <BarChart3 className="w-6 h-6" />
            Настроить трекер
          </Link>
        </div>
      )
    }

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-6 pb-10">
        
        {/* РЯД 1: Вес и Дисциплина (Высота 140px) */}
        {settings.widgets.weight?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('weight')}
          className="col-span-2 h-[140px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-emerald-500/20 transition-all group relative overflow-hidden flex flex-col justify-between"
        >
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Анализ веса</div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Трансформация</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400 tabular-nums leading-none">-1.8<span className="text-[10px] ml-1 opacity-40 uppercase">кг</span></div>
            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">за 7 дней</div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 relative z-10">
          <div className="text-center">
            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Старт</div>
            <div className="text-xl font-black text-white/90 tabular-nums">74.2</div>
          </div>
          <div className="flex-1 px-10 relative flex items-center justify-center">
            <div className="w-full h-px bg-white/5 relative">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Текущий</div>
            <div className="text-xl font-black text-white tabular-nums">72.4</div>
          </div>
        </div>
        </motion.div>
      )}

      {habits.length > 0 && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('habits')}
          className="col-span-2 h-[140px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-amber-500/20 transition-all group relative overflow-hidden flex items-center"
        >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 w-full relative z-10">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
              <motion.circle 
                cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" 
                strokeDasharray="264" 
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 * (1 - 0.75) }}
                className="text-amber-500" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-white">75%</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Дисциплина</div>
            <div className="text-xl font-black text-white tracking-tight uppercase leading-none truncate">Стабильность</div>
          </div>
          <div className="flex items-center gap-4 shrink-0 px-2">
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                <span className="text-3xl font-black text-white tabular-nums">12</span>
              </div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Стрик дней</div>
            </div>
          </div>
        </div>
        </motion.div>
      )}

      {/* РЯД 2: Форма (2) + Шаги (1) + Вода (1). Высота 280px */}
      {settings.widgets.photos?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('photos')}
          className="col-span-2 h-[280px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-6 hover:border-violet-500/20 transition-all group flex flex-col justify-between"
        >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400"><Camera className="w-4 h-4" /></div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Форма</h4>
          </div>
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">период: 7д</span>
        </div>
        <div className="grid grid-cols-2 gap-4 h-[180px] mt-4">
          <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white/10" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/40 text-[8px] font-black uppercase text-white/40 tracking-widest">До</div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <span className="text-[9px] font-bold text-white/20 tabular-nums">31 дек</span>
              <span className="text-[10px] font-black text-white/30 tracking-tight">74.2 кг</span>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center text-violet-500/20">
            <Camera className="w-8 h-8" />
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/20 text-[8px] font-black uppercase text-emerald-400 tracking-widest">После</div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <span className="text-[9px] font-bold text-white/20 tabular-nums">7 янв</span>
              <span className="text-[10px] font-black text-white/30 tracking-tight">72.4 кг</span>
            </div>
          </div>
        </div>
        </motion.div>
      )}

      <div className="col-span-1 space-y-4">
        {settings.widgets.steps?.enabled && (
          <div onClick={() => onNavigate?.('steps')} className="h-[132px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-red-500/20 transition-all group relative overflow-hidden flex flex-col justify-between cursor-pointer">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"><Footprints className="w-4 h-4" /></div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Шаги</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">11,200</div>
              </div>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
            <motion.div initial={{ width: 0 }} animate={{ width: '71%' }} className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">цель 10к</span>
            <span className="text-[10px] font-black text-red-500/60 tabular-nums">112%</span>
          </div>
          </div>
        )}

        {settings.widgets.water?.enabled && (
          <div onClick={() => onNavigate?.('water')} className="h-[132px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-blue-500/20 transition-all group relative overflow-hidden flex flex-col justify-between cursor-pointer">
          <motion.div initial={{ height: 0 }} animate={{ height: '85%' }} className="absolute bottom-0 left-0 right-0 bg-blue-500/[0.03] border-t border-blue-500/10 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400"><Droplets className="w-4 h-4" /></div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Вода</div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">2.3<span className="text-xs ml-1 opacity-40 uppercase">л</span></div>
              </div>
            </div>
            <div className="text-lg font-black text-blue-400 tabular-nums">85%</div>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4 relative z-10">
            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-blue-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]" />
          </div>
          </div>
        )}
      </div>

      <div className="col-span-1 space-y-4">
        {/* Питание (Адаптировано под 280px высоту, но с плотным наполнением) */}
        {settings.widgets.nutrition?.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('nutrition')}
            className="h-[280px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-6 hover:border-violet-500/20 transition-all group flex flex-col justify-between"
          >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400"><Utensils className="w-4 h-4" /></div>
            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Калории</div>
          </div>
          <div className="text-center py-6 border-y border-white/5">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Среднее</div>
            <div className="text-4xl font-black text-white tabular-nums tracking-tight">2,050</div>
            <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1">ккал / день</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-widest">
              <span>Цель 2200</span>
              <span className="text-emerald-400">В норме</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
            </div>
          </div>
          </motion.div>
        )}
      </div>

      {/* РЯД 3: Заметки (2) + Настроение (1) + Сон (1). Высота 140px */}
      {settings.widgets.notes?.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('notes')}
          className="col-span-2 h-[140px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-sky-500/20 transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]"><NotebookText className="w-4 h-4 text-sky-400" />Последние мысли</div>
          <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-sky-400" />
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed italic line-clamp-2 border-l-2 border-sky-500/20 pl-4">"{MOCK_LAST_NOTE.content}"</p>
        <div className="text-[8px] font-black text-white/5 uppercase tracking-[0.2em]">Статистика заметок: 12 за неделю</div>
        </motion.div>
      )}

      {settings.widgets.mood?.enabled && (
        <div onClick={() => onNavigate?.('mood')} className="col-span-1 h-[140px] bg-[#121214]/40 border border-white/5 rounded-[1.5rem] p-5 hover:bg-white/[0.03] transition-all cursor-pointer group flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/10 text-pink-400"><Smile className="w-4 h-4" /></div>
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Состояние</div>
        </div>
        <div className="text-xl font-black text-white uppercase tracking-tight">Отличное</div>
        <div className="flex gap-1 items-end h-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={cn("flex-1 rounded-full transition-all", i < 8 ? "bg-orange-500/60 h-full" : "bg-white/5 h-1.5")} />
          ))}
        </div>
        </div>
      )}

      {settings.widgets.sleep?.enabled && (
        <div onClick={() => onNavigate?.('sleep')} className="col-span-1 h-[140px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-indigo-500/20 transition-all cursor-pointer group flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400"><Moon className="w-4 h-4" /></div>
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Сон</div>
        </div>
        <div>
          <div className="text-2xl font-black text-white tabular-nums">7.6<span className="text-xs ml-1 opacity-40 uppercase">ч</span></div>
          <div className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mt-1">95% от цели</div>
        </div>
        </div>
      )}

      {/* РЯД 4: Кофе (1) + Декор (3) */}
      {settings.widgets.caffeine?.enabled && (
        <div onClick={() => onNavigate?.('caffeine')} className="col-span-1 h-[140px] bg-[#121214]/60 border border-white/10 rounded-[1.5rem] p-5 hover:border-amber-600/20 transition-all cursor-pointer group flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl bg-amber-600/5 border border-amber-600/10 text-amber-600"><Coffee className="w-4 h-4" /></div>
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Кофе</div>
        </div>
        <div>
          <div className="text-2xl font-black text-white tabular-nums">2.1</div>
          <div className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mt-1">Порции сегодня</div>
        </div>
        </div>
      )}

      <div className="col-span-3 h-[140px] bg-[#121214]/10 border border-white/[0.02] rounded-[1.5rem] p-6 flex items-center justify-between group overflow-hidden">
        <div className="max-w-md">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Margo Fitness Analyzer</div>
          <div className="text-xs text-white/30 font-black uppercase leading-relaxed">
            Система анализирует ваши показатели в реальном времени.<br/>
            Соблюдайте дисциплину для достижения максимального результата.
          </div>
        </div>
        <Zap className="w-12 h-12 text-amber-500 opacity-10 group-hover:opacity-30 transition-opacity" />
      </div>

      </motion.div>
    )
  }

  return layout === 'grid' ? renderDesktopLayout() : renderMobileLayout()
}
