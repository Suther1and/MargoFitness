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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-fit h-[88px] bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] border border-white/10 flex items-center overflow-hidden relative group/card shadow-2xl px-6"
    >
      {/* Единый блок профиля */}
      <div className="flex items-center gap-5 min-w-0">
        {/* Аватар */}
        <button 
          onClick={onEditClick}
          className="relative shrink-0 group/avatar"
        >
          <div className="w-[52px] h-[52px] rounded-full p-[1.5px] bg-gradient-to-br from-amber-500/40 to-orange-600/40 group-hover/avatar:scale-105 transition-transform duration-500">
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
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#09090b] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        </button>

        {/* Информационный стек */}
        <div className="flex flex-col gap-1 min-w-0 pr-2">
          {/* Верхний ряд: Имя, Уровень и Кнопки */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onEditClick}
              className="font-oswald text-xl font-bold text-white uppercase tracking-tight leading-none truncate hover:text-amber-500 transition-colors"
            >
              {displayName}
            </button>
            
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 shrink-0">
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {tierDisplayName}
                </span>
              </div>

              {/* Мини-кнопки действий */}
              <div className="flex items-center gap-1 ml-0.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRenewalClick(); }}
                  className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 group/btn"
                  title="Продлить"
                >
                  <RefreshCw className="w-3 h-3 text-white/40 group-hover/btn:text-white group-hover/btn:rotate-180 transition-all duration-500" />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpgradeClick(); }}
                  className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center hover:bg-amber-400 transition-all active:scale-90 shadow-sm"
                  title="Улучшить"
                >
                  <TrendingUp className="w-3 h-3 text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Нижний ряд: Контакты и Статус */}
          <div className="flex items-center gap-4 text-white/30">
            <div className="flex items-center gap-1.5 min-w-0">
              <Mail className="w-3 h-3 text-amber-500/30 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-[130px] tracking-wide">{email}</span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <Phone className="w-3 h-3 text-amber-500/30 shrink-0" />
              <span className="text-[10px] font-medium tracking-wide">{phone}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-amber-500/60 ml-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {daysLeft !== null ? daysLeft : 0} дн.
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
