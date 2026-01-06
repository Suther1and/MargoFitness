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
      {/* Контейнер без скролла - все кнопки в одну строку */}
      <div className="flex gap-2 pb-2">
        {visibleButtons.map((button) => {
          const Icon = button.icon
          const isActive = activeView === button.id
          const buttonCount = visibleButtons.length
          
          // Сохраняем квадратную форму при любом количестве кнопок
          const heightClass = buttonCount >= 8 ? "aspect-square" : "h-[54px]"
          const iconSize = buttonCount >= 8 ? "w-5 h-5" : "w-6 h-6"

          return (
            <button
              key={button.id}
              onClick={() => onViewChange(button.id)}
              className={cn(
                "relative flex-1 max-w-[54px] flex items-center justify-center rounded-2xl transition-all duration-300",
                heightClass,
                isActive
                  ? "bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 active:scale-95"
              )}
            >
              {/* Иконка */}
              <Icon className={cn(
                iconSize,
                "transition-colors duration-300",
                isActive ? button.color : "text-white/40"
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

