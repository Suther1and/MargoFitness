'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, RefreshCw, TrendingUp, Mail, Phone, Clock, User, Pencil } from 'lucide-react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration } from '@/lib/access-control'
import { cn } from '@/lib/utils'

interface UnifiedHeaderCardProps {
  profile: Profile
  onEditClick: () => void
  onRenewalClick: () => void
  onUpgradeClick: () => void
  onSubscriptionClick?: () => void
}

export function UnifiedHeaderCard({ 
  profile, 
  onEditClick, 
  onRenewalClick, 
  onUpgradeClick,
  onSubscriptionClick
}: UnifiedHeaderCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  
  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

  const displayName = profile.full_name || 'Пользователь'
  const email = profile.email || 'Почта не указана'
  const phone = profile.phone || 'Номер не указан'
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const isFree = profile.subscription_tier === 'free'

  // Получаем стили в зависимости от уровня подписки
  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          gradient: 'from-amber-400/40 to-amber-600/40',
          shadow: 'shadow-amber-500/20',
          icon: 'text-amber-500'
        }
      case 'pro':
        return {
          text: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          gradient: 'from-purple-400/40 to-purple-600/40',
          shadow: 'shadow-purple-500/20',
          icon: 'text-purple-500'
        }
      case 'basic':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          gradient: 'from-orange-400/40 to-orange-600/40',
          shadow: 'shadow-orange-500/20',
          icon: 'text-orange-500'
        }
      default: // free
        return {
          text: 'text-white/40',
          bg: 'bg-white/5',
          border: 'border-white/10',
          gradient: 'from-white/20 to-white/10',
          shadow: 'shadow-white/5',
          icon: 'text-white/40'
        }
    }
  }

  const styles = getTierStyles(profile.subscription_tier)

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-fit h-[88px] bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center shadow-2xl px-7 relative group/card transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/5 hover:bg-white/[0.05] overflow-hidden"
    >
      {/* Мягкий фоновый градиент для глубины */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-transparent pointer-events-none rounded-[2.5rem]" />
      
      {/* Свечение при наведении */}
      <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent blur-sm" />
      </div>

      {/* 1. Аватар */}
      <button 
        onClick={onEditClick}
        className="relative shrink-0 group/avatar mr-6"
      >
        <div className={cn(
          "w-[60px] h-[60px] rounded-full p-[1.5px] bg-gradient-to-br transition-all duration-500",
          styles.gradient
        )}>
          <div className="w-full h-full rounded-full bg-[#09090b] p-0.5 overflow-hidden relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-full transition-all duration-500 group-hover/avatar:blur-[2px]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 bg-white/5 transition-all duration-500 group-hover/avatar:blur-[2px]">
                <User className="w-7 h-7" />
              </div>
            )}
            
            {/* Оверлей редактирования */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 bg-black/20">
              <Pencil className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
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
          
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onSubscriptionClick?.();
            }}
            animate={{ 
              boxShadow: ["0 0 0px rgba(245,158,11,0)", `0 0 12px ${styles.text === 'text-white/40' ? 'rgba(255,255,255,0.1)' : styles.text.replace('text-', 'rgba(').replace('-400', ',0.2)')}`, "0 0 0px rgba(245,158,11,0)"]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg border flex items-center gap-2 shrink-0 relative overflow-hidden group/badge transition-colors cursor-pointer",
              styles.bg,
              styles.border,
              "hover:bg-white/10"
            )}
          >
            {/* Анимированный блик на бейдже */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            />
            
            <Crown className={cn("w-3.5 h-3.5 relative z-10", styles.icon)} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none relative z-10", styles.text)}>
              {tierDisplayName}
            </span>
          </motion.button>
        </div>
        
        {/* Уровень 2: Статус дней (под именем) */}
        <div className={cn(
          "flex items-center gap-1.5",
          daysLeft !== null && daysLeft < 10 ? "text-red-500" : (isFree ? "text-white/30" : "text-amber-500/80")
        )}>
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
            {isFree ? "Доступ ограничен" : (daysLeft !== null ? `${daysLeft} дней осталось` : "Срок не определен")}
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
      <div className="flex items-center gap-2 ml-5 pl-5 border-l border-white/5 h-10">
        {isFree ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onSubscriptionClick?.(); }}
            className="h-9 px-4 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 whitespace-nowrap"
          >
            Выбрать подписку
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </motion.div>
  )
}
