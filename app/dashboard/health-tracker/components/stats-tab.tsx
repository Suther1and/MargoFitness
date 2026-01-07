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

  // Определяем, какой компонент рендерить (используем display:none для сохранения кэша)
  const renderContent = () => {
    return (
      <div className={cn("relative", isAnimating && "is-animating")}>
        {/* Все компоненты остаются в DOM, переключаем только видимость */}
        <div style={{ display: activeView === 'overall' ? 'block' : 'none' }}>
          <StatsOverall period={getLegacyPeriod()} data={data} onNavigate={setActiveView} />
        </div>
        <div style={{ display: activeView === 'habits' ? 'block' : 'none' }}>
          <StatsHabits dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'water' ? 'block' : 'none' }}>
          <StatsWater dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'steps' ? 'block' : 'none' }}>
          <StatsSteps dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'weight' ? 'block' : 'none' }}>
          <StatsWeight dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'caffeine' ? 'block' : 'none' }}>
          <StatsCaffeine dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'sleep' ? 'block' : 'none' }}>
          <StatsSleep dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'mood' ? 'block' : 'none' }}>
          <StatsMood dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'nutrition' ? 'block' : 'none' }}>
          <StatsNutrition dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'notes' ? 'block' : 'none' }}>
          <StatsNotes dateRange={dateRange} />
        </div>
        <div style={{ display: activeView === 'photos' ? 'block' : 'none' }}>
          <StatsPhotos dateRange={dateRange} />
        </div>
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
