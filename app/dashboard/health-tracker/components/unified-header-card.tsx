'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, RefreshCw, TrendingUp, Mail, Phone, Calendar, User, ShieldCheck } from 'lucide-react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration } from '@/lib/access-control'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface UnifiedHeaderCardProps {
  profile: Profile
  onEditClick: () => void
  onRenewalClick: () => void
  onUpgradeClick: () => void
}

export function UnifiedHeaderCard({ 
  profile, 
  onEditClick, 
  onRenewalClick, 
  onUpgradeClick 
}: UnifiedHeaderCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  
  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  const displayName = profile.full_name || 'Пользователь'
  const email = profile.email || 'Почта не указана'
  const phone = profile.phone || 'Номер не указан'
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const registrationDate = profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy', { locale: ru }) : ''

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full lg:w-[940px] h-[88px] bg-[#121214]/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 flex items-center overflow-hidden relative group/card shadow-2xl"
    >
      {/* Мягкий акцент на фоне */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] via-transparent to-amber-500/[0.02] pointer-events-none" />

      {/* ЛЕВАЯ СЕКЦИЯ: ПРОФИЛЬ (50%) */}
      <button 
        onClick={onEditClick}
        className="w-1/2 h-full flex items-center px-6 gap-4 hover:bg-white/[0.02] transition-all group/profile text-left border-r border-white/10"
      >
        <div className="relative shrink-0">
          <div className="w-[52px] h-[52px] rounded-full p-[1.5px] bg-gradient-to-br from-amber-500/50 to-orange-600/50 group-hover/profile:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-full bg-[#09090b] p-0.5 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 bg-white/5">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#121214] rounded-full flex items-center justify-center border-2 border-[#121214]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        <div className="flex items-center gap-6 min-w-0 flex-1">
          {/* Имя и регистрация */}
          <div className="flex flex-col min-w-0 shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="font-oswald text-lg font-bold text-white uppercase tracking-tight leading-none truncate group-hover/profile:text-amber-500 transition-colors">
                {displayName}
              </h2>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500/60" />
            </div>
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap">
              С {registrationDate}
            </div>
          </div>

          {/* Контакты (справа от имени) */}
          <div className="flex flex-col gap-1.5 min-w-0 border-l border-white/5 pl-6">
            <div className="flex items-center gap-2 text-white/40 group-hover/profile:text-white/60 transition-colors">
              <Mail className="w-3 h-3 text-amber-500/50 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-[140px] tracking-wide">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 group-hover/profile:text-white/60 transition-colors">
              <Phone className="w-3 h-3 text-amber-500/50 shrink-0" />
              <span className="text-[10px] font-medium tracking-wide whitespace-nowrap">{phone}</span>
            </div>
          </div>
        </div>
      </button>

      {/* ПРАВАЯ СЕКЦИЯ: ПОДПИСКА (50%) */}
      <div className="w-1/2 h-full flex items-center px-6 justify-between bg-white/[0.01]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 hover:bg-amber-500/20 transition-all">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">
                {tierDisplayName}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 ml-1">
            <span className="text-2xl font-oswald font-bold text-white tabular-nums leading-none">
              {daysLeft !== null ? daysLeft : 0}
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">
              дней осталось
            </span>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={(e) => { e.stopPropagation(); onRenewalClick(); }}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group/btn"
            title="Продлить"
          >
            <RefreshCw className="w-4 h-4 text-white/40 group-hover/btn:text-white group-hover/btn:rotate-180 transition-all duration-500" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onUpgradeClick(); }}
            className="h-10 px-5 rounded-xl bg-amber-500 text-black flex items-center gap-2.5 hover:bg-amber-400 transition-all active:scale-95 group/up font-black shadow-lg shadow-amber-500/10"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-wider">Улучшить</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
