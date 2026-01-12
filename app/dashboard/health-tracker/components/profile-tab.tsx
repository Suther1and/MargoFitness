'use client'

import { useState, useEffect } from 'react'
import { Profile, UserBonus, CashbackLevel, calculateLevelProgress, CASHBACK_LEVELS } from '@/types/database'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal'
import { SubscriptionUpgradeModal } from '@/components/subscription-upgrade-modal'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'
import { getMonthGenitiveCase } from '@/lib/utils'
import Link from 'next/link'

interface ProfileTabProps {
  profile: Profile
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
  } | null
  onProfileUpdate?: (profile: Profile) => void
}

export function ProfileTab({ profile, bonusStats, onProfileUpdate }: ProfileTabProps) {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  const subscriptionActive = isSubscriptionActive(profile)
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const displayName = profile.full_name || 'Пользователь'
  const displayEmail = profile.email && !profile.email.includes('@telegram.local') ? profile.email : null
  const displayPhone = profile.phone || null

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

  // Bonus card colors
  const bonusLevelColors = bonusStats ? {
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
  }[bonusStats.levelData.level as 1 | 2 | 3 | 4] : null

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      {/* Mobile User Profile Card */}
      <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:hover:ring-white/20 md:hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar - clickable for editing */}
          <button 
            className="relative flex-shrink-0 group/avatar" 
            style={{ touchAction: 'manipulation' }}
            onClick={() => setProfileDialogOpen(true)}
          >
            <div className="w-28 h-28 rounded-[18px] bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] transition-all group-hover/avatar:ring-2 group-hover/avatar:ring-orange-400/50 active:scale-95">
              <div className="w-full h-full rounded-[16px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            {/* Edit overlay on active/hover */}
            <div className="absolute inset-0 rounded-[18px] bg-black/60 opacity-0 group-hover/avatar:opacity-100 group-active/avatar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                <path d="m15 5 4 4"></path>
              </svg>
            </div>
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3.5 relative">
            {/* Logout Button - positioned absolutely to not affect layout height */}
            <a href="/auth/logout" className="absolute top-1 right-0 z-20 flex items-center gap-1.5 rounded-lg bg-red-500/10 ring-1 ring-red-400/30 px-2.5 py-1.5 transition-all hover:bg-red-500/15 hover:ring-red-400/40 active:scale-95 text-xs" style={{ touchAction: 'manipulation' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="text-red-200/90 font-medium">Выход</span>
            </a>
            
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white font-oswald uppercase tracking-tight truncate pr-20">
                {displayName}
              </h3>
              
              <div className={`inline-flex items-center gap-1.5 rounded-full ${currentTierColors.bg} px-2.5 py-1 text-xs ${currentTierColors.text} ring-1 ${currentTierColors.ring} mt-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg>
                <span className="font-medium">{tierDisplayName}</span>
              </div>
            </div>
            
            <div className="space-y-0.5">
              {/* Phone */}
              <button 
                className="flex items-center gap-2 text-xs text-white/60 w-full rounded-lg py-1.5 px-2 transition-all hover:bg-white/[0.04] active:scale-95" 
                style={{ touchAction: 'manipulation' }}
                onClick={() => setProfileDialogOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300 flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span className="pointer-events-none" style={{ minWidth: '120px', display: 'inline-block' }}>{displayPhone || 'Не указан'}</span>
              </button>
              
              {/* Email */}
              {displayEmail && (
                <button 
                  className="flex items-center gap-2 text-xs text-white/60 w-full rounded-lg py-1.5 px-2 transition-all hover:bg-white/[0.04] active:scale-95" 
                  style={{ touchAction: 'manipulation' }}
                  onClick={() => setProfileDialogOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 flex-shrink-0">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span className="truncate pointer-events-none">{displayEmail}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Card */}
      <section className={`group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl ${currentTierColors.hoverShadow}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTierColors.accent} via-transparent to-transparent pointer-events-none`} />
        <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full ${currentTierColors.glow} blur-3xl pointer-events-none`} />

        <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/80 text-sm relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
              <span className="font-medium">Моя подписка</span>
            </div>
            {subscriptionActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/30">
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
                </span>
                Активна
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs text-red-200 ring-1 ring-red-400/30">
                <span className="relative h-1.5 w-1.5 rounded-full bg-red-400">
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping"></span>
                </span>
                Неактивна
              </span>
            )}
          </div>

          <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white font-oswald uppercase tracking-tight">{tierDisplayName}</h3>
                <p className="text-sm text-white/60 mt-1">
                  {subscriptionActive ? 'Активная подписка' : 'Подписка неактивна'}
                </p>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xl text-white whitespace-nowrap">
                    <span className="font-bold">{daysLeft}</span>{' '}
                    <span className="text-xs font-normal text-white/50">
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
              <div className="flex items-center gap-2 text-xs text-white/60 pt-3 border-t border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Истекает {new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : setRenewalModalOpen(true)}
              className={`w-full rounded-xl bg-gradient-to-r ${currentTierColors.buttonBg} ring-1 ${currentTierColors.buttonRing} p-3 transition-all ${currentTierColors.buttonHover} active:scale-95`} 
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${currentTierColors.buttonIconBg} flex items-center justify-center flex-shrink-0`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                      <path d="M16 16h5v5"></path>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-white">Продлить подписку</p>
                    <p className="text-xs text-white/60">Выбери новый тариф</p>
                  </div>
                </div>
                <div className={`rounded-lg ${currentTierColors.buttonBadge} px-3 py-1.5 text-xs whitespace-nowrap flex-shrink-0`}>
                  Открыть
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : setUpgradeModalOpen(true)}
              className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95" 
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                      <path d="M9 19h6"></path>
                      <path d="M9 15v-3H5l7-7 7 7h-4v3H9z"></path>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-white">Апгрейд тарифа</p>
                    <p className="text-xs text-white/60">Улучши свою подписку</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 whitespace-nowrap flex-shrink-0">
                  Открыть
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Bonus Card */}
      {bonusStats && bonusLevelColors && (
        <Link 
          href="/dashboard/bonuses"
          className={`group relative overflow-hidden rounded-3xl p-5 md:p-6 flex flex-col md:hover:shadow-2xl cursor-pointer flex-1 transition-all duration-300 bg-gradient-to-br ${bonusLevelColors.bg} ${bonusLevelColors.ring} ${bonusLevelColors.hover}`}
          style={{ backgroundSize: '200% 200%' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${bonusLevelColors.accent} via-transparent to-transparent pointer-events-none`} />
          <div className={`absolute -left-24 -bottom-24 h-72 w-72 rounded-full ${bonusLevelColors.glow} blur-3xl pointer-events-none`} />

          <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.05] p-4 ring-1 ring-white/20 backdrop-blur relative z-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/90 text-sm relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={bonusLevelColors.icon}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span className="font-medium">Бонусная программа</span>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium relative overflow-hidden ring-1 ${bonusLevelColors.badge}`}>
                <span className="relative">{bonusStats.levelData.name} {bonusStats.levelData.icon}</span>
              </span>
            </div>

            <div className="rounded-xl bg-white/10 ring-1 ring-white/20 p-4 mb-3">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white font-oswald">{bonusStats.account.balance.toLocaleString('ru-RU')}</span>
                <span className="text-lg text-white/70">шагов</span>
              </div>
              <p className="text-sm text-white/80">Твой текущий баланс</p>
              
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex justify-between text-xs text-white/70 mb-2">
                  {bonusStats.progress.nextLevel ? (
                    <>
                      <span>До {CASHBACK_LEVELS.find(l => l.level === bonusStats.progress.nextLevel)?.name} осталось</span>
                      <span className="font-medium">{bonusStats.progress.remaining.toLocaleString('ru-RU')} шагов</span>
                    </>
                  ) : (
                    <span>Максимальный уровень достигнут</span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${bonusLevelColors.progress}`}
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
                className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95 group/btn"
              >
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Использовать</p>
                    <p className="text-xs text-white/60 mt-0.5 whitespace-nowrap">Оплата шагами</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = '/dashboard/bonuses#referral'
                }}
                className={`rounded-xl ring-1 p-3 transition-all active:scale-95 group/btn ${bonusLevelColors.button}`}
              >
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform ${bonusLevelColors.buttonIcon}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Пригласить</p>
                    <p className={`text-xs mt-0.5 whitespace-nowrap ${bonusLevelColors.buttonText}`}>+500 шагов</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Link>
      )}

      {/* Modals */}
      <ProfileEditDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={profile}
        onSuccess={(updatedProfile) => {
          onProfileUpdate?.(updatedProfile)
        }}
      />
      
      <SubscriptionRenewalModal
        open={renewalModalOpen}
        onOpenChange={setRenewalModalOpen}
        currentTier={profile.subscription_tier}
        currentExpires={profile.subscription_expires_at}
        userId={profile.id}
      />
      
      <SubscriptionUpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        currentTier={profile.subscription_tier}
        userId={profile.id}
      />
    </div>
  )
}
