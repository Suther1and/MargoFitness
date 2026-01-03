'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Zone3InsightsProps {
  weeklyCompletion: number[]
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
  }>
  stats: {
    totalCompleted: number
    longestStreak: number
    completionRate: number
  }
}

export function Zone3Insights({ weeklyCompletion, achievements, stats }: Zone3InsightsProps) {
  const maxValue = Math.max(...weeklyCompletion, 1)
  const avgCompletion = weeklyCompletion.reduce((a, b) => a + b, 0) / weeklyCompletion.length
  const trend = weeklyCompletion[6] > avgCompletion ? 'up' : 'down'
  const trendPercent = Math.abs(((weeklyCompletion[6] - avgCompletion) / avgCompletion) * 100).toFixed(0)

  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Weekly Chart */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214]/80 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Неделя</h3>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            trend === 'up' 
              ? "bg-green-500/10 text-green-500" 
              : "bg-red-500/10 text-red-500"
          )}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trendPercent}%</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyCompletion.map((value, index) => {
            const height = (value / maxValue) * 100
            const isToday = index === 6
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={cn(
                    "w-full rounded-lg transition-colors relative group cursor-pointer",
                    isToday 
                      ? "bg-gradient-to-t from-amber-500 to-orange-500" 
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {value}%
                  </div>
                </motion.div>
                <span className={cn(
                  "text-xs font-medium",
                  isToday ? "text-amber-500" : "text-white/40"
                )}>
                  {days[index]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214]/80 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-white">Достижения</h3>
          </div>

          <div className="space-y-3">
            {achievements.slice(0, 3).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {achievement.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214]/80 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Статистика</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalCompleted}
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider">
              За месяц
            </div>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="text-2xl font-bold text-amber-500 mb-1">
              {stats.longestStreak}
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider">
              Лучший стрик
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {stats.completionRate}%
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider">
              Выполнение
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

