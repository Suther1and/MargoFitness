"use client"

import { motion } from "framer-motion"
import { TrendingDown, Scale, Droplets, Footprints, Camera, NotebookText, Smile, Utensils, Flame, Laugh, Zap, Moon, Coffee, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { calculateBMI } from "../../utils/bmi-utils"
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
  
  if (!settings?.widgets) return null

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

  const renderMobileLayout = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 pb-4">
      <div className="p-4 bg-white/5 rounded-2xl text-center text-white/40 text-xs uppercase tracking-widest">Mobile View Protected</div>
    </motion.div>
  )

  const renderDesktopLayout = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-6 pb-10">
      
      {/* РЯД 1: Вес и Дисциплина (Высота 140px) */}
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

      {/* РЯД 2: Форма (2) + Шаги (1) + Вода (1). Высота 280px */}
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

      <div className="col-span-1 space-y-4">
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
      </div>

      <div className="col-span-1 space-y-4">
        {/* Питание (Адаптировано под 280px высоту, но с плотным наполнением) */}
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
      </div>

      {/* РЯД 3: Заметки (2) + Настроение (1) + Сон (1). Высота 140px */}
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

      {/* РЯД 4: Кофе (1) + Декор (3) */}
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

  return layout === 'grid' ? renderDesktopLayout() : renderMobileLayout()
}
