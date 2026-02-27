'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, RefreshCw, TrendingUp, Mail, Phone, Clock, User, Pencil, Snowflake } from 'lucide-react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'
import { cn } from '@/lib/utils'

interface UnifiedHeaderCardProps {
  profile: Profile
  onEditClick: () => void
  onRenewalClick: () => void
  onUpgradeClick: () => void
  onSubscriptionClick?: () => void
  onFreezeClick?: () => void
}

export function UnifiedHeaderCard({ 
  profile, 
  onEditClick, 
  onRenewalClick, 
  onUpgradeClick,
  onSubscriptionClick,
  onFreezeClick
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
  const isExpired = !isFree && !isSubscriptionActive(profile)

  // Получаем стили в зависимости от уровня подписки
  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          gradient: 'from-yellow-300/40 to-yellow-500/40',
          shadow: 'shadow-yellow-500/20',
          icon: 'text-yellow-500',
          hoverBorder: 'hover:border-yellow-400/30',
          hoverShadow: 'hover:shadow-yellow-500/15',
          hoverBg: 'hover:bg-yellow-500/[0.05]',
          accentIcon: 'text-yellow-500/40',
          upgradeBtn: 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20',
          nameHover: 'hover:text-yellow-400'
        }
      case 'pro':
        return {
          text: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          gradient: 'from-purple-400/40 to-purple-600/40',
          shadow: 'shadow-purple-500/20',
          icon: 'text-purple-500',
          hoverBorder: 'hover:border-purple-500/30',
          hoverShadow: 'hover:shadow-purple-500/10',
          hoverBg: 'hover:bg-purple-500/[0.05]',
          accentIcon: 'text-purple-500/40',
          upgradeBtn: 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20',
          nameHover: 'hover:text-purple-400'
        }
      case 'basic':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          gradient: 'from-orange-400/40 to-orange-600/40',
          shadow: 'shadow-orange-500/20',
          icon: 'text-orange-500',
          hoverBorder: 'hover:border-amber-500/30', // Как было (бронзовый/amber)
          hoverShadow: 'hover:shadow-amber-500/5',
          hoverBg: 'hover:bg-white/[0.05]',
          accentIcon: 'text-orange-500/40',
          upgradeBtn: 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/10',
          nameHover: 'hover:text-amber-500'
        }
      default: // free
        return {
          text: 'text-white/40',
          bg: 'bg-white/5',
          border: 'border-white/10',
          gradient: 'from-white/20 to-white/10',
          shadow: 'shadow-white/5',
          icon: 'text-white/40',
          hoverBorder: 'hover:border-white/20',
          hoverShadow: 'hover:shadow-white/5',
          hoverBg: 'hover:bg-white/[0.02]',
          accentIcon: 'text-white/10',
          upgradeBtn: 'bg-white/10 hover:bg-white/20 text-white shadow-white/5',
          nameHover: 'hover:text-white/60'
        }
    }
  }

  // При заморозке — ледяные стили
  const frozenStyles = {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    gradient: 'from-cyan-400/40 to-blue-500/40',
    shadow: 'shadow-cyan-500/20',
    icon: 'text-cyan-500',
    hoverBorder: 'hover:border-cyan-400/30',
    hoverShadow: 'hover:shadow-cyan-500/15',
    hoverBg: 'hover:bg-cyan-500/[0.05]',
    accentIcon: 'text-cyan-500/40',
    upgradeBtn: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-white shadow-cyan-500/20',
    nameHover: 'hover:text-cyan-400'
  }

  // Внешний контейнер — серый при expired, ледяной при заморозке, цветной при активной
  const styles = profile.is_frozen ? frozenStyles : getTierStyles(isExpired ? 'free' : profile.subscription_tier)
  // Внутренняя пилюля тарифа — всегда цвет реального тарифа, чтобы пользователь видел что потерял
  // Но при заморозке она тоже должна быть синей (ледяной)
  const badgeStyles = profile.is_frozen ? frozenStyles : getTierStyles(profile.subscription_tier)

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "w-fit h-[88px] bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border flex items-center shadow-2xl px-7 relative group/card transition-all duration-300 overflow-hidden",
        styles.border,
        styles.hoverBorder,
        styles.hoverShadow,
        styles.hoverBg
      )}
    >
      {/* Мягкий фоновый градиент для глубины */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-transparent to-transparent pointer-events-none rounded-[2.5rem]",
        profile.is_frozen ? "from-cyan-500/[0.03]" :
        profile.subscription_tier === 'elite' ? "from-amber-500/[0.02]" : 
        profile.subscription_tier === 'pro' ? "from-purple-500/[0.02]" : 
        profile.subscription_tier === 'basic' ? "from-orange-500/[0.02]" : ""
      )} />
      
      {/* Свечение при наведении */}
      <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={cn(
          "absolute inset-0 rounded-[2.5rem] blur-sm bg-gradient-to-r from-transparent via-transparent to-transparent",
          profile.subscription_tier === 'elite' ? "from-yellow-400/25 via-yellow-500/10" : 
          profile.subscription_tier === 'pro' ? "from-purple-500/20 via-indigo-500/10" : 
          profile.subscription_tier === 'basic' ? "from-amber-500/20 via-orange-500/10" : "from-white/10"
        )} />
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
            className={cn(
              "font-oswald text-2xl font-bold text-white uppercase tracking-tight leading-none truncate transition-colors text-left",
              styles.nameHover
            )}
          >
            {displayName}
          </button>
          
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onSubscriptionClick?.();
            }}
            animate={isExpired ? {} : { 
              boxShadow: ["0 0 0px rgba(0,0,0,0)", `0 0 12px ${badgeStyles.text === 'text-white/40' ? 'rgba(255,255,255,0.1)' : badgeStyles.text.replace('text-', 'rgba(').replace('-400', ',0.2)')}`, "0 0 0px rgba(0,0,0,0)"]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg border flex items-center gap-2 shrink-0 relative overflow-hidden group/badge transition-colors cursor-pointer",
              badgeStyles.bg,
              badgeStyles.border,
              isExpired ? "opacity-60" : "",
              "hover:opacity-100"
            )}
          >
            {/* Анимированный блик — только для активных подписок */}
            {!isExpired && (
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              />
            )}
            
            <Crown className={cn("w-3.5 h-3.5 relative z-10", badgeStyles.icon)} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none relative z-10", badgeStyles.text)}>
              {isExpired ? `${tierDisplayName} · Истекла` : tierDisplayName}
            </span>
          </motion.button>
        </div>
        
        {/* Уровень 2: Статус дней (под именем) */}
        <div className={cn(
          "flex items-center gap-1.5 transition-colors duration-300",
          profile.is_frozen ? "text-cyan-400" :
          isExpired ? "text-red-500/60" : daysLeft !== null && daysLeft < 10 ? "text-red-500" : (isFree ? "text-white/30" : styles.text)
        )}>
          {profile.is_frozen ? <Snowflake className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
            {profile.is_frozen ? `${daysLeft} дней · На паузе` :
              isExpired ? "0 дней" : isFree ? "Подписка не активна" : (daysLeft !== null ? `${daysLeft} дней осталось` : "Срок не определен")}
          </span>
        </div>

        {/* Уровень 3: Контакты */}
        <div className="flex items-center gap-3 text-white/25">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className={cn("w-2.5 h-2.5 shrink-0 transition-colors", styles.accentIcon)} />
            <span className="text-[10px] font-medium truncate max-w-[120px] tracking-wide">{email}</span>
          </div>
          
          <div className="w-1 h-1 rounded-full bg-white/5 shrink-0" />
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Phone className={cn("w-2.5 h-2.5 shrink-0 transition-colors", styles.accentIcon)} />
            <span className="text-[10px] font-medium tracking-wide">{phone}</span>
          </div>
        </div>
      </div>

      {/* 3. Кнопки действий */}
      <div className="flex items-center gap-2 ml-5 pl-5 border-l border-white/5 h-10">
        {profile.is_frozen ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onFreezeClick?.(); }}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-cyan-500/20 whitespace-nowrap"
          >
            <Snowflake className="w-3.5 h-3.5" />
            Заморозка
          </button>
        ) : isFree || isExpired ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onRenewalClick(); }}
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
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg group/up",
                styles.upgradeBtn
              )}
              title="Улучшить"
            >
              <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
