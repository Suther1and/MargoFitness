'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
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
  ChevronLeft,
  Award
} from 'lucide-react'
import { Profile, UserBonus, CashbackLevel, calculateLevelProgress, CASHBACK_LEVELS } from '@/types/database'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal'
import { SubscriptionUpgradeModal } from '@/components/subscription-upgrade-modal'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive, getEffectiveTier } from '@/lib/access-control'
import { cn } from '@/lib/utils'
import { PremiumAchievementsCard } from './premium-achievements-card'
import { MobileProfileCard } from './mobile-profile-card'

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
  const [activeTab, setActiveTab] = useState<'subscription' | 'bonuses' | 'achievements'>('subscription')

  const subscriptionActive = isSubscriptionActive(profile)
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  
  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  // Новые стили для блока подписки
  const getSubscriptionStyles = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          card: 'linear-gradient(165deg, #2a2110 0%, #17140c 40%, #090805 100%)',
          pattern: 'rgba(234, 179, 8, 0.1)',
          accent: 'text-yellow-400',
          border: 'rgba(234, 179, 8, 0.4)',
          badge: 'bg-amber-950/90 border-white/10 text-amber-50',
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
          badge: 'bg-purple-950/90 border-white/10 text-purple-50',
          badgeDot: 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]',
          glow: 'bg-purple-600/10',
          shimmer: 'rgba(168, 85, 247, 0.08)',
          status: 'text-purple-300',
          btnPrimary: 'from-purple-50 to-purple-100 text-purple-950 hover:from-white hover:to-purple-50',
          btnPrimaryIcon: 'text-purple-800'
        }
      case 'basic':
        return {
          card: 'linear-gradient(165deg, #2a1f18 0%, #1c130e 40%, #0f0805 100%)',
          pattern: 'rgba(217, 119, 6, 0.1)',
          accent: 'text-orange-400',
          border: 'rgba(251, 146, 60, 0.4)',
          badge: 'bg-[#2d1a0a]/90 border-white/10 text-orange-50',
          badgeDot: 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]',
          glow: 'bg-orange-600/10',
          shimmer: 'rgba(251, 146, 60, 0.08)',
          status: 'text-orange-300',
          btnPrimary: 'from-orange-50 to-orange-100 text-orange-950 hover:from-white hover:to-orange-50',
          btnPrimaryIcon: 'text-orange-800'
        }
      default: // free / none
        return {
          card: 'linear-gradient(165deg, #171717 0%, #0a0a0a 40%, #000000 100%)',
          pattern: 'rgba(255, 255, 255, 0.03)',
          accent: 'text-white/60',
          border: 'rgba(255, 255, 255, 0.1)',
          badge: 'bg-white/5 border-white/10 text-white/40',
          badgeDot: 'bg-white/20 shadow-[0_0_6px_rgba(255,255,255,0.2)]',
          glow: 'bg-white/5',
          shimmer: 'rgba(255, 255, 255, 0.03)',
          status: 'text-white/40',
          btnPrimary: 'from-white to-neutral-200 text-black hover:from-white hover:to-white shadow-[0_0_20px_rgba(255,255,255,0.2)]',
          btnPrimaryIcon: 'text-black'
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
          border-radius: 2.5rem;
          padding: 1.5px;
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

      {/* 1. Integrated Header Card with Tabs */}
      <MobileProfileCard 
        profile={profile} 
        onEditClick={() => setProfileDialogOpen(true)}
        tabs={
          <div className="flex items-center px-2 h-[52px] w-full relative">
            <div className="flex h-full w-full relative">
              <button
                onClick={() => setActiveTab('subscription')}
                className={cn(
                  "flex-1 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all relative h-full flex items-center justify-center z-10",
                  activeTab === 'subscription' ? "text-white" : "text-white/25 hover:text-white/40"
                )}
              >
                {activeTab === 'subscription' && (
                  <motion.div 
                    layoutId="profileActiveTab" 
                    className="absolute inset-0 -z-10 flex flex-col items-center justify-end pb-1.5" 
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
                  >
                    <motion.div 
                      layoutId="profileActiveBar"
                      className={cn("w-10 h-[2.5px] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", 
                        profile.subscription_tier === 'elite' ? 'bg-yellow-400 shadow-yellow-400/40' :
                        profile.subscription_tier === 'pro' ? 'bg-purple-500 shadow-purple-500/40' :
                        profile.subscription_tier === 'basic' ? 'bg-orange-500 shadow-orange-500/40' : 'bg-white/40'
                      )} 
                    />
                  </motion.div>
                )}
                <span className="relative z-10">Подписка</span>
              </button>
              <button
                onClick={() => setActiveTab('bonuses')}
                className={cn(
                  "flex-1 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all relative h-full flex items-center justify-center z-10",
                  activeTab === 'bonuses' ? "text-white" : "text-white/25 hover:text-white/40"
                )}
              >
                {activeTab === 'bonuses' && (
                  <motion.div 
                    layoutId="profileActiveTab" 
                    className="absolute inset-0 -z-10 flex flex-col items-center justify-end pb-1.5" 
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
                  >
                    <motion.div 
                      layoutId="profileActiveBar"
                      className={cn("w-10 h-[2.5px] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", 
                        bonusStats?.levelData.level === 4 ? 'bg-blue-400 shadow-blue-400/40' :
                        bonusStats?.levelData.level === 3 ? 'bg-amber-400 shadow-amber-400/40' :
                        bonusStats?.levelData.level === 2 ? 'bg-slate-300 shadow-slate-300/40' : 'bg-orange-600 shadow-orange-600/40'
                      )} 
                    />
                  </motion.div>
                )}
                <span className="relative z-10">Бонусы</span>
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={cn(
                  "flex-1 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all relative h-full flex items-center justify-center z-10",
                  activeTab === 'achievements' ? "text-white" : "text-white/25 hover:text-white/40"
                )}
              >
                {activeTab === 'achievements' && (
                  <motion.div 
                    layoutId="profileActiveTab" 
                    className="absolute inset-0 -z-10 flex flex-col items-center justify-end pb-1.5" 
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
                  >
                    <motion.div 
                      layoutId="profileActiveBar"
                      className="w-10 h-[2.5px] rounded-full bg-emerald-500 shadow-emerald-500/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                    />
                  </motion.div>
                )}
                <span className="relative z-10">Достижения</span>
              </button>
            </div>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {activeTab === 'subscription' && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* 2. Premium Subscription Card */}
            <section className="sub-card w-full rounded-[2rem] p-6 transition-all duration-300 relative group min-h-[200px]">
              <div className="sub-pattern"></div>
              
              {/* Decorative Ambient Orbs - simplified */}
              <div className={cn("absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-3xl", subStyles.glow)}></div>
              <div className={cn("absolute -left-10 bottom-0 w-40 h-40 rounded-full pointer-events-none opacity-10 blur-2xl", subStyles.glow)}></div>

              <div className="relative z-10 flex flex-col h-full gap-8">
                {/* Card Top: Title & Badge */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-1.5 rounded-lg bg-black/60 border border-white/5 shadow-sm")}>
                      <Crown className={cn("w-4 h-4 opacity-80", subStyles.status)} />
                    </div>
                    <span className={cn("text-[11px] font-black uppercase tracking-widest opacity-60 font-montserrat", subStyles.status)}>Подписка</span>
                  </div>
                  
                  {/* Subscription Badge */}
                  <div className={cn(
                    "relative overflow-hidden border rounded-lg px-2.5 h-6 flex items-center justify-center bg-black/40",
                    !subscriptionActive && profile.subscription_tier !== 'free'
                      ? "border-white/10 bg-white/5"
                      : subStyles.badge
                  )}>
                    <span className={cn(
                      "text-[10px] font-black tracking-widest relative z-10 uppercase font-montserrat leading-none",
                      !subscriptionActive && profile.subscription_tier !== 'free' ? "text-white/30" : ""
                    )}>
                      {!subscriptionActive && profile.subscription_tier !== 'free'
                        ? `${tierDisplayName} · Истекла`
                        : tierDisplayName}
                    </span>
                  </div>
                </div>

                  {/* Card Body: Stats (Left) & Actions (Right) */}
                  <div className={cn("flex justify-between gap-4 mt-auto", subscriptionActive ? "items-start" : "items-end")}>
                  
                  {/* Left: Status & Duration */}
                  <div className="flex flex-col gap-1">
                    {/* Status */}
                    <div className="flex items-center gap-2 opacity-80">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={cn(
                          "absolute inline-flex h-full w-full rounded-full opacity-75", 
                          subscriptionActive ? "animate-ping " + subStyles.badgeDot : "bg-red-500/50"
                        )}></span>
                        <span className={cn(
                          "relative inline-flex rounded-full h-1.5 w-1.5", 
                          subscriptionActive ? subStyles.badgeDot : "bg-red-500"
                        )}></span>
                      </span>
                      <span className={cn("text-[11px] font-black tracking-widest uppercase font-montserrat", subStyles.status)}>
                        {subscriptionActive ? 'Активна' : 'Неактивна'}
                      </span>
                      {subscriptionActive && profile.subscription_expires_at && (
                        <span className="text-[9px] text-white/40 font-medium font-montserrat lowercase">
                          до {format(new Date(profile.subscription_expires_at), 'd MMMM', { locale: ru })}
                        </span>
                      )}
                    </div>

                    {/* Days Count or Inactive Message */}
                    {subscriptionActive ? (
                      <div className="flex items-end gap-3">
                        <span className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-lg leading-none font-oswald px-0.5">
                          {daysLeft || 0}
                        </span>
                        <div className="flex flex-col pb-1.5">
                          <span className="text-xs text-white/40 font-bold leading-none uppercase font-montserrat">дня</span>
                          <span className="text-[9px] text-white/20 font-bold leading-none mt-1 uppercase font-montserrat tracking-tighter">осталось</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 pt-2 pb-0">
                        <span className="text-2xl font-black text-white/60 uppercase font-oswald leading-none tracking-tight">
                          Подписка
                        </span>
                        <span className="text-lg font-bold text-white/30 uppercase font-oswald leading-none tracking-tight">
                          не активна
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions Stacked */}
                  <div className="flex flex-col gap-2 w-[140px]">
                    {subscriptionActive ? (
                      <>
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
                          className="relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-wider h-9 px-3 rounded-xl flex items-center justify-center gap-2 transition-all group/btn2 md:backdrop-blur-sm active:scale-95 font-montserrat"
                        >
                          <History className="w-3.5 h-3.5 text-white/20 group-hover/btn2:text-white/60 transition-colors" />
                          <span>Продлить</span>
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setUpgradeModalOpen(true)}
                        className={cn(
                          "relative bg-gradient-to-b border border-transparent text-[10px] font-black uppercase tracking-wider h-11 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 group/btn font-montserrat",
                          subStyles.btnPrimary
                        )}
                      >
                        <ArrowRight className={cn("w-5 h-5 transition-transform group-hover:translate-x-0.5", subStyles.btnPrimaryIcon)} />
                        <span>Выбрать подписку</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'bonuses' && (
          <motion.div
            key="bonuses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
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
                  className="absolute inset-0 opacity-40 pointer-events-none" 
                  style={{ 
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 45%, transparent 60%)',
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
                <div className={cn("absolute right-0 bottom-0 w-48 h-48 translate-x-12 translate-y-12 rounded-full border-[24px] blur-3xl opacity-30 pointer-events-none", bonusStyles.circle)}
                ></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Trophy className={cn("w-4 h-4", bonusStyles.icon)} />
                      <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-90 font-montserrat", bonusStyles.icon)}>Бонусы</span>
                    </div>
                    
                    <div className={cn("relative overflow-hidden border rounded-lg px-2.5 h-6 flex items-center justify-center bg-black/20", bonusStyles.badge)}>
                      <span className="text-[10px] font-black tracking-widest relative z-10 uppercase font-montserrat leading-none">
                        {bonusStats?.levelData.name || 'BRONZE'}
                      </span>
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
                          {bonusStats && (
                            <div className={cn(
                              "ml-1 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-tight font-montserrat flex items-center gap-1 shadow-sm bg-white/10",
                              bonusStyles.badge
                            )}>
                              <div className={cn("w-1 h-1 rounded-full animate-pulse", bonusStyles.icon === bonusStyles.points ? "bg-current" : "bg-white")} />
                              <span>{bonusStats.levelData.percent}% кэшбэк</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {bonusStats && (
                        <span className={cn("text-[10px] font-black uppercase tracking-widest font-oswald leading-none", bonusStyles.points)}>
                          {bonusStats.progress.nextLevel && (
                            <span className="opacity-50">
                              еще {bonusStats.progress.remaining.toLocaleString('ru-RU')} ₽ до уровня {' '}
                              <span>
                                {CASHBACK_LEVELS.find(l => l.level === bonusStats.progress.nextLevel)?.name.toUpperCase()}
                              </span>
                            </span>
                          )}
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
                      "bg-white/10 border text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-lg font-montserrat",
                      bonusStyles.cta
                    )}>
                      <span className="leading-none mt-[1px]">Использовать</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <PremiumAchievementsCard />
          </motion.div>
        )}
      </AnimatePresence>

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
        currentTier={getEffectiveTier(profile)}
        userId={profile.id}
      />
    </div>
  )
}
