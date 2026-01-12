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
  ArrowUpRight,
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Profile, UserBonus, CashbackLevel, calculateLevelProgress, CASHBACK_LEVELS } from '@/types/database'
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

  // Новые стили для уровней бонусных карт
  const getBonusLevelStyles = (level: number) => {
    switch (level) {
      case 4: // Platinum
        return {
          gradient: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 25%, #dbeafe 50%, #94a3b8 100%)',
          badge: 'bg-slate-900/90 border-white/10 text-white',
          points: 'text-[#020617]',
          subtext: 'text-slate-600',
          cta: 'bg-slate-900 border-white/10 text-white hover:bg-black',
          icon: 'text-slate-800',
          shadow: 'shadow-blue-300/40'
        }
      case 3: // Gold
        return {
          gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #aa771c 100%)',
          badge: 'bg-black/20 border-black/10 text-amber-950',
          points: 'text-amber-950',
          subtext: 'text-amber-900/70',
          cta: 'bg-black/10 border-black/20 text-amber-950 hover:bg-black/20',
          icon: 'text-amber-900',
          shadow: 'shadow-yellow-500/20'
        }
      case 2: // Silver
        return {
          gradient: 'linear-gradient(135deg, #757575 0%, #bdbdbd 25%, #424242 50%, #212121 100%)',
          badge: 'bg-black/20 border-white/10 text-white',
          points: 'text-white',
          subtext: 'text-slate-100/70',
          cta: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
          icon: 'text-slate-100',
          shadow: 'shadow-slate-500/20'
        }
      default: // Bronze (1)
        return {
          gradient: 'linear-gradient(135deg, #b46d3e 0%, #dfa579 25%, #8c4a20 50%, #5d2e12 100%)',
          badge: 'bg-black/20 border-white/20 text-orange-50',
          points: 'text-white',
          subtext: 'text-orange-100/70',
          cta: 'bg-white/10 border-white/30 text-white hover:bg-white/20',
          icon: 'text-orange-50',
          shadow: 'shadow-orange-900/20'
        }
    }
  }

  const bonusStyles = getBonusLevelStyles(bonusStats?.levelData.level || 1)

  return (
    <div className="pb-32 space-y-6 pt-2">
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

      {/* 2. Control Grid - Row with Subscription and Actions */}
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

        {/* Quick Actions / Settings & Upgrade */}
        <div className="col-span-1 grid grid-rows-2 gap-4">
          <button 
            onClick={() => setProfileDialogOpen(true)}
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-4 flex items-center gap-3 active:scale-95 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Профиль</span>
          </button>
          
          <button 
            onClick={() => setUpgradeModalOpen(true)}
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-4 flex items-center gap-3 active:scale-95 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Тариф</span>
          </button>
        </div>
      </section>

      {/* 3. New Bronze/Bonus Card Redesign */}
      <section className="relative group">
        <div 
          onClick={() => window.location.href = '/dashboard/bonuses'}
          className={cn(
            "relative overflow-hidden rounded-[2rem] p-5 shadow-xl transition-all duration-300 transform active:scale-[0.98] min-h-[150px] flex flex-col justify-between",
            bonusStyles.shadow
          )}
          style={{ background: bonusStyles.gradient }}
        >
          {/* Premium Inner Glow */}
          <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/20 inset-shadow-sm pointer-events-none" />
          
          {/* Diagonal Light Overlay - matching reference exactly */}
          <div 
            className="absolute inset-0 opacity-60 pointer-events-none" 
            style={{ 
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 45%, transparent 60%)',
              mixBlendMode: 'overlay',
              backgroundSize: '200% auto'
            }} 
          />
          
          {/* Geometric Patterns overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute right-0 bottom-0 w-48 h-48 translate-x-12 translate-y-12 rounded-full border-[20px] border-white/5 blur-sm pointer-events-none"></div>
          
          {/* Shimmer animation for the badge */}
          <style jsx>{`
            @keyframes shimmer {
              0% { transform: translateX(-150%) skewX(-15deg); }
              50%, 100% { transform: translateX(250%) skewX(-15deg); }
            }
            .shimmer-effect {
              position: absolute;
              top: 0; left: 0;
              width: 50%; height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
              animation: shimmer 3s infinite;
            }
          `}</style>

          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            {/* Card Top */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Trophy className={cn("w-4 h-4", bonusStyles.icon)} />
                <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-90", bonusStyles.icon)}>Бонусы</span>
              </div>
              
              <div className={cn("relative overflow-hidden backdrop-blur-md border rounded-lg px-2.5 py-1", bonusStyles.badge)}>
                <span className="text-[10px] font-black tracking-widest relative z-10 uppercase">
                  {bonusStats?.levelData.name || 'BRONZE'}
                </span>
                <div className="shimmer-effect"></div>
              </div>
            </div>

            {/* Card Middle (Points) */}
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest block mb-0.5", bonusStyles.subtext)}>баланс</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-3xl font-black font-oswald tracking-tight", bonusStyles.points)}>
                      {bonusStats?.account.balance.toLocaleString('ru-RU') || 0}
                    </span>
                    <Sparkles className={cn("w-4 h-4", bonusStyles.subtext)} />
                  </div>
                </div>
                
                {bonusStats && (
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", bonusStyles.points)}>
                    {bonusStats.progress.progress}%
                  </span>
                )}
              </div>

              {/* Progress Bar - Spanning from start to end */}
              {bonusStats && (
                <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bonusStats.progress.progress}%` }}
                    className={cn("h-full rounded-full bg-white/40")}
                  />
                </div>
              )}
            </div>

            {/* Card Bottom & CTA */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.href = '/dashboard/bonuses'; }}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-1 hover:opacity-70 transition-opacity flex items-center gap-1",
                  bonusStyles.icon
                )}
              >
                Подробнее
                <ChevronRight className="w-3 h-3" />
              </button>

              <button className={cn(
                "backdrop-blur-md border text-[9px] font-black uppercase tracking-widest py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-lg",
                bonusStyles.cta
              )}>
                Использовать
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Secondary Actions */}
      <section className="pt-2">
        <a 
          href="/auth/logout"
          className="w-full flex items-center justify-center gap-2 p-5 rounded-[2rem] bg-red-500/5 border border-red-500/10 active:scale-95 transition-all opacity-60 hover:opacity-100"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">Выйти из аккаунта</span>
        </a>
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
