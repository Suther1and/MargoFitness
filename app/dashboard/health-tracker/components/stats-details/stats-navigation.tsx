"use client"

import { motion } from "framer-motion"
import { BarChart3, Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils, Camera, NotebookText, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatsView, WidgetId } from "../../types"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"

interface StatsNavigationProps {
  activeView: StatsView
  onViewChange: (view: StatsView) => void
}

interface NavButton {
  id: StatsView
  label: string
  icon: LucideIcon
  color: string
}

const NAV_BUTTONS: NavButton[] = [
  { id: 'overall', label: 'Общая', icon: BarChart3, color: 'text-purple-400' },
  { id: 'water', label: 'Вода', icon: Droplets, color: 'text-blue-400' },
  { id: 'steps', label: 'Шаги', icon: Footprints, color: 'text-cyan-400' },
  { id: 'weight', label: 'Вес', icon: Scale, color: 'text-amber-500' },
  { id: 'caffeine', label: 'Кофеин', icon: Coffee, color: 'text-orange-400' },
  { id: 'sleep', label: 'Сон', icon: Moon, color: 'text-indigo-400' },
  { id: 'mood', label: 'Настроение', icon: Smile, color: 'text-pink-400' },
  { id: 'nutrition', label: 'Питание', icon: Utensils, color: 'text-emerald-400' },
  { id: 'notes', label: 'Заметки', icon: NotebookText, color: 'text-sky-400' },
  { id: 'photos', label: 'Фото', icon: Camera, color: 'text-violet-400' },
]

export function StatsNavigation({ activeView, onViewChange }: StatsNavigationProps) {
  const { settings } = useTrackerSettings()

  // Фильтруем кнопки: "Общая" всегда показываем, остальные по enabled
  const visibleButtons = NAV_BUTTONS.filter(button => {
    if (button.id === 'overall') return true
    return settings.widgets[button.id as WidgetId]?.enabled
  })

  return (
    <div className="relative mb-6">
      {/* Градиентные фейды по краям */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />
      
      {/* Скроллящийся контейнер */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth px-1">
        {visibleButtons.map((button) => {
          const Icon = button.icon
          const isActive = activeView === button.id

          return (
            <button
              key={button.id}
              onClick={() => onViewChange(button.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 min-w-[70px] h-[70px] rounded-2xl transition-all duration-300 snap-center flex-shrink-0",
                isActive
                  ? "bg-white/10 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 active:scale-95"
              )}
            >
              {/* Иконка */}
              <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-110" : "scale-100"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  isActive ? button.color : "text-white/40"
                )} />
              </div>

              {/* Текст */}
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider transition-colors duration-300",
                isActive ? "text-white" : "text-white/40"
              )}>
                {button.label}
              </span>

              {/* Индикатор активности */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-2xl border-2 border-white/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

