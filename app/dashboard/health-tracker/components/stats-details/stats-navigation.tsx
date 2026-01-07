"use client"

import { motion } from "framer-motion"
import { BarChart3, Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils, Camera, NotebookText, Flame, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatsView, WidgetId } from "../../types"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { useHabits } from "../../hooks/use-habits"

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
  { id: 'habits', label: 'Привычки', icon: Flame, color: 'text-amber-500' },
  { id: 'water', label: 'Вода', icon: Droplets, color: 'text-blue-400' },
  { id: 'steps', label: 'Шаги', icon: Footprints, color: 'text-red-500' },
  { id: 'weight', label: 'Вес', icon: Scale, color: 'text-emerald-400' },
  { id: 'caffeine', label: 'Кофеин', icon: Coffee, color: 'text-amber-600' },
  { id: 'sleep', label: 'Сон', icon: Moon, color: 'text-indigo-400' },
  { id: 'mood', label: 'Настроение', icon: Smile, color: 'text-pink-400' },
  { id: 'nutrition', label: 'Питание', icon: Utensils, color: 'text-violet-400' },
  { id: 'notes', label: 'Заметки', icon: NotebookText, color: 'text-sky-400' },
  { id: 'photos', label: 'Фото', icon: Camera, color: 'text-violet-400' },
]

export function StatsNavigation({ activeView, onViewChange }: StatsNavigationProps) {
  const { settings, isLoaded: isSettingsLoaded } = useTrackerSettings()
  const { habits, isLoaded: isHabitsLoaded } = useHabits()
  
  // Не рендерим навигацию пока данные не загружены (избегаем layout shift)
  if (!isSettingsLoaded || !isHabitsLoaded) {
    return (
      <div className="relative mb-6">
        <div className="flex items-center justify-start md:justify-center gap-2 pb-2">
          {/* Скелетон - показываем 3 заглушки */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="w-[54px] h-[54px] rounded-[1.5rem] bg-white/[0.03] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Фильтруем кнопки: "Общая" всегда показываем, "Привычки" только если есть привычки, остальные по enabled
  const visibleButtons = NAV_BUTTONS.filter(button => {
    if (button.id === 'overall') return true
    if (button.id === 'habits') return habits.length > 0
    return settings.widgets[button.id as WidgetId]?.enabled
  })

  return (
    <div className="relative mb-6">
      {/* Контейнер - кнопки выровнены по левому краю на мобилках и по центру на десктопе */}
      <div className="flex items-center justify-start md:justify-center gap-2 pb-2 overflow-x-auto no-scrollbar md:overflow-visible">
        {visibleButtons.map((button) => {
          const Icon = button.icon
          const isActive = activeView === button.id
          const buttonCount = visibleButtons.length
          
          // Фиксированные квадратные размеры в зависимости от количества кнопок
          let sizeClass = "w-[54px] h-[54px]"
          let iconSize = "w-6 h-6"
          let roundedClass = "rounded-[1.5rem]"
          
          if (buttonCount >= 10) {
            sizeClass = "w-[44px] h-[44px]"
            iconSize = "w-5 h-5"
            roundedClass = "rounded-[0.8rem]"
          } else if (buttonCount >= 8) {
            sizeClass = "w-[48px] h-[48px]"
            iconSize = "w-5.5 h-5.5"
            roundedClass = "rounded-[1.2rem]"
          }

          return (
            <button
              key={button.id}
              onClick={() => onViewChange(button.id)}
              className={cn(
                "relative flex items-center justify-center transition-colors duration-200",
                sizeClass,
                roundedClass,
                isActive
                  ? "bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  : "bg-white/[0.03] border border-white/5 hover:bg-white/5 active:scale-95"
              )}
            >
              {/* Иконка */}
              <Icon className={cn(
                iconSize,
                "transition-colors duration-200",
                isActive ? button.color : "text-white/30"
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

