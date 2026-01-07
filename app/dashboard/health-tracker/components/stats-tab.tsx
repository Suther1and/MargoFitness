"use client"

import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { StatsNavigation } from "./stats-details/stats-navigation"
import { StatsOverall } from "./stats-details/stats-overall"
import { StatsWater } from "./stats-details/stats-water"
import { StatsSteps } from "./stats-details/stats-steps"
import { StatsWeight } from "./stats-details/stats-weight"
import { StatsCaffeine } from "./stats-details/stats-caffeine"
import { StatsSleep } from "./stats-details/stats-sleep"
import { StatsMood } from "./stats-details/stats-mood"
import { StatsNutrition } from "./stats-details/stats-nutrition"
import { StatsNotes } from "./stats-details/stats-notes"
import { StatsPhotos } from "./stats-details/stats-photos"
import { StatsHabits } from "./stats-details/stats-habits"
import { useTrackerSettings } from "../hooks/use-tracker-settings"
import { useHabits } from "../hooks/use-habits"
import { StatsView, PeriodType, DateRange, DailyMetrics } from "../types"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { DesktopStatsDashboard } from "./stats-details/desktop-stats-dashboard"

interface StatsTabProps {
  periodType: PeriodType
  dateRange: DateRange
  data: DailyMetrics
  onPeriodSelect: (periodType: PeriodType, dateRange: DateRange) => void
}

export default function StatsTab({ periodType, dateRange, data, onPeriodSelect }: StatsTabProps) {
  const [activeView, setActiveView] = useState<StatsView>('overall')
  const [isAnimating, setIsAnimating] = useState(false)
  const { settings } = useTrackerSettings()
  const { habits } = useHabits()
  const isMobile = useIsMobile(1024)

  // Проверка наличия активных виджетов и привычек для показа навигации
  const mainHealthWidgets = ['water', 'steps', 'weight', 'caffeine', 'sleep', 'mood', 'nutrition']
  const hasMainWidgets = mainHealthWidgets.some(id => settings.widgets[id as keyof typeof settings.widgets]?.enabled)
  const hasAnyContent = hasMainWidgets || habits.length > 0

  // Для обратной совместимости со старым форматом period
  const getLegacyPeriod = () => {
    if (periodType === '1y') return 'year'
    return periodType
  }

  if (!isMobile) {
    return (
      <DesktopStatsDashboard 
        period={getLegacyPeriod()} 
        data={data} 
        onPeriodSelect={onPeriodSelect}
        currentPeriodType={periodType}
        currentDateRange={dateRange}
      />
    )
  }

  // Определяем, какой компонент рендерить
  const renderContent = () => {
    const contentVariants: Variants = {
      enter: (direction: number) => ({
        x: direction > 0 ? 20 : -20,
        opacity: 0,
        scale: 0.98,
        transition: {
          x: { type: "spring" as const, stiffness: 400, damping: 35 },
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
          x: { type: "spring" as const, stiffness: 400, damping: 35 },
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }
      },
      exit: (direction: number) => ({
        x: direction < 0 ? 20 : -20,
        opacity: 0,
        scale: 0.98,
        transition: {
          x: { duration: 0.1, ease: "easeIn" as const },
          opacity: { duration: 0.1 },
          scale: { duration: 0.1 }
        }
      })
    }

    const getContent = () => {
      switch (activeView) {
        case 'overall':
          return <StatsOverall key="overall" period={getLegacyPeriod()} data={data} onNavigate={setActiveView} />
        case 'habits':
          return <StatsHabits key="habits" dateRange={dateRange} />
        case 'water':
          return <StatsWater key="water" dateRange={dateRange} />
        case 'steps':
          return <StatsSteps key="steps" dateRange={dateRange} />
        case 'weight':
          return <StatsWeight key="weight" dateRange={dateRange} />
        case 'caffeine':
          return <StatsCaffeine key="caffeine" dateRange={dateRange} />
        case 'sleep':
          return <StatsSleep key="sleep" dateRange={dateRange} />
        case 'mood':
          return <StatsMood key="mood" dateRange={dateRange} />
        case 'nutrition':
          return <StatsNutrition key="nutrition" dateRange={dateRange} />
        case 'notes':
          return <StatsNotes key="notes" dateRange={dateRange} />
        case 'photos':
          return <StatsPhotos key="photos" dateRange={dateRange} />
        default:
          return <StatsOverall key="overall" period={getLegacyPeriod()} data={data} onNavigate={setActiveView} />
      }
    }

    return (
      <div className={cn("relative", isAnimating && "is-animating")}>
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={activeView}
            custom={1}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
            className="will-change-[transform,opacity] transform-gpu"
          >
            {getContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 pb-24 md:pb-10", isAnimating && "is-animating")}>
      {/* Навигация между виджетами - скрываем если на обзоре и нет контента */}
      {(activeView !== 'overall' || hasAnyContent) && (
        <StatsNavigation
          activeView={activeView}
          onViewChange={setActiveView}
        />
      )}

      {/* Динамический контент */}
      {renderContent()}
    </div>
  )
}
