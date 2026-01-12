'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Shield, 
  Zap, 
  CreditCard,
  User,
  Mail,
  Phone,
  ArrowUpRight
} from 'lucide-react'
import { Profile, UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal'
import { SubscriptionUpgradeModal } from '@/components/subscription-upgrade-modal'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'
import { cn } from '@/lib/utils'

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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'text-yellow-400'
      case 'pro': return 'text-purple-400'
      case 'basic': return 'text-orange-400'
      default: return 'text-white/40'
    }
  }

  const tierColor = getTierColor(profile.subscription_tier)

  return (
    <div className="pb-32 px-4 space-y-6 max-w-md mx-auto pt-4">
      {/* 1. Integrated Header Card */}
      <section className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <button 
            onClick={() => setProfileDialogOpen(true)}
            className="relative shrink-0"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-2xl">
              <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white/10" />
                )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#0c0c12] rounded-full flex items-center justify-center border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </button>

          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight truncate leading-none mb-2">
              {displayName}
            </h3>
            <div className="flex flex-col gap-1.5">
              {displayEmail && (
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-medium truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  {displayEmail}
                </div>
              )}
              {displayPhone && (
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-medium">
                  <Phone className="w-3 h-3 shrink-0" />
                  {displayPhone}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Control Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Subscription Info */}
        <div 
          onClick={() => subscriptionActive ? setRenewalModalOpen(true) : (window.location.href = '/#pricing')}
          className="col-span-1 bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 flex flex-col justify-between h-40 active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Shield className={cn("w-5 h-5", tierColor)} />
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/10" />
          </div>
          <div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Статус</div>
            <div className="text-xl font-bold text-white font-oswald uppercase tracking-tight leading-none mb-1">
              {tierDisplayName}
            </div>
            <div className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} дн. осталось` : 'Неактивна'}
            </div>
          </div>
        </div>

        {/* Bonus Info */}
        <div 
          onClick={() => window.location.href = '/dashboard/bonuses'}
          className="col-span-1 bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 flex flex-col justify-between h-40 active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/10" />
          </div>
          <div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Баланс</div>
            <div className="text-xl font-bold text-white font-oswald tracking-tight leading-none mb-1">
              {bonusStats?.account.balance.toLocaleString('ru-RU')}
            </div>
            <div className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest">
              {bonusStats?.levelData.name} {bonusStats?.levelData.icon}
            </div>
          </div>
        </div>

        {/* Level Progress - Full Width */}
        {bonusStats && (
          <div 
            onClick={() => window.location.href = '/dashboard/bonuses'}
            className="col-span-2 bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 active:scale-95 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Прогресс уровня</div>
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                {bonusStats.progress.progress}%
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${bonusStats.progress.progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              />
            </div>
            <div className="mt-2 text-[8px] text-center text-white/20 uppercase tracking-[0.2em] font-bold">
              До {bonusStats.progress.nextLevel ? `уровня ${bonusStats.progress.nextLevel}` : 'максимума'} — {bonusStats.progress.remaining.toLocaleString('ru-RU')} шагов
            </div>
          </div>
        )}
      </section>

      {/* 3. Action List */}
      <section className="bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden">
        {[
          { icon: Settings, label: 'Настройки профиля', sub: 'Персональные данные', action: () => setProfileDialogOpen(true), color: 'text-blue-400' },
          { icon: CreditCard, label: 'Управление тарифом', sub: 'Продление и апгрейд', action: () => setUpgradeModalOpen(true), color: 'text-amber-400' },
          { icon: LogOut, label: 'Выйти из аккаунта', sub: 'Завершить сессию', action: () => window.location.href = '/auth/logout', color: 'text-red-400' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={item.action}
            className={cn(
              "w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left",
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", item.color.replace('text', 'bg').replace('400', '500/10'))}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">{item.label}</div>
                <div className="text-[10px] text-white/20 uppercase tracking-widest font-medium mt-0.5">{item.sub}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/10" />
          </button>
        ))}
      </section>

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
