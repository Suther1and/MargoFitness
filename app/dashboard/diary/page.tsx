'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WeekNavigator } from './components/week-navigator'
import { Zone1Metrics } from './components/zone1-metrics'
import { Zone2Habits } from './components/zone2-habits'
import { Zone3Insights } from './components/zone3-insights'
import { MOCK_DATA, DailyMetrics } from './types'

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [data, setData] = useState<DailyMetrics>(MOCK_DATA)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleHabit = (id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => 
        h.id === id ? { ...h, completed: !h.completed } : h
      )
    }))
  }

  const handleMetricUpdate = (metric: string, value: number) => {
    setData(prev => ({
      ...prev,
      [metric]: value
    }))
  }

  // Mock data for Zone 3
  const weeklyCompletion = [75, 80, 65, 90, 85, 70, 95]
  const achievements = [
    {
      id: '1',
      title: '7-дневный стрик!',
      description: 'Выполнено "Креатин 5г"',
      icon: '🔥'
    },
    {
      id: '2',
      title: 'Цель достигнута',
      description: '10,000 шагов за день',
      icon: '🎯'
    },
    {
      id: '3',
      title: 'Новый рекорд',
      description: 'Лучшая неделя за месяц',
      icon: '🏆'
    }
  ]

  const stats = {
    totalCompleted: 142,
    longestStreak: 21,
    completionRate: 87
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#18181b] flex items-center justify-center">
        <div className="text-white/60">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#18181b] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-oswald font-bold tracking-tight uppercase mb-2">
                Дневник{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                  Здоровья
                </span>
              </h1>
              <p className="text-white/50 text-sm md:text-base">
                Отслеживай прогресс и формируй полезные привычки
              </p>
            </div>
          </div>

          {/* Week Navigator */}
          <div className="flex justify-center md:justify-start">
            <WeekNavigator
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </motion.div>

        {/* Main Content - Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* MOBILE: Zone 2 First (Habits) */}
          <div className="lg:hidden">
            <Zone2Habits
              habits={data.habits}
              onToggle={handleToggleHabit}
            />
          </div>

          {/* Zone 1: Metrics Dashboard (Left/Top) */}
          <div className="lg:col-span-4">
            <Zone1Metrics
              data={data}
              onMetricUpdate={handleMetricUpdate}
            />
          </div>

          {/* Zone 2: Habits List (Center) - Desktop Only */}
          <div className="hidden lg:block lg:col-span-5">
            <Zone2Habits
              habits={data.habits}
              onToggle={handleToggleHabit}
            />
          </div>

          {/* Zone 3: Insights (Right/Bottom) */}
          <div className="lg:col-span-3">
            <Zone3Insights
              weeklyCompletion={weeklyCompletion}
              achievements={achievements}
              stats={stats}
            />
          </div>
        </div>

        {/* Mobile: Show habits after metrics */}
        <div className="lg:hidden mt-6">
          {/* Already shown above */}
        </div>
      </div>
    </div>
  )
}
