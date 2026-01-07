"use client"

import { useState } from "react"
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

export default function StatsTab({ userId, periodType, dateRange, data, onPeriodSelect }: StatsTabProps) {
  const [activeView, setActiveView] = useState<StatsView>('overall')
  const { settings } = useTrackerSettings(userId)
  const { habits } = useHabits(null)
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

  // Условный рендеринг - только активный таб в DOM
  const renderContent = () => {
    if (activeView === 'overall') {
      return <StatsOverall period={getLegacyPeriod()} data={data} onNavigate={setActiveView} />
    }
    if (activeView === 'habits') {
      return <StatsHabits dateRange={dateRange} />
    }
    if (activeView === 'water') {
      return <StatsWater dateRange={dateRange} />
    }
    if (activeView === 'steps') {
      return <StatsSteps dateRange={dateRange} />
    }
    if (activeView === 'weight') {
      return <StatsWeight dateRange={dateRange} />
    }
    if (activeView === 'caffeine') {
      return <StatsCaffeine dateRange={dateRange} />
    }
    if (activeView === 'sleep') {
      return <StatsSleep dateRange={dateRange} />
    }
    if (activeView === 'mood') {
      return <StatsMood dateRange={dateRange} />
    }
    if (activeView === 'nutrition') {
      return <StatsNutrition dateRange={dateRange} />
    }
    if (activeView === 'notes') {
      return <StatsNotes dateRange={dateRange} />
    }
    if (activeView === 'photos') {
      return <StatsPhotos dateRange={dateRange} />
    }
    return null
  }

  return (
    <div className="space-y-4 pb-24 md:pb-10">
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
