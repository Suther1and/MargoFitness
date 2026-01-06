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
import { StatsView, PeriodType, DateRange } from "../types"

interface StatsTabProps {
  periodType: PeriodType
  dateRange: DateRange
}

export default function StatsTab({ periodType, dateRange }: StatsTabProps) {
  const [activeView, setActiveView] = useState<StatsView>('overall')
  const [isAnimating, setIsAnimating] = useState(false)
  const { settings } = useTrackerSettings()

  // Для обратной совместимости со старым форматом period
  const getLegacyPeriod = () => {
    if (periodType === '1y') return 'year'
    return periodType
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
      const period = getLegacyPeriod()
      
      switch (activeView) {
        case 'overall':
          return <StatsOverall key="overall" period={period} onNavigate={setActiveView} />
        case 'habits':
          return <StatsHabits key="habits" period={period} />
        case 'water':
          return <StatsWater key="water" period={period} />
        case 'steps':
          return <StatsSteps key="steps" period={period} />
        case 'weight':
          return <StatsWeight key="weight" period={period} />
        case 'caffeine':
          return <StatsCaffeine key="caffeine" period={period} />
        case 'sleep':
          return <StatsSleep key="sleep" period={period} />
        case 'mood':
          return <StatsMood key="mood" period={period} />
        case 'nutrition':
          return <StatsNutrition key="nutrition" period={period} />
        case 'notes':
          return <StatsNotes key="notes" period={period} />
        case 'photos':
          return <StatsPhotos key="photos" period={period} />
        default:
          return <StatsOverall key="overall" period={period} onNavigate={setActiveView} />
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
            onAnimationComplete={() => {
              // Увеличиваем задержку для полной стабилизации слоев браузером
              setTimeout(() => setIsAnimating(false), 100)
            }}
            className="will-change-[transform,opacity] transform-gpu"
          >
            {getContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 pb-20", isAnimating && "is-animating")}>
      {/* Навигация между виджетами */}
      <StatsNavigation
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Динамический контент */}
      {renderContent()}
    </div>
  )
}
