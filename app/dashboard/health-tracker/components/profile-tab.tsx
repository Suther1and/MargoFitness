'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Crown, Gift, ChevronRight, Calendar, Sparkles, Edit, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Profile, UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'
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
}

// Цветовые схемы для тарифов
const tierColors = {
  free: {
    bg: 'bg-gray-500/15',
    text: 'text-gray-200',
    ring: 'ring-gray-400/30',
    icon: 'text-gray-300',
    glow: 'bg-gray-500/10',
  },
  basic: {
    bg: 'bg-amber-700/15',
    text: 'text-amber-200',
    ring: 'ring-amber-700/30',
    icon: 'text-orange-300',
    glow: 'bg-orange-500/10',
  },
  pro: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-200',
    ring: 'ring-purple-400/30',
    icon: 'text-purple-300',
    glow: 'bg-purple-500/10',
  },
  elite: {
    bg: 'bg-yellow-400/15',
    text: 'text-yellow-200',
    ring: 'ring-yellow-400/30',
    icon: 'text-yellow-400',
    glow: 'bg-yellow-500/10',
  }
}

export function ProfileTab({ profile, bonusStats }: ProfileTabProps) {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  const subscriptionActive = isSubscriptionActive(profile)
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const currentTierColors = tierColors[profile.subscription_tier as keyof typeof tierColors] || tierColors.free

  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  const displayName = profile.full_name || 'Пользователь'
  const displayEmail = profile.email && !profile.email.includes('@telegram.local') ? profile.email : null
  const displayPhone = profile.phone || null

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      {/* Карточка профиля */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={cn("absolute inset-0 blur-lg opacity-50", currentTierColors.glow)} />
              <div className={cn("relative w-16 h-16 rounded-2xl flex items-center justify-center border-2", currentTierColors.bg, currentTierColors.ring)}>
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <User className={cn("w-8 h-8", currentTierColors.icon)} />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
              <div className="flex flex-col gap-1">
                {displayEmail && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Mail className="w-3 h-3" />
                    {displayEmail}
                  </div>
                )}
                {displayPhone && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Phone className="w-3 h-3" />
                    {displayPhone}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setProfileDialogOpen(true)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <Edit className="w-4 h-4 text-white/60 group-hover:text-white" />
          </button>
        </div>
      </motion.div>

      {/* Карточка подписки */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          "relative overflow-hidden rounded-[2.5rem] border p-6",
          currentTierColors.bg,
          "border-white/10"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl border-2", currentTierColors.ring, currentTierColors.bg)}>
              <Crown className={cn("w-6 h-6", currentTierColors.icon)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("text-lg font-bold uppercase tracking-wider", currentTierColors.text)}>
                  {tierDisplayName}
                </h3>
                {subscriptionActive && (
                  <div className="px-2 py-0.5 rounded-md bg-green-500/20 border border-green-500/30">
                    <span className="text-[8px] font-black text-green-400 uppercase tracking-wider">Активна</span>
                  </div>
                )}
              </div>
              {subscriptionActive && profile.subscription_end_date && daysLeft !== null && (
                <p className="text-xs text-white/40 mt-1">
                  {daysLeft > 0 ? (
                    <>Осталось {daysLeft} {getMonthGenitiveCase(daysLeft)}</>
                  ) : (
                    <>Истекла</>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {profile.subscription_tier === 'free' || profile.subscription_tier === 'basic' ? (
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">Улучшить</span>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : subscriptionActive ? (
            <button
              onClick={() => setRenewalModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm font-bold text-white/80">Продлить</span>
            </button>
          ) : (
            <button
              onClick={() => setRenewalModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:from-orange-500/30 hover:to-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-sm font-bold text-orange-300 uppercase tracking-wider">Продлить подписку</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Карточка бонусов */}
      {bonusStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 border-2 border-amber-500/30">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">
                  Бонусы
                </h3>
                <p className="text-xs text-white/40 mt-1">
                  Уровень {bonusStats.levelData.level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-400">
                {bonusStats.account.balance}
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">баллов</div>
            </div>
          </div>

          {/* Прогресс до следующего уровня */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/40">До уровня {bonusStats.levelData.level + 1}</span>
              <span className="text-xs text-amber-400 font-bold">
                {Math.round(bonusStats.progress.progressPercent)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bonusStats.progress.progressPercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>

          <Link
            href="/dashboard/bonuses"
            className="mt-4 w-full py-3 px-4 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-sm font-bold text-amber-300">Подробнее</span>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Модальные окна */}
      <ProfileEditDialog
        isOpen={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        profile={profile}
      />
      
      <SubscriptionRenewalModal
        isOpen={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        profile={profile}
      />
      
      <SubscriptionUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        profile={profile}
      />
    </div>
  )
}
