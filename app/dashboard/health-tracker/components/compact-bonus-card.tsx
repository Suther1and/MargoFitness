'use client'

import Link from 'next/link'
import { UserBonus, CashbackLevel, calculateLevelProgress, CASHBACK_LEVELS, Profile } from '@/types/database'

interface CompactBonusCardProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
  } | null
  profile: Profile
}

export function CompactBonusCard({ bonusStats, profile }: CompactBonusCardProps) {
  if (!bonusStats) return null

  const levelColorClasses = {
    4: {
      icon: 'text-purple-300',
      badge: 'bg-purple-500/20 text-purple-100 ring-purple-400/40',
      bg: 'from-purple-500/10',
    },
    3: {
      icon: 'text-amber-300',
      badge: 'bg-amber-500/20 text-amber-100 ring-amber-400/40',
      bg: 'from-amber-500/10',
    },
    2: {
      icon: 'text-gray-300',
      badge: 'bg-gray-500/20 text-gray-100 ring-gray-400/40',
      bg: 'from-gray-400/10',
    },
    1: {
      icon: 'text-amber-600',
      badge: 'bg-amber-700/20 text-amber-100 ring-amber-600/40',
      bg: 'from-amber-700/10',
    }
  }

  const colors = levelColorClasses[bonusStats.levelData.level as keyof typeof levelColorClasses] || levelColorClasses[1]

  return (
    <button
      onClick={() => window.location.href = '/dashboard/bonuses'}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3 flex items-center gap-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-[0.98]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} via-transparent to-transparent pointer-events-none`} />
      
      {/* Icon */}
      <div className="relative flex-shrink-0 z-10">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colors.icon}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-start min-w-0 relative z-10 flex-1">
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm font-semibold text-white font-oswald uppercase tracking-tight truncate">
            {bonusStats.account.balance.toLocaleString('ru-RU')}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ring-1 ${colors.badge}`}>
            {bonusStats.levelData.icon}
          </span>
        </div>
        <span className="text-[10px] text-white/40 font-medium">Бонусные шаги</span>
      </div>
      
      {/* Arrow hint */}
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </button>
  )
}
