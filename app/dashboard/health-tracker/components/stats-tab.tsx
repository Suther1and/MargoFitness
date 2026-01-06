"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { StatsHeader } from "./stats-header"
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
import { StatsView } from "../types"

export default function StatsTab() {
  const [activePeriod, setActivePeriod] = useState('7d')
  const [activeView, setActiveView] = useState<StatsView>('overall')
  const [isAnimating, setIsAnimating] = useState(false)
  const { settings } = useTrackerSettings()

  // Определяем, какой компонент рендерить
  const renderContent = () => {
    const contentVariants = {
      enter: (direction: number) => ({
        x: direction > 0 ? 20 : -20,
        opacity: 0,
        scale: 0.98,
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }
      },
      exit: (direction: number) => ({
        x: direction < 0 ? 20 : -20,
        opacity: 0,
        scale: 0.98,
        transition: {
          x: { duration: 0.1, ease: "easeIn" },
          opacity: { duration: 0.1 },
          scale: { duration: 0.1 }
        }
      })
    }

    const getContent = () => {
      switch (activeView) {
        case 'overall':
          return <StatsOverall key="overall" period={activePeriod} onNavigate={setActiveView} />
        case 'habits':
          return <StatsHabits key="habits" period={activePeriod} />
        case 'water':
          return <StatsWater key="water" period={activePeriod} />
        case 'steps':
          return <StatsSteps key="steps" period={activePeriod} />
        case 'weight':
          return <StatsWeight key="weight" period={activePeriod} />
        case 'caffeine':
          return <StatsCaffeine key="caffeine" period={activePeriod} />
        case 'sleep':
          return <StatsSleep key="sleep" period={activePeriod} />
        case 'mood':
          return <StatsMood key="mood" period={activePeriod} />
        case 'nutrition':
          return <StatsNutrition key="nutrition" period={activePeriod} />
        case 'notes':
          return <StatsNotes key="notes" period={activePeriod} />
        case 'photos':
          return <StatsPhotos key="photos" period={activePeriod} />
        default:
          return <StatsOverall key="overall" period={activePeriod} onNavigate={setActiveView} />
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
      {/* Header с выбором периода */}
      <StatsHeader 
        activePeriod={activePeriod} 
        onPeriodChange={setActivePeriod} 
        onCalendarClick={() => {}} 
      />

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
