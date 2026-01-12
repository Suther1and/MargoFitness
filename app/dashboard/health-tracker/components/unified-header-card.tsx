'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, RefreshCw, TrendingUp, Footprints, Trophy, Sparkle } from 'lucide-react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration } from '@/lib/access-control'
import { calculateLevelProgress, UserBonus, CashbackLevel } from '@/types/database'

interface UnifiedHeaderCardProps {
  profile: Profile
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
  } | null
  onEditClick: () => void
  onRenewalClick: () => void
  onUpgradeClick: () => void
}

export function UnifiedHeaderCard({ 
  profile, 
  bonusStats, 
  onEditClick, 
  onRenewalClick, 
  onUpgradeClick 
}: UnifiedHeaderCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  
  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  const displayName = profile.full_name || 'Пользователь'
  const email = profile.email || ''
  const phone = profile.phone || ''
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-[650px] h-auto sm:h-[88px] bg-[#101016] rounded-xl border border-white/5 shadow-2xl flex flex-col sm:flex-row overflow-hidden relative group/card shrink-0"
    >
      {/* Global Bottom Highlight */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-20"></div>

      {/* Section 1: Profile */}
      <button 
        onClick={onEditClick}
        className="group/section relative flex-1 w-full sm:w-0 sm:h-full overflow-hidden transition-colors hover:bg-white/[0.02] text-left py-4 sm:py-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#151520] to-transparent opacity-50"></div>
        {/* Glow */}
        <div className="absolute -left-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover/section:bg-indigo-500/15 transition-all duration-500"></div>

        <div className="relative h-full flex items-center px-5 gap-3.5 z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0 self-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur opacity-0 group-hover/section:opacity-30 transition-opacity duration-500"></div>
            <div className="relative w-[48px] h-[48px] rounded-full p-[1.5px] bg-gradient-to-br from-[#2a2a35] via-[#2a2a35] to-[#3f3f50]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover border border-[#101016]" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#101016] flex items-center justify-center text-white font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Status Dot */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#101016] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full border border-[#101016]"></div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center min-w-0 gap-1">
            <h2 className="text-sm font-semibold text-white tracking-tight leading-none group-hover/section:text-indigo-200 transition-colors truncate">
              {displayName}
            </h2>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-slate-500 group-hover/section:text-slate-400 transition-colors">
                <span className="text-[11px] font-medium leading-none truncate tracking-wide">{email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-1 text-slate-600 group-hover/section:text-indigo-400/80 transition-colors mt-0.5">
                   <span className="text-[10px] font-medium leading-none tracking-wide">{phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Vertical Divider */}
      <div className="hidden sm:block w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent flex-shrink-0"></div>
      {/* Horizontal Divider (Mobile) */}
      <div className="sm:hidden w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent flex-shrink-0"></div>

      {/* Section 2: Subscription */}
      <div className="group/section relative flex-1 w-full sm:w-0 sm:h-full overflow-hidden transition-colors hover:bg-white/[0.02] py-4 sm:py-0">
        {/* Glow */}
        <div className="absolute top-0 right-10 w-16 h-16 bg-purple-600/5 rounded-full blur-2xl group-hover/section:bg-purple-600/10 transition-all duration-500"></div>

        <div className="relative h-full flex items-center justify-between px-5 z-10 w-full gap-2">
          {/* Plan Info */}
          <div className="flex flex-col justify-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="text-sm font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100 leading-none">
                {tierDisplayName}
              </span>
              <Crown className="w-3 h-3" />
            </div>

            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                <span className="text-slate-300 font-semibold tabular-nums mr-1">
                  {daysLeft !== null && daysLeft > 0 ? daysLeft : 0}
                </span>
                дней осталось
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Renew */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onRenewalClick()
              }}
              className="group/btn relative h-8 w-8 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer flex items-center justify-center" 
              aria-label="Renew"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" />
            </button>
            {/* Upgrade */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onUpgradeClick()
              }}
              className="group/btn relative h-8 w-8 rounded-lg bg-gradient-to-b from-purple-500/20 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 hover:from-purple-500/30 hover:to-purple-600/20 transition-all duration-200 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)] cursor-pointer flex items-center justify-center" 
              aria-label="Upgrade"
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-300 group-hover/btn:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="hidden sm:block w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent flex-shrink-0"></div>
      {/* Horizontal Divider (Mobile) */}
      <div className="sm:hidden w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent flex-shrink-0"></div>

      {/* Section 3: Rewards (Steps) */}
      <button 
        onClick={() => window.location.href = '/dashboard/bonuses'}
        className="group/section relative flex-1 w-full sm:w-0 sm:h-full overflow-hidden transition-all duration-500 hover:bg-[#1a1500]/30 text-left py-4 sm:py-0"
      >
        {/* Premium Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent"></div>
        
        {/* Animated Shine Effect */}
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/[0.03] via-transparent to-transparent"></div>
        
        {/* Glows */}
        <div className="absolute -bottom-10 -right-4 w-32 h-32 bg-amber-600/10 rounded-full blur-[40px] group-hover/section:bg-amber-600/20 transition-all duration-700"></div>
        
        {/* Decorative Sparkle Top Right */}
        <div className="absolute top-3 right-3 opacity-30 group-hover/section:opacity-60 transition-opacity duration-500">
             <Sparkle className="w-2.5 h-2.5 text-amber-200" />
        </div>

        <div className="relative h-full flex items-center justify-between px-5 z-10 w-full">
          {/* Left: Stats */}
          <div className="flex flex-col justify-center gap-0.5 z-20">
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/70">Шаги</span>
                <span className="flex h-1.5 w-1.5 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-100 to-amber-300 tabular-nums leading-none">
                    {bonusStats?.account.balance.toLocaleString('ru-RU') || 0}
                </span>
                <Footprints className="w-3.5 h-3.5 text-amber-400/80 -rotate-90" />
            </div>
          </div>

          {/* Right: Visual Tier Indicator */}
          <div className="flex flex-col items-end gap-1.5">
            {/* Badge */}
            <div className="relative overflow-hidden rounded-md bg-gradient-to-b from-amber-500/20 to-amber-600/10 border border-amber-500/20 shadow-[0_2px_10px_-2px_rgba(245,158,11,0.1)] group-hover/section:shadow-[0_2px_15px_-2px_rgba(245,158,11,0.2)] transition-all">
                {/* Shine element */}
                <motion.div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  style={{ skewX: -15 }}
                />
                
                <div className="px-2 py-1 flex items-center gap-1.5 relative z-20">
                    <Trophy className="w-2.5 h-2.5 text-amber-300" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold text-amber-100 tracking-wide uppercase leading-none">
                      {bonusStats?.levelData.name || 'Gold'}
                    </span>
                </div>
            </div>

            {/* Mini Progress */}
            <div className="flex items-center gap-1.5">
                <div className="w-12 h-1 bg-amber-950/50 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-yellow-300 transition-all duration-500" 
                      style={{ width: `${bonusStats?.progress.progress || 0}%` }}
                    ></div>
                </div>
                <span className="text-[9px] font-semibold text-amber-500/80 uppercase tracking-tight">
                  Lvl {bonusStats?.levelData.level || 1}
                </span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  )
}
