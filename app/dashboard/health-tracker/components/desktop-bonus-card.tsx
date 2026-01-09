'use client'

import Link from 'next/link'
import { UserBonus, CashbackLevel, calculateLevelProgress, CASHBACK_LEVELS, Profile } from '@/types/database'

interface DesktopBonusCardProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
  } | null
  profile: Profile
}

export function DesktopBonusCard({ bonusStats, profile }: DesktopBonusCardProps) {
  if (!bonusStats) return null

  const levelColorClasses = {
    4: {
      bg: 'from-purple-500/20 to-indigo-500/20',
      ring: 'ring-purple-400/30',
      hover: 'md:hover:ring-purple-400/60 md:hover:shadow-purple-500/20',
      accent: 'from-purple-500/10',
      glow: 'bg-purple-500/20',
      icon: 'text-purple-300',
      badge: 'bg-purple-500/20 text-purple-100 ring-purple-400/40',
      progress: 'from-purple-400 to-purple-600',
      button: 'bg-purple-500/10 ring-purple-400/30 hover:bg-purple-500/20 hover:ring-purple-400/40',
      buttonIcon: 'bg-purple-500/20 text-purple-300',
      buttonText: 'text-purple-300/70'
    },
    3: {
      bg: 'from-amber-500/20 to-orange-500/20',
      ring: 'ring-amber-400/30',
      hover: 'md:hover:ring-amber-400/60 md:hover:shadow-amber-500/20',
      accent: 'from-amber-500/10',
      glow: 'bg-amber-500/20',
      icon: 'text-amber-300',
      badge: 'bg-amber-500/20 text-amber-100 ring-amber-400/40',
      progress: 'from-amber-300 to-amber-500',
      button: 'bg-amber-500/10 ring-amber-400/30 hover:bg-amber-500/20 hover:ring-amber-400/40',
      buttonIcon: 'bg-amber-500/20 text-amber-300',
      buttonText: 'text-amber-300/70'
    },
    2: {
      bg: 'from-gray-400/20 to-gray-600/20',
      ring: 'ring-gray-400/30',
      hover: 'md:hover:ring-gray-400/60 md:hover:shadow-gray-500/20',
      accent: 'from-gray-400/10',
      glow: 'bg-gray-400/20',
      icon: 'text-gray-300',
      badge: 'bg-gray-500/20 text-gray-100 ring-gray-400/40',
      progress: 'from-gray-300 to-gray-500',
      button: 'bg-gray-500/10 ring-gray-400/30 hover:bg-gray-500/20 hover:ring-gray-400/40',
      buttonIcon: 'bg-gray-500/20 text-gray-300',
      buttonText: 'text-gray-300/70'
    },
    1: {
      bg: 'from-amber-700/20 to-amber-900/20',
      ring: 'ring-amber-700/30',
      hover: 'md:hover:ring-amber-700/60 md:hover:shadow-amber-900/20',
      accent: 'from-amber-700/10',
      glow: 'bg-amber-700/20',
      icon: 'text-amber-600',
      badge: 'bg-amber-700/20 text-amber-100 ring-amber-600/40',
      progress: 'from-amber-600 to-amber-800',
      button: 'bg-amber-700/10 ring-amber-600/30 hover:bg-amber-700/20 hover:ring-amber-600/40',
      buttonIcon: 'bg-amber-700/20 text-amber-600',
      buttonText: 'text-amber-600/70'
    }
  }

  const colors = levelColorClasses[bonusStats.levelData.level as keyof typeof levelColorClasses] || levelColorClasses[1]

  return (
    <Link 
      href="/dashboard/bonuses"
      className={`group relative overflow-hidden rounded-3xl p-4 flex flex-col md:hover:shadow-2xl cursor-pointer flex-1 transition-all duration-300 bg-gradient-to-br ${colors.bg} ${colors.ring} ${colors.hover}`}
      style={{ backgroundSize: '200% 200%' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent} via-transparent to-transparent pointer-events-none`} />
      <div className={`absolute -left-24 -bottom-24 h-72 w-72 rounded-full ${colors.glow} blur-3xl pointer-events-none`} />

      <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.05] p-3 ring-1 ring-white/20 backdrop-blur relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white/90 text-xs relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={colors.icon}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span className="font-medium">Бонусы</span>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium relative overflow-hidden ring-1 ${colors.badge}`}>
            <span className="relative">{bonusStats.levelData.name} {bonusStats.levelData.icon}</span>
          </span>
        </div>

        <div className="rounded-xl bg-white/10 ring-1 ring-white/20 p-3 mb-2">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-bold text-white font-oswald">{bonusStats.account.balance.toLocaleString('ru-RU')}</span>
            <span className="text-xs text-white/70">шагов</span>
          </div>
          <p className="text-[10px] text-white/80">Текущий баланс</p>
          
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="flex justify-between text-[9px] text-white/70 mb-1.5">
              {bonusStats.progress.nextLevel ? (
                <>
                  <span className="truncate">До {CASHBACK_LEVELS.find(l => l.level === bonusStats.progress.nextLevel)?.name}</span>
                  <span className="font-medium ml-1 shrink-0">{bonusStats.progress.remaining.toLocaleString('ru-RU')}</span>
                </>
              ) : (
                <span>Макс. уровень</span>
              )}
            </div>
            <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${colors.progress}`}
                style={{ width: `${bonusStats.progress.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (profile.subscription_tier === 'free') {
                window.location.href = '/#pricing'
              }
            }}
            className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-2 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95 group/btn"
          >
            <div className="flex flex-col items-center justify-center text-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
              <p className="text-[10px] font-medium text-white">Использовать</p>
            </div>
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.location.href = '/dashboard/bonuses#referral'
            }}
            className={`rounded-xl ring-1 p-2 transition-all active:scale-95 group/btn ${colors.button}`}
          >
            <div className="flex flex-col items-center justify-center text-center gap-1.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform ${colors.buttonIcon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </div>
              <p className="text-[10px] font-medium text-white">Пригласить</p>
            </div>
          </button>
        </div>
      </div>
    </Link>
  )
}
