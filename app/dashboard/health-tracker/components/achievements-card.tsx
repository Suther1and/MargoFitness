'use client'

import { motion } from 'framer-motion'
import { Award, Target, Flame, Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HealthTrackerCard } from './health-tracker-card'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: '7-дневный стрик!', description: 'Выполнил все привычки 7 дней подряд', icon: '🔥', color: 'text-orange-500' },
  { id: '2', title: 'Водный магнат', description: 'Выпито 2500мл воды сегодня', icon: '💧', color: 'text-blue-500' },
  { id: '3', title: 'Рано встал', description: 'Проснулся до 7 утра', icon: '☀️', color: 'text-amber-500' },
]

export function AchievementsCard() {
  return (
    <HealthTrackerCard
      title="Достижения"
      subtitle="Твои победы"
      icon={Award}
      iconColor="text-green-400"
      iconBg="bg-green-500/10"
      className="gap-4"
    >
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {ACHIEVEMENTS.map((achievement) => (
          <div
            key={achievement.id}
            className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default"
          >
            <div className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{achievement.title}</h4>
              <p className="text-[9px] text-white/40 uppercase tracking-tight">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/10 relative overflow-hidden">
        <Trophy className="absolute -right-2 -bottom-2 w-12 h-12 text-white/5 rotate-12" />
        <div className="relative z-10">
            <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Статистика</div>
            <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                    <div className="text-lg font-oswald font-black text-white leading-none">142</div>
                    <div className="text-[7px] text-white/40 uppercase font-bold">Выполнено всего</div>
                </div>
                <div className="space-y-0.5 text-right">
                    <div className="text-lg font-oswald font-black text-green-400 leading-none">87%</div>
                    <div className="text-[7px] text-white/40 uppercase font-bold">Успех за месяц</div>
                </div>
            </div>
        </div>
      </div>
    </HealthTrackerCard>
  )
}

