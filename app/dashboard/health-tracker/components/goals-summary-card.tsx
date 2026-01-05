'use client'

import { CheckCircle2, Circle, Target } from 'lucide-react'
import { DailyMetrics } from '../types'
import { cn } from '@/lib/utils'

interface GoalsSummaryCardProps {
  data: DailyMetrics
}

export function GoalsSummaryCard({ data }: GoalsSummaryCardProps) {
  const goals = [
    { label: 'Вода', current: data.waterIntake, goal: data.waterGoal, unit: 'мл' },
    { label: 'Шаги', current: data.steps, goal: data.stepsGoal, unit: '' },
    { label: 'Сон', current: data.sleepHours, goal: data.sleepGoal, unit: 'ч' },
    { label: 'Кал', current: data.calories, goal: data.caloriesGoal, unit: 'ккал' },
  ]

  const completedCount = goals.filter(g => g.current >= g.goal).length

  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-[#121214]/90 md:bg-[#121214]/40 md:backdrop-blur-xl p-6 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">План на день</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          {completedCount} / {goals.length} выполнено
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((g) => {
          const isDone = g.current >= g.goal
          const perc = Math.min((g.current / g.goal) * 100, 100)
          
          return (
            <div key={g.label} className="group/item">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-white/20" />
                  )}
                  <span className={cn(
                    "text-xs font-bold transition-colors",
                    isDone ? "text-white/80" : "text-white/40"
                  )}>
                    {g.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white/20">
                    {g.current} <span className="text-[8px] font-medium opacity-50">{g.unit}</span>
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", isDone ? "bg-emerald-500" : "bg-white/10")}
                  style={{ width: `${perc}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

