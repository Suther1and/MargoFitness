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
  ArrowRight,
  History,
  ChevronLeft
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

  // Новые стили для блока подписки
  const getSubscriptionStyles = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          card: 'linear-gradient(165deg, #2a2110 0%, #17140c 40%, #090805 100%)',
          pattern: 'rgba(234, 179, 8, 0.1)',
          accent: 'text-yellow-400',
          border: 'rgba(234, 179, 8, 0.4)',
          badge: 'from-yellow-900/40 to-black/40 border-yellow-500/30',
          badgeDot: 'bg-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.8)]',
          glow: 'bg-yellow-600/10',
          shimmer: 'rgba(234, 179, 8, 0.08)',
          status: 'text-yellow-300',
          btnPrimary: 'from-yellow-50 to-yellow-100 text-yellow-950 hover:from-white hover:to-yellow-50',
          btnPrimaryIcon: 'text-yellow-800'
        }
      case 'pro':
        return {
          card: 'linear-gradient(165deg, #1a162a 0%, #0f0e1a 40%, #08070f 100%)',
          pattern: 'rgba(168, 85, 247, 0.1)',
          accent: 'text-purple-400',
          border: 'rgba(168, 85, 247, 0.4)',
          badge: 'from-purple-900/40 to-black/40 border-purple-500/30',
          badgeDot: 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]',
          glow: 'bg-purple-600/10',
          shimmer: 'rgba(168, 85, 247, 0.08)',
          status: 'text-purple-300',
          btnPrimary: 'from-purple-50 to-purple-100 text-purple-950 hover:from-white hover:to-purple-50',
          btnPrimaryIcon: 'text-purple-800'
        }
      default: // basic
        return {
          card: 'linear-gradient(165deg, #2a1f18 0%, #1c130e 40%, #0f0805 100%)',
          pattern: 'rgba(217, 119, 6, 0.1)',
          accent: 'text-orange-400',
          border: 'rgba(251, 146, 60, 0.4)',
          badge: 'from-orange-900/40 to-black/40 border-orange-500/30',
          badgeDot: 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]',
          glow: 'bg-orange-600/10',
          shimmer: 'rgba(251, 146, 60, 0.08)',
          status: 'text-orange-300',
          btnPrimary: 'from-orange-50 to-orange-100 text-orange-950 hover:from-white hover:to-orange-50',
          btnPrimaryIcon: 'text-orange-800'
        }
    }
  }

  const subStyles = getSubscriptionStyles(profile.subscription_tier)

  // Стили для уровней бонусных карт
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
          shadow: 'shadow-blue-300/40',
          pattern: 'rgba(15, 23, 42, 0.1)',
          progressBar: 'bg-slate-900',
          progressTrack: 'bg-slate-950/10',
          circle: 'border-white/20'
        }
      case 3: // Gold
        return {
          gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #aa771c 100%)',
          badge: 'bg-amber-950/90 border-white/10 text-amber-50',
          points: 'text-[#2d1a0a]',
          subtext: 'text-amber-900/70',
          cta: 'bg-amber-950 border-white/10 text-amber-50 hover:bg-black',
          icon: 'text-amber-900',
          shadow: 'shadow-yellow-500/20',
          pattern: 'rgba(69, 26, 3, 0.12)',
          progressBar: 'bg-amber-950',
          progressTrack: 'bg-amber-950/10',
          circle: 'border-amber-900/10'
        }
      case 2: // Silver
        return {
          gradient: 'linear-gradient(135deg, #8e9196 0%, #ffffff 35%, #5c5f66 75%, #2a2c30 100%)',
          badge: 'bg-slate-900/90 border-white/10 text-slate-50',
          points: 'text-[#0f172a]',
          subtext: 'text-slate-600',
          cta: 'bg-slate-900 border-white/10 text-slate-50 hover:bg-black',
          icon: 'text-slate-800',
          shadow: 'shadow-slate-400/15',
          pattern: 'rgba(15, 23, 42, 0.08)',
          progressBar: 'bg-slate-900',
          progressTrack: 'bg-slate-900/10',
          circle: 'border-white/5'
        }
      default: // Bronze (1)
        return {
          gradient: 'linear-gradient(135deg, #b46d3e 0%, #dfa579 25%, #8c4a20 50%, #5d2e12 100%)',
          badge: 'bg-[#2d1a0a]/90 border-white/10 text-orange-50',
          points: 'text-[#1e0f04]',
          subtext: 'text-[#4a2e19]/70',
          cta: 'bg-[#2d1a0a] border-white/10 text-orange-50 hover:bg-black',
          icon: 'text-[#3e2614]',
          shadow: 'shadow-orange-900/20',
          pattern: 'rgba(255, 255, 255, 0.15)',
          progressBar: 'bg-[#2d1a0a]',
          progressTrack: 'bg-[#2d1a0a]/10',
          circle: 'border-white/5'
        }
    }
  }

  const bonusStyles = getBonusLevelStyles(bonusStats?.levelData.level || 1)

  return (
    <div className="pb-32 space-y-6 pt-2">
      {/* CSS Styles for Subscription Card */}
      <style jsx>{`
        .sub-card {
          background: ${subStyles.card};
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        .sub-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          background-image: linear-gradient(45deg, ${subStyles.pattern} 25%, transparent 25%, transparent 50%, ${subStyles.pattern} 50%, ${subStyles.pattern} 75%, transparent 75%, transparent);
          background-size: 20px 20px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 90%);
          z-index: 1;
        }
        .sub-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 1px;
          background: linear-gradient(180deg, ${subStyles.border}, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 25;
        }
        @keyframes subShimmer {
          0% { transform: translateX(-150%) rotate(25deg); }
          20% { transform: translateX(150%) rotate(25deg); }
          100% { transform: translateX(150%) rotate(25deg); }
        }
        .sub-shine {
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(90deg, transparent, ${subStyles.shimmer}, transparent);
          animation: subShimmer 6s infinite ease-in-out;
          pointer-events: none;
          z-index: 2;
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        .shimmer-effect {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2.5s infinite linear;
        }
      `}</style>

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

      {/* 2. Premium Subscription Card */}
      <section className="sub-card w-full rounded-[2rem] p-6 transform transition-all duration-300 relative group min-h-[200px]">
        <div className="sub-pattern"></div>
        <div className="sub-shine"></div>
        
        {/* Decorative Ambient Orbs */}
        <div className={cn("absolute -right-10 -top-10 w-48 h-48 blur-[80px] rounded-full pointer-events-none mix-blend-screen opacity-50", subStyles.glow)}></div>
        <div className={cn("absolute -left-10 bottom-0 w-40 h-40 blur-[60px] rounded-full pointer-events-none opacity-20", subStyles.glow)}></div>

        <div className="relative z-10 flex flex-col h-full gap-8">
          {/* Card Top: Title & Badge */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className={cn("p-1.5 rounded-lg bg-black/40 border border-white/5 shadow-sm")}>
                <Crown className={cn("w-4 h-4 opacity-80", subStyles.status)} />
              </div>
              <span className={cn("text-[11px] font-black uppercase tracking-widest opacity-60 font-montserrat", subStyles.status)}>Подписка</span>
            </div>
            
            {/* Badge */}
            <div className={cn("relative overflow-hidden bg-gradient-to-b backdrop-blur-md border rounded-full px-3 py-1 shadow-lg", subStyles.badge)}>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", subStyles.badgeDot)}></span>
                <span className="text-[10px] font-black tracking-wider uppercase font-montserrat">{tierDisplayName}</span>
              </div>
            </div>
          </div>

          {/* Card Body: Stats (Left) & Actions (Right) */}
          <div className="flex items-end justify-between gap-4 mt-auto">
            
            {/* Left: Status & Duration */}
            <div className="flex flex-col gap-1">
              {/* Status */}
              <div className="flex items-center gap-2 mb-1 opacity-80">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", subStyles.badgeDot)}></span>
                  <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", subStyles.badgeDot)}></span>
                </span>
                <span className={cn("text-[10px] font-bold tracking-wide uppercase font-montserrat", subStyles.status)}>
                  {subscriptionActive ? 'Активна' : 'Неактивна'}
                </span>
              </div>

              {/* Days Count */}
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-lg leading-[0.8] font-oswald">
                  {daysLeft || 0}
                </span>
                <div className="flex flex-col pb-1.5">
                  <span className="text-xs text-white/40 font-bold leading-none uppercase font-montserrat">дня</span>
                  <span className="text-[9px] text-white/20 font-bold leading-none mt-1 uppercase font-montserrat tracking-tighter">осталось</span>
                </div>
              </div>
            </div>

            {/* Right: Actions Stacked */}
            <div className="flex flex-col gap-2 w-[120px]">
              {/* Upgrade Button (Primary) */}
              <button 
                onClick={() => setUpgradeModalOpen(true)}
                className={cn(
                  "relative bg-gradient-to-b border border-transparent text-[10px] font-black uppercase tracking-wider h-9 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 group/btn font-montserrat",
                  subStyles.btnPrimary
                )}
              >
                <Sparkles className={cn("w-3.5 h-3.5", subStyles.btnPrimaryIcon)} />
                <span>Улучшить</span>
              </button>

              {/* Renew Button (Secondary) */}
              <button 
                onClick={() => setRenewalModalOpen(true)}
                className="relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-wider h-9 px-3 rounded-xl flex items-center justify-center gap-2 transition-all group/btn2 backdrop-blur-sm active:scale-95 font-montserrat"
              >
                <History className="w-3.5 h-3.5 text-white/20 group-hover/btn2:text-white/60 transition-colors" />
                <span>Продлить</span>
              </button>
            </div>
          </div>
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
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              backgroundImage: `radial-gradient(circle at 1px 1px, ${bonusStyles.pattern} 1px, transparent 0)`, 
              backgroundSize: '20px 20px' 
            }}
          />
          <div className={cn("absolute right-0 bottom-0 w-48 h-48 translate-x-12 translate-y-12 rounded-full border-[20px] blur-sm pointer-events-none", bonusStyles.circle)}
            style={{ mixBlendMode: 'overlay' }}
          ></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            {/* Card Top */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Trophy className={cn("w-4 h-4", bonusStyles.icon)} />
                <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-90 font-montserrat", bonusStyles.icon)}>Бонусы</span>
              </div>
              
              <div className={cn("relative overflow-hidden backdrop-blur-md border rounded-lg px-2.5 h-6 flex items-center justify-center", bonusStyles.badge)}>
                <span className="text-[10px] font-black tracking-widest relative z-10 uppercase font-montserrat leading-none">
                  {bonusStats?.levelData.name || 'BRONZE'}
                </span>
                <div className="shimmer-effect"></div>
              </div>
            </div>

            {/* Card Middle (Points) */}
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest block mb-0.5 font-montserrat leading-none", bonusStyles.subtext)}>баланс</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-3xl font-black font-oswald tracking-tight leading-none", bonusStyles.points)}>
                      {bonusStats?.account.balance.toLocaleString('ru-RU') || 0}
                    </span>
                    <Sparkles className={cn("w-4 h-4", bonusStyles.subtext)} />
                  </div>
                </div>
                
                {bonusStats && (
                  <span className={cn("text-[10px] font-black uppercase tracking-widest font-oswald leading-none", bonusStyles.points)}>
                    {bonusStats.progress.progress}%
                  </span>
                )}
              </div>

              {/* Progress Bar - Spanning from start to end */}
              {bonusStats && (
                <div className={cn("h-1.5 w-full rounded-full overflow-hidden", bonusStyles.progressTrack)}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bonusStats.progress.progress}%` }}
                    className={cn("h-full rounded-full", bonusStyles.progressBar)}
                  />
                </div>
              )}
            </div>

            {/* Card Bottom & CTA */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.href = '/dashboard/bonuses'; }}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 h-8 hover:opacity-70 transition-opacity flex items-center gap-1 font-montserrat",
                  bonusStyles.icon
                )}
              >
                <span className="leading-none mt-[1px]">Подробнее</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button className={cn(
                "backdrop-blur-md border text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-lg font-montserrat",
                bonusStyles.cta
              )}>
                <span className="leading-none mt-[1px]">Использовать</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
