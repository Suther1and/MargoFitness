'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, RefreshCw, TrendingUp, Mail, Phone, Clock, User } from 'lucide-react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration } from '@/lib/access-control'

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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-fit h-[88px] bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center shadow-2xl px-7 gap-6 relative group/card"
    >
      {/* Мягкий фоновый градиент для глубины */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-transparent pointer-events-none" />

      {/* 1. Аватар */}
      <button 
        onClick={onEditClick}
        className="relative shrink-0 group/avatar"
      >
        <div className="w-[60px] h-[60px] rounded-full p-[1.5px] bg-gradient-to-br from-amber-500/40 to-orange-600/40 group-hover/avatar:scale-105 transition-transform duration-500">
          <div className="w-full h-full rounded-full bg-[#09090b] p-0.5 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 bg-white/5">
                <User className="w-7 h-7" />
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#0c0c12] rounded-full flex items-center justify-center border-2 border-[#0c0c12]">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
        </div>
      </button>

      {/* 2. Инфо-блок (3 уровня) */}
      <div className="flex flex-col justify-between h-[66px] min-w-0">
        {/* Уровень 1: Имя + Бейдж */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onEditClick}
            className="font-oswald text-2xl font-bold text-white uppercase tracking-tight leading-none truncate hover:text-amber-500 transition-colors text-left"
          >
            {displayName}
          </button>
          
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 shrink-0">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
              {tierDisplayName}
            </span>
          </div>
        </div>
        
        {/* Уровень 2: Статус дней (под именем) */}
        <div className="flex items-center gap-1.5 text-amber-500/80">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
            {daysLeft !== null ? daysLeft : 0} дней осталось
          </span>
        </div>

        {/* Уровень 3: Контакты */}
        <div className="flex items-center gap-3 text-white/25">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="w-2.5 h-2.5 text-amber-500/20 shrink-0" />
            <span className="text-[10px] font-medium truncate max-w-[120px] tracking-wide">{email}</span>
          </div>
          
          <div className="w-1 h-1 rounded-full bg-white/5 shrink-0" />
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Phone className="w-2.5 h-2.5 text-amber-500/20 shrink-0" />
            <span className="text-[10px] font-medium tracking-wide">{phone}</span>
          </div>
        </div>
      </div>

      {/* 3. Кнопки действий */}
      <div className="flex items-center gap-2 ml-4 pl-6 border-l border-white/5 h-10">
        <button 
          onClick={(e) => { e.stopPropagation(); onRenewalClick(); }}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 group/btn"
          title="Продлить"
        >
          <RefreshCw className="w-4 h-4 text-white/40 group-hover/btn:text-white group-hover/btn:rotate-180 transition-all duration-500" />
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onUpgradeClick(); }}
          className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center hover:bg-amber-400 transition-all active:scale-90 shadow-lg shadow-amber-500/10 group/up"
          title="Улучшить"
        >
          <TrendingUp className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}
