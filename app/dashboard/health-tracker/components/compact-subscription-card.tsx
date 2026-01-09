'use client'

import { useEffect, useState } from 'react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'

interface CompactSubscriptionCardProps {
  profile: Profile
  onRenewalClick: () => void
  onUpgradeClick: () => void
}

export function CompactSubscriptionCard({ profile, onRenewalClick, onUpgradeClick }: CompactSubscriptionCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const subscriptionActive = isSubscriptionActive(profile)

  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  const tierColors = {
    free: {
      bg: 'from-gray-500/10',
      icon: 'text-gray-300',
      badge: 'bg-gray-500/20 text-gray-200 ring-gray-400/40',
    },
    basic: {
      bg: 'from-orange-500/10',
      icon: 'text-orange-300',
      badge: 'bg-orange-500/20 text-orange-200 ring-orange-400/40',
    },
    pro: {
      bg: 'from-purple-500/10',
      icon: 'text-purple-300',
      badge: 'bg-purple-500/20 text-purple-200 ring-purple-400/40',
    },
    elite: {
      bg: 'from-yellow-500/10',
      icon: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-200 ring-yellow-400/40',
    }
  }
  
  const currentTierColors = tierColors[profile.subscription_tier as keyof typeof tierColors] || tierColors.free

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3 flex items-center gap-3 transition-all hover:bg-white/[0.06] hover:ring-white/15">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTierColors.bg} via-transparent to-transparent pointer-events-none`} />
      
      {/* Icon */}
      <div className="relative flex-shrink-0 z-10">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-start min-w-0 relative z-10 flex-1">
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm font-semibold text-white font-oswald uppercase tracking-tight truncate">
            {tierDisplayName}
          </span>
          {subscriptionActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-200 ring-1 ring-emerald-400/30">
              <span className="relative h-1 w-1 rounded-full bg-emerald-400">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] text-red-200 ring-1 ring-red-400/30">
              <span className="relative h-1 w-1 rounded-full bg-red-400"></span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-white/40 font-medium">
          {daysLeft !== null && daysLeft > 0 ? `${daysLeft} дней осталось` : 'Подписка'}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : onRenewalClick()
          }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Продлить"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
            <path d="M16 16h5v5"></path>
          </svg>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : onUpgradeClick()
          }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Улучшить"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
            <path d="M9 19h6"></path>
            <path d="M9 15v-3H5l7-7 7 7h-4v3H9z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
