'use client'

import { motion } from 'framer-motion'
import { Home, Dumbbell, Tag, Award, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavigationTab = 'overview' | 'workouts' | 'bonuses' | 'subscription' | 'stats' | 'settings'

interface DesktopNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

const NAV_ITEMS = [
  { id: 'overview' as NavigationTab, label: 'Обзор', icon: Home, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'workouts' as NavigationTab, label: 'Тренировки', icon: Dumbbell, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'bonuses' as NavigationTab, label: 'Бонусы', icon: Tag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'subscription' as NavigationTab, label: 'Подписка', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'stats' as NavigationTab, label: 'Статистика', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'settings' as NavigationTab, label: 'Настройки', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-400/10' },
]

export function DesktopNavigation({ activeTab, onTabChange }: DesktopNavigationProps) {
  return (
    <aside className="w-32 shrink-0 sticky top-8 flex flex-col gap-2 relative" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="px-2 mb-3 text-left">
        <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] block">Меню</span>
      </div>
      
      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-500 group border overflow-hidden active:scale-[0.98] w-16",
                isActive 
                  ? "bg-white/[0.08] border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)]" 
                  : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
              )}
              title={item.label}
            >
              {/* Animated background on active */}
              {isActive && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-white/[0.08]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 shrink-0 relative z-10",
                isActive ? "scale-110 shadow-lg" : "group-hover:scale-110",
                item.bg
              )}>
                <item.icon className={cn("w-4.5 h-4.5", item.color)} />
              </div>
              
              <span className={cn(
                "text-[9px] font-bold transition-colors text-center tracking-tight relative z-10 leading-tight",
                isActive ? "text-white" : "text-white/30 group-hover:text-white/70"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Элегантный разделитель - начинается с кнопок навигации */}
      <div className="absolute right-0 top-[60px] bottom-0 flex items-center">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 w-px bg-gradient-to-b from-transparent via-amber-500/5 to-transparent blur-sm" />
      </div>
    </aside>
  )
}
