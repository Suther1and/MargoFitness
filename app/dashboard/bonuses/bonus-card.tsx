'use client'

import { UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'

interface BonusCardProps {
  account: UserBonus
  levelData: CashbackLevel
  progress: ReturnType<typeof calculateLevelProgress>
}

export function BonusCard({ account, levelData, progress }: BonusCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/30 p-4 md:p-5 shadow-lg w-full lg:min-w-[580px]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

      {/* Inner card with glassmorphism - like dashboard cards */}
      <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-4 ring-1 ring-white/10 backdrop-blur relative">
        {/* Content - Horizontal Layout */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Left: Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-[2px] shadow-lg shadow-amber-500/20">
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
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
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
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs text-amber-100 ring-1 ring-amber-400/40 font-semibold relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent animate-shimmer"></span>
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

