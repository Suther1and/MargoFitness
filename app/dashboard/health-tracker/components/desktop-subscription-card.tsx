'use client'

import { useEffect, useState } from 'react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'

interface DesktopSubscriptionCardProps {
  profile: Profile
  onRenewalClick: () => void
  onUpgradeClick: () => void
  onFreezeClick?: () => void
}

export function DesktopSubscriptionCard({ profile, onRenewalClick, onUpgradeClick, onFreezeClick }: DesktopSubscriptionCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const subscriptionActive = isSubscriptionActive(profile)

  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  const tierColors = {
    free: {
      bg: 'bg-gray-500/15',
      text: 'text-gray-200',
      ring: 'ring-gray-400/30',
      icon: 'text-gray-300',
      accent: 'from-gray-500/10',
      glow: 'bg-gray-500/10',
      hoverShadow: 'md:hover:shadow-gray-500/10',
      buttonBg: 'from-gray-500/10 to-slate-500/10',
      buttonHover: 'hover:from-gray-500/15 hover:to-slate-500/15 hover:ring-gray-400/40',
      buttonRing: 'ring-gray-400/30',
      buttonIconBg: 'bg-gray-500/20',
      buttonBadge: 'bg-gray-500/20 text-gray-200'
    },
    basic: {
      bg: 'bg-amber-700/15',
      text: 'text-amber-200',
      ring: 'ring-amber-700/30',
      icon: 'text-orange-300',
      accent: 'from-orange-500/10',
      glow: 'bg-orange-500/10',
      hoverShadow: 'md:hover:shadow-orange-500/10',
      buttonBg: 'from-orange-500/10 to-red-500/10',
      buttonHover: 'hover:from-orange-500/15 hover:to-red-500/15 hover:ring-orange-400/40',
      buttonRing: 'ring-orange-400/30',
      buttonIconBg: 'bg-orange-500/20',
      buttonBadge: 'bg-orange-500/20 text-orange-200'
    },
    pro: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-200',
      ring: 'ring-purple-400/30',
      icon: 'text-purple-300',
      accent: 'from-purple-500/10',
      glow: 'bg-purple-500/10',
      hoverShadow: 'md:hover:shadow-purple-500/10',
      buttonBg: 'from-purple-500/10 to-indigo-500/10',
      buttonHover: 'hover:from-purple-500/15 hover:to-indigo-500/15 hover:ring-purple-400/40',
      buttonRing: 'ring-purple-400/30',
      buttonIconBg: 'bg-purple-500/20',
      buttonBadge: 'bg-purple-500/20 text-purple-200'
    },
    elite: {
      bg: 'bg-yellow-400/15',
      text: 'text-yellow-200',
      ring: 'ring-yellow-400/30',
      icon: 'text-yellow-400',
      accent: 'from-yellow-500/10',
      glow: 'bg-yellow-500/10',
      hoverShadow: 'md:hover:shadow-yellow-500/10',
      buttonBg: 'from-yellow-500/10 to-amber-500/10',
      buttonHover: 'hover:from-yellow-500/15 hover:to-amber-500/15 hover:ring-yellow-400/40',
      buttonRing: 'ring-yellow-400/30',
      buttonIconBg: 'bg-yellow-500/20',
      buttonBadge: 'bg-yellow-500/20 text-yellow-200'
    }
  }
  
  const currentTierColors = tierColors[profile.subscription_tier as keyof typeof tierColors] || tierColors.free

  return (
    <section className={`group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl ${currentTierColors.hoverShadow}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTierColors.accent} via-transparent to-transparent pointer-events-none`} />
      <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full ${currentTierColors.glow} blur-3xl pointer-events-none`} />

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-3 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white/80 text-xs relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            <span className="font-medium">Подписка</span>
          </div>
          {profile.is_frozen ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onFreezeClick) onFreezeClick();
              }}
              className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 px-2 py-0.5 text-[10px] text-cyan-200 ring-1 ring-cyan-400/30 transition-colors cursor-pointer"
            >
              <span className="relative h-1 w-1 rounded-full bg-cyan-400"></span>
              На паузе
            </button>
          ) : subscriptionActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200 ring-1 ring-emerald-400/30">
              <span className="relative h-1 w-1 rounded-full bg-emerald-400">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
              </span>
              Активна
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-200 ring-1 ring-red-400/30">
              <span className="relative h-1 w-1 rounded-full bg-red-400"></span>
              Неактивна
            </span>
          )}
        </div>

        <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white font-oswald uppercase tracking-tight">{tierDisplayName}</h3>
              <p className="text-[10px] text-white/60 mt-0.5">
                {profile.is_frozen ? 'На паузе' : subscriptionActive ? 'Активная' : 'Неактивна'}
              </p>
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-base text-white whitespace-nowrap">
                  <span className="font-bold">{daysLeft}</span>{' '}
                  <span className="text-[10px] font-normal text-white/50">
                    {(() => {
                      const lastDigit = daysLeft % 10
                      const lastTwoDigits = daysLeft % 100
                      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней'
                      if (lastDigit === 1) return 'день'
                      if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
                      return 'дней'
                    })()}
                  </span>
                </p>
              </div>
            )}
          </div>
          
          {profile.subscription_expires_at && (
            <div className="flex items-center gap-2 text-[10px] text-white/60 pt-2 border-t border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="truncate">До {new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : onRenewalClick()}
            className={`w-full rounded-xl bg-gradient-to-r ${currentTierColors.buttonBg} ring-1 ${currentTierColors.buttonRing} p-2 transition-all ${currentTierColors.buttonHover} active:scale-95`} 
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <div className={`w-8 h-8 rounded-lg ${currentTierColors.buttonIconBg} flex items-center justify-center flex-shrink-0`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 16h5v5"></path>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-medium text-white">Продлить</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : onUpgradeClick()}
            className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-2 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95" 
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M9 19h6"></path>
                  <path d="M9 15v-3H5l7-7 7 7h-4v3H9z"></path>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-medium text-white">Улучшить</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
