'use client'

import { UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'

interface BonusCardProps {
  account: UserBonus
  levelData: CashbackLevel
  progress: ReturnType<typeof calculateLevelProgress>
}

// Функция для получения цветов на основе уровня
const getLevelColors = (level: number) => {
  const colors = {
    1: { // Bronze - коричнево-янтарный
      bgGradient: 'from-amber-900/30 to-orange-900/30',
      ring: 'ring-amber-700/40',
      glowTop: 'bg-amber-700/20',
      glowBottom: 'bg-orange-700/15',
      iconGradient: 'from-amber-600 to-orange-700',
      iconShadow: 'shadow-amber-700/20',
      badgeBg: 'bg-amber-700/30',
      badgeText: 'text-amber-200',
      badgeRing: 'ring-amber-600/50',
      badgeShimmer: 'via-amber-400/20',
      progress: 'from-amber-500 to-orange-600',
    },
    2: { // Silver - серебристо-серый
      bgGradient: 'from-slate-600/30 to-slate-700/30',
      ring: 'ring-slate-500/40',
      glowTop: 'bg-slate-500/20',
      glowBottom: 'bg-slate-600/15',
      iconGradient: 'from-slate-400 to-slate-600',
      iconShadow: 'shadow-slate-500/20',
      badgeBg: 'bg-slate-500/30',
      badgeText: 'text-slate-200',
      badgeRing: 'ring-slate-400/50',
      badgeShimmer: 'via-slate-300/20',
      progress: 'from-slate-400 to-slate-500',
    },
    3: { // Gold - золотой
      bgGradient: 'from-yellow-600/30 to-amber-700/30',
      ring: 'ring-yellow-500/40',
      glowTop: 'bg-yellow-500/20',
      glowBottom: 'bg-amber-600/15',
      iconGradient: 'from-yellow-400 to-amber-600',
      iconShadow: 'shadow-yellow-500/20',
      badgeBg: 'bg-yellow-500/30',
      badgeText: 'text-yellow-100',
      badgeRing: 'ring-yellow-400/50',
      badgeShimmer: 'via-yellow-300/20',
      progress: 'from-yellow-400 to-amber-500',
    },
    4: { // Platinum - голубо-платиновый
      bgGradient: 'from-cyan-700/30 to-blue-800/30',
      ring: 'ring-cyan-500/40',
      glowTop: 'bg-cyan-500/20',
      glowBottom: 'bg-blue-600/15',
      iconGradient: 'from-cyan-400 to-blue-600',
      iconShadow: 'shadow-cyan-500/20',
      badgeBg: 'bg-cyan-500/30',
      badgeText: 'text-cyan-100',
      badgeRing: 'ring-cyan-400/50',
      badgeShimmer: 'via-cyan-300/20',
      progress: 'from-cyan-400 to-blue-500',
    },
  }
  return colors[level as keyof typeof colors] || colors[1]
}

export function BonusCard({ account, levelData, progress }: BonusCardProps) {
  const colors = getLevelColors(levelData.level)
  
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colors.bgGradient} ring-1 ${colors.ring} p-4 md:p-5 shadow-lg w-full lg:min-w-[580px]`}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${colors.glowTop} blur-3xl pointer-events-none`} />
      <div className={`absolute -left-16 -bottom-16 h-48 w-48 rounded-full ${colors.glowBottom} blur-3xl pointer-events-none`} />

      {/* Inner card with glassmorphism - like dashboard cards */}
      <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-4 ring-1 ring-white/10 backdrop-blur relative">
        {/* Content - Horizontal Layout */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Left: Icon */}
          <div className="flex-shrink-0">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${colors.iconGradient} p-[2px] shadow-lg ${colors.iconShadow}`}>
              <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                <span className="text-2xl md:text-3xl">{levelData.icon}</span>
              </div>
            </div>
          </div>

          {/* Center: Balance + Level + Progress */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Balance */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-white font-oswald tracking-tight">
                  {account.balance.toLocaleString('ru-RU')}
                </span>
                <span className="text-xl md:text-2xl">👟</span>
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider font-medium mt-0.5">Ваш баланс шагов</div>
            </div>

            {/* Progress bar */}
            {progress.nextLevel !== null ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>До {levelData.level === 1 ? 'Silver' : levelData.level === 2 ? 'Gold' : 'Platinum'}</span>
                  <span className="font-medium">{progress.remaining.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${colors.progress} transition-all duration-500`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/90 font-medium">
                🎉 Максимальный уровень!
              </div>
            )}
          </div>

          {/* Right: Level Badge & Cashback */}
          <div className="flex-shrink-0 text-right space-y-2">
            <div>
              <div className={`inline-flex items-center gap-1.5 rounded-full ${colors.badgeBg} px-3 py-1.5 text-xs ${colors.badgeText} ring-1 ${colors.badgeRing} font-semibold relative overflow-hidden`}>
                <span className={`absolute inset-0 bg-gradient-to-r from-transparent ${colors.badgeShimmer} to-transparent animate-shimmer`}></span>
                <span className="relative">{levelData.name}</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 ring-1 ring-white/20 px-3 py-2">
              <div className="text-xs text-white/60 uppercase tracking-wider font-medium">Кешбек</div>
              <div className="text-xl md:text-2xl font-bold text-white font-oswald">{levelData.percent}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

