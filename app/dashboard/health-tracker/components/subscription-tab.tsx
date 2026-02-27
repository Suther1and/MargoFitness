'use client'

import { useState, useEffect, useMemo } from 'react'
import { Profile, Article } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive, getEffectiveTier } from '@/lib/access-control'
import { Check, Settings, FileText, Verified, Sparkles, Star, History, Crown, ArrowRight, BookOpen, ChevronDown, Receipt, HelpCircle, Snowflake, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { HABIT_LIMITS, WIDGET_LIMITS, SUBSCRIPTION_PLANS } from '@/lib/constants/subscriptions'
import { getArticles } from '@/lib/actions/articles'
import { getArticleStats, getCachedArticleStats } from '@/lib/actions/admin-articles'

interface SubscriptionTabProps {
  profile: Profile
  onRenewalClick: () => void
  onUpgradeClick: () => void
  onFreezeClick?: () => void
  initialArticleStats?: any
}

const TIER_INFO = [
  { 
    id: 'free', 
    name: 'Free', 
    price: '0₽', 
    period: 'навсегда',
    color: 'from-gray-500/10 to-gray-600/10',
    borderColor: 'border-white/10',
    buttonStyle: 'bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]',
    buttonText: 'Твоя подписка лучше!',
    planKey: 'FREE',
    styles: {
      card: 'linear-gradient(165deg, #171717 0%, #0a0a0a 40%, #000000 100%)',
      pattern: 'rgba(255, 255, 255, 0.03)',
      accent: 'text-white/60',
      border: 'rgba(255, 255, 255, 0.1)',
      badge: 'bg-white/5 border-white/10 text-white/40',
      status: 'text-white/40',
    }
  },
  { 
    id: 'basic', 
    name: 'Basic', 
    price: 'от 3400₽', 
    period: 'в месяц',
    color: 'from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/20',
    buttonStyle: 'bg-gradient-to-b from-orange-50 to-orange-100 text-orange-950 hover:from-white hover:to-orange-50 shadow-xl shadow-orange-500/10',
    buttonText: 'Улучшить',
    planKey: 'BASIC',
    styles: {
      card: 'linear-gradient(165deg, #2a1f18 0%, #1c130e 40%, #0f0805 100%)',
      pattern: 'rgba(217, 119, 6, 0.1)',
      accent: 'text-orange-400',
      border: 'rgba(251, 146, 60, 0.4)',
      badge: 'bg-[#2d1a0a]/90 border-white/10 text-orange-50',
      status: 'text-orange-300',
    }
  },
  { 
    id: 'pro', 
    name: 'Pro', 
    price: 'от 4250₽', 
    period: 'в месяц',
    color: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/40',
    buttonStyle: 'bg-gradient-to-b from-purple-50 to-purple-100 text-purple-950 hover:from-white hover:to-purple-50 shadow-xl shadow-purple-500/10',
    buttonText: 'Улучшить',
    isPopular: true,
    planKey: 'PRO',
    styles: {
      card: 'linear-gradient(165deg, #1a162a 0%, #0f0e1a 40%, #08070f 100%)',
      pattern: 'rgba(168, 85, 247, 0.1)',
      accent: 'text-purple-400',
      border: 'rgba(168, 85, 247, 0.4)',
      badge: 'bg-purple-950/90 border-white/10 text-purple-50',
      status: 'text-purple-300',
    }
  },
  { 
    id: 'elite', 
    name: 'Elite', 
    price: 'от 8500₽', 
    period: 'в месяц',
    color: 'from-yellow-500/10 to-amber-500/10',
    borderColor: 'border-yellow-500/20',
    buttonStyle: 'bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-950 hover:from-white hover:to-yellow-50 shadow-xl shadow-yellow-500/10',
    buttonText: 'Улучшить',
    planKey: 'ELITE',
    styles: {
      card: 'linear-gradient(165deg, #2a2110 0%, #17140c 40%, #090805 100%)',
      pattern: 'rgba(234, 179, 8, 0.1)',
      accent: 'text-yellow-400',
      border: 'rgba(234, 179, 8, 0.4)',
      badge: 'bg-amber-950/90 border-white/10 text-amber-50',
      status: 'text-yellow-300',
    }
  },
]

const MOCK_PURCHASES = [
  { id: 1, plan: 'Elite', date: '12 Октября 2023', amount: 8500, status: 'Оплачено' },
  { id: 2, plan: 'Pro', date: '12 Сентября 2023', amount: 4250, status: 'Оплачено' },
  { id: 3, plan: 'Basic', date: '12 Августа 2023', amount: 3400, status: 'Оплачено' },
]

const FAQ_ITEMS = [
  {
    question: "Как отменить подписку?",
    answer: "Вы можете отменить автопродление в любой момент в настройках профиля. Доступ ко всем функциям сохранится до конца оплаченного периода."
  },
  {
    question: "Как работает заморозка подписки?",
    answer: "Количество заморозок и дней зависит от тарифа и срока подписки. Во время заморозки срок подписки не расходуется, но доступен только контент уровня Free. Заморозка снимается вручную или автоматически, когда дни закончатся."
  },
  {
    question: "Как работает возврат средств?",
    answer: "Возврат возможен в течение первых 14 дней после оплаты, если вы не использовали платные функции более 2-х раз."
  },
  {
    question: "Что будет с данными после отмены?",
    answer: "Ваши данные (привычки, тренировки) надежно сохранятся. Вы просто потеряете доступ к премиум-функциям до следующей оплаты."
  }
]

export function SubscriptionTab({ profile, onRenewalClick, onUpgradeClick, onFreezeClick, initialArticleStats }: SubscriptionTabProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [articleStats, setArticleStats] = useState<any>(initialArticleStats || null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const subscriptionActive = isSubscriptionActive(profile)
  const effectiveTier = getEffectiveTier(profile)

  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
    
    // Всегда запускаем анимацию с задержкой при монтировании компонента
    const timer = setTimeout(() => setIsDataLoaded(true), 150)

    // Если статистики нет, загружаем её
    if (!articleStats) {
      const loadStats = async () => {
        const { data } = await getCachedArticleStats()
        if (data) setArticleStats(data)
      }
      loadStats()
    }

    return () => clearTimeout(timer)
  }, [profile, initialArticleStats])

  // Константы для лимитов (Hardcode по ТЗ)
  const WORKOUT_LIMITS = { free: 0, basic: 2, pro: 3, elite: 3 }
  const HABITS_HARDCODE = { free: 1, basic: 6, pro: 10, elite: 15 }
  const WIDGETS_HARDCODE = { free: 1, basic: 6, pro: 8, elite: 8 }

  const TIER_COLORS = {
    free: '#d4d4d4',
    basic: '#fb923c',
    pro: '#a855f7',
    elite: '#eab308'
  }

  const TIER_ORDER = ['free', 'basic', 'pro', 'elite']

  // Хелпер для отрисовки индикаторов уровней
  const renderLevelIndicators = (currentTier: string, limits: Record<string, number>, max: number, category?: 'workouts' | 'widgets' | 'habits' | 'articles') => {
    const currentIndex = TIER_ORDER.indexOf(currentTier)
    
    // Определяем, какой уровень является "финальным" для данной категории
    let finalTier = 'elite'
    if (category === 'workouts' || category === 'widgets') {
      finalTier = 'pro'
    }

    return TIER_ORDER.map((tier, index) => {
      // Пропускаем free (всегда в начале) и уровни ниже или равные текущему
      if (tier === 'free' || index <= currentIndex) return null
      
      // Если текущий уровень уже финальный или выше финального для этой категории, ничего не рисуем
      const finalIndex = TIER_ORDER.indexOf(finalTier)
      if (index > finalIndex) return null

      const position = (limits[tier as keyof typeof limits] / max) * 100
      const color = TIER_COLORS[tier as keyof typeof TIER_COLORS]

      if (tier === finalTier) {
        // Для финального уровня закрашиваем кончик полосы
        return (
          <div 
            key={tier}
            className="absolute top-0 bottom-0 right-0 w-1 z-20 rounded-r-full"
            style={{ backgroundColor: color }}
          />
        )
      }

      // Для промежуточных уровней рисуем шарики
      return (
        <div 
          key={tier}
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20"
          style={{ 
            left: `calc(${position}% - 4px)`,
          }}
        >
          <div 
            className="w-2 h-2 rounded-full border border-black/20"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}66`
            }}
          />
          <span 
            className="absolute top-full mt-1 text-[7px] font-black font-montserrat opacity-40 leading-none"
            style={{ color: color }}
          >
            {limits[tier as keyof typeof limits]}
          </span>
        </div>
      )
    })
  }

  // Получаем эффективный тир для отображения прогресс-бара
  const currentTierForProgress = useMemo(() => {
    return getEffectiveTier(profile);
  }, [profile]);

  // Расчет доступных статей на основе данных из админки
  const articleProgress = useMemo(() => {
    if (!articleStats) return { current: 0, total: 0, limits: { free: 0, basic: 0, pro: 0, elite: 0 } };

    const total = articleStats.total || 0;
    const free = articleStats.freeCount || 0;
    const basic = free + (articleStats.basicCount || 0);
    const pro = basic + (articleStats.proCount || 0);
    const elite = total;

    let current = 0;

    // Логика накопления доступа (аналогично админке)
    switch (currentTierForProgress) {
      case 'free':
        current = free;
        break;
      case 'basic':
        current = basic;
        break;
      case 'pro':
        current = pro;
        break;
      case 'elite':
        current = elite;
        break;
    }

    return { 
      current, 
      total, 
      limits: { free, basic, pro, elite } 
    };
  }, [articleStats, currentTierForProgress]);

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
      default:
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

  const frozenStyles = {
    card: 'linear-gradient(165deg, #0f1a2a 0%, #0a1220 40%, #050a14 100%)',
    pattern: 'rgba(34, 211, 238, 0.08)',
    accent: 'text-cyan-400',
    border: 'rgba(34, 211, 238, 0.3)',
    badge: 'bg-cyan-950/90 border-cyan-500/20 text-cyan-50',
    badgeDot: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]',
    glow: 'bg-cyan-500/10',
    shimmer: 'rgba(34, 211, 238, 0.06)',
    status: 'text-cyan-300',
    btnPrimary: 'from-cyan-50 to-cyan-100 text-cyan-950 hover:from-white hover:to-cyan-50',
    btnPrimaryIcon: 'text-cyan-800'
  }

  const subStyles = profile.is_frozen ? frozenStyles : getSubscriptionStyles(profile.subscription_tier)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
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
          border-radius: 2rem;
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
      `}</style>

      {/* TOP SECTION: Current Subscription & Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Plan Card */}
        <div className="lg:col-span-5 sub-card rounded-[2rem] p-6 flex flex-col justify-between min-h-[220px]">
          <div className="sub-pattern"></div>
          <div className="sub-shine"></div>
          
              {/* Frozen top badge (for active freeze) */}
          {profile.is_frozen && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onFreezeClick) onFreezeClick();
              }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black rounded-b-xl uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 z-20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Snowflake className="w-3 h-3" />
              Заморожена
            </button>
          )}

          {/* Freeze Action Badge (Interactive) */}
          {!profile.is_frozen && subscriptionActive && profile.subscription_tier !== 'free' && onFreezeClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFreezeClick();
              }}
              className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[9px] font-black rounded-b-xl uppercase tracking-[0.2em] shadow-lg z-20 flex items-center gap-1.5 transition-all active:scale-95 font-montserrat",
                profile.subscription_tier === 'basic' ? "bg-orange-50 text-orange-950 shadow-orange-500/10" :
                profile.subscription_tier === 'pro' ? "bg-purple-50 text-purple-950 shadow-purple-500/10" :
                profile.subscription_tier === 'elite' ? "bg-yellow-50 text-yellow-950 shadow-yellow-500/10" :
                "bg-white text-black"
              )}
            >
              <Snowflake className="w-3 h-3" />
              Заморозка
            </button>
          )}

          {/* Decorative Ambient Orbs */}
          <div className={cn("absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-3xl", subStyles.glow)}></div>
          <div className={cn("absolute -left-10 bottom-0 w-40 h-40 rounded-full pointer-events-none opacity-10 blur-2xl", subStyles.glow)}></div>

          <div className="relative z-10 flex flex-col h-full gap-4">
            {/* Card Top: Title & Badge */}
            <div className="flex justify-between items-start pt-4">
              <div className="flex items-center gap-2.5">
                <div className={cn("p-1.5 rounded-lg bg-black/60 border border-white/5 shadow-sm")}>
                  <Crown className={cn("w-4 h-4 opacity-80", subStyles.status)} />
                </div>
                <div>
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-60 font-montserrat block mb-0.5", subStyles.status)}>Подписка</span>
                  <p className="text-white text-2xl font-black font-oswald uppercase tracking-tight leading-none">
                    {tierDisplayName}
                  </p>
                </div>
              </div>
              
              {/* Status badge & Freeze Button */}
              <div className="flex flex-col items-end gap-2">
                {(profile.is_frozen || (!subscriptionActive && profile.subscription_tier !== 'free')) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (profile.is_frozen && onFreezeClick) {
                        onFreezeClick();
                      }
                    }}
                    className={cn(
                    "relative overflow-hidden border rounded-lg px-2.5 h-6 flex items-center justify-center bg-black/40",
                    profile.is_frozen
                      ? "border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                      : "border-white/10 bg-white/5"
                  )}>
                    <span className={cn(
                      "text-[9px] font-black tracking-[0.1em] relative z-10 uppercase font-montserrat leading-none",
                      profile.is_frozen ? "text-cyan-300" : "text-white/30"
                    )}>
                      {profile.is_frozen ? 'Заморожена' : `${tierDisplayName} · Истекла`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Card Body: Stats (Left) & Actions (Right) */}
            <div className={cn("flex justify-between gap-4 mt-auto", subscriptionActive ? "items-end" : "items-end")}>
              
              {/* Left: Status & Duration */}
              <div className="flex flex-col gap-1">
                {/* Status */}
                <div className="flex items-center gap-2 opacity-80">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75", 
                      profile.is_frozen ? "bg-cyan-400/50" :
                      subscriptionActive ? "animate-ping " + subStyles.badgeDot : "bg-red-500/50"
                    )}></span>
                    <span className={cn(
                      "relative inline-flex rounded-full h-1.5 w-1.5", 
                      profile.is_frozen ? "bg-cyan-400" :
                      subscriptionActive ? subStyles.badgeDot : "bg-red-500"
                    )}></span>
                  </span>
                  <span className={cn("text-[11px] font-black tracking-[0.15em] uppercase font-montserrat", 
                    profile.is_frozen ? "text-cyan-300" : subStyles.status
                  )}>
                    {profile.is_frozen ? 'На паузе' : subscriptionActive ? 'Активна' : 'Неактивна'}
                  </span>
                  {subscriptionActive && !profile.is_frozen && profile.subscription_expires_at && (
                    <span className="text-[10px] text-white/40 font-bold font-montserrat lowercase">
                      до {format(new Date(profile.subscription_expires_at), 'd MMMM', { locale: ru })}
                    </span>
                  )}
                </div>

                {/* Days Count or Inactive Message */}
                {subscriptionActive ? (
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-2xl leading-none font-oswald">
                      {daysLeft || 0}
                    </span>
                    <div className="flex flex-col pb-1">
                      <span className="text-[10px] text-white/40 font-black leading-none uppercase font-montserrat">
                        {(() => {
                          const lastDigit = (daysLeft || 0) % 10
                          const lastTwoDigits = (daysLeft || 0) % 100
                          if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней'
                          if (lastDigit === 1) return 'день'
                          if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
                          return 'дней'
                        })()}
                      </span>
                      <span className="text-[8px] text-white/20 font-black leading-none mt-1 uppercase font-montserrat tracking-widest">осталось</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 pt-2 pb-1">
                    <span className="text-2xl font-black text-white/60 uppercase font-oswald leading-none tracking-tight">
                      Подписка
                    </span>
                    <span className="text-lg font-bold text-white/30 uppercase font-oswald leading-none tracking-tight">
                      не активна
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Stacked */}
              <div className="flex flex-col gap-2 w-[130px]">
                {subscriptionActive ? (
                  <>
                    {/* Upgrade Button (Primary) */}
                    <button 
                      onClick={onUpgradeClick}
                      className={cn(
                        "relative bg-gradient-to-b border border-transparent text-[10px] font-black uppercase tracking-[0.15em] h-8 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xl active:scale-95 group/btn font-montserrat",
                        subStyles.btnPrimary
                      )}
                    >
                      <Sparkles className={cn("w-3 h-3", subStyles.btnPrimaryIcon)} />
                      <span>Улучшить</span>
                    </button>

                    {/* Renew Button (Secondary) */}
                    <button 
                      onClick={onRenewalClick}
                      className="relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] h-8 px-3 rounded-xl flex items-center justify-center gap-2 transition-all group/btn2 active:scale-95 font-montserrat"
                    >
                      <History className="w-3 h-3 text-white/20 group-hover/btn2:text-white/60 transition-colors" />
                      <span>Продлить</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={onUpgradeClick}
                    className={cn(
                      "relative bg-gradient-to-b border border-transparent text-[10px] font-black uppercase tracking-[0.15em] h-10 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-2xl active:scale-95 group/btn font-montserrat",
                      subStyles.btnPrimary
                    )}
                  >
                    <ArrowRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", subStyles.btnPrimaryIcon)} />
                    <span>Выбрать</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage Card */}
        <div className="lg:col-span-7 flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-6 pb-3 shadow-sm relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] font-montserrat">Доступные ресурсы</h3>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black font-montserrat">Актуально</span>
          </div>
          
          <div className="space-y-2 relative z-10">
            {/* Workouts */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest font-montserrat">
                <span className="text-white/40">Тренировки</span>
                <span className="text-white">
                  {WORKOUT_LIMITS[currentTierForProgress as keyof typeof WORKOUT_LIMITS] || 0} / 3
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 relative">
                {/* Active Bar */}
                <div 
                  className={cn(
                    "absolute inset-0 h-full transition-all duration-1000 ease-out rounded-full z-10",
                    !isDataLoaded ? "w-0" : ""
                  )} 
                  style={{ 
                    width: isDataLoaded ? `${(WORKOUT_LIMITS[currentTierForProgress as keyof typeof WORKOUT_LIMITS] || 0) / 3 * 100}%` : '0%',
                    backgroundColor: currentTierForProgress === 'basic' ? '#fb923c' : 
                                     currentTierForProgress === 'pro' ? '#a855f7' : 
                                     currentTierForProgress === 'elite' ? '#eab308' : '#d4d4d4',
                    boxShadow: currentTierForProgress === 'basic' ? '0 0 10px rgba(251, 146, 60, 0.4)' :
                               currentTierForProgress === 'pro' ? '0 0 10px rgba(168, 85, 247, 0.4)' :
                               currentTierForProgress === 'elite' ? '0 0 10px rgba(234, 179, 8, 0.4)' :
                               currentTierForProgress === 'free' ? '0 0 12px rgba(255, 255, 255, 0.25)' : 'none'
                  }}
                ></div>
                {/* Level Indicators */}
                {renderLevelIndicators(currentTierForProgress, WORKOUT_LIMITS, 3, 'workouts')}
              </div>
            </div>

            {/* Habits */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest font-montserrat">
                <span className="text-white/40">Привычки</span>
                <span className="text-white">
                  {HABITS_HARDCODE[currentTierForProgress as keyof typeof HABITS_HARDCODE] || 1} / 15
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 relative">
                {/* Active Bar */}
                <div 
                  className={cn(
                    "absolute inset-0 h-full transition-all duration-1000 ease-out rounded-full z-10",
                    !isDataLoaded ? "w-0" : ""
                  )} 
                  style={{ 
                    width: isDataLoaded ? `${(HABITS_HARDCODE[currentTierForProgress as keyof typeof HABITS_HARDCODE] || 1) / 15 * 100}%` : '0%',
                    backgroundColor: currentTierForProgress === 'basic' ? '#fb923c' : 
                                     currentTierForProgress === 'pro' ? '#a855f7' : 
                                     currentTierForProgress === 'elite' ? '#eab308' : '#d4d4d4',
                    boxShadow: currentTierForProgress === 'basic' ? '0 0 10px rgba(251, 146, 60, 0.4)' :
                               currentTierForProgress === 'pro' ? '0 0 10px rgba(168, 85, 247, 0.4)' :
                               currentTierForProgress === 'elite' ? '0 0 10px rgba(234, 179, 8, 0.4)' :
                               currentTierForProgress === 'free' ? '0 0 12px rgba(255, 255, 255, 0.25)' : 'none'
                  }}
                ></div>
                {/* Level Indicators */}
                {renderLevelIndicators(currentTierForProgress, HABITS_HARDCODE, 15, 'habits')}
              </div>
            </div>

            {/* Widgets */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest font-montserrat">
                <span className="text-white/40">Виджеты</span>
                <span className="text-white">
                  {WIDGETS_HARDCODE[currentTierForProgress as keyof typeof WIDGETS_HARDCODE] || 1} / 8
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 relative">
                {/* Active Bar */}
                <div 
                  className={cn(
                    "absolute inset-0 h-full transition-all duration-1000 ease-out rounded-full z-10",
                    !isDataLoaded ? "w-0" : ""
                  )} 
                  style={{ 
                    width: isDataLoaded ? `${(WIDGETS_HARDCODE[currentTierForProgress as keyof typeof WIDGETS_HARDCODE] || 1) / 8 * 100}%` : '0%',
                    backgroundColor: currentTierForProgress === 'basic' ? '#fb923c' : 
                                     currentTierForProgress === 'pro' ? '#a855f7' : 
                                     currentTierForProgress === 'elite' ? '#eab308' : '#d4d4d4',
                    boxShadow: currentTierForProgress === 'basic' ? '0 0 10px rgba(251, 146, 60, 0.4)' :
                               currentTierForProgress === 'pro' ? '0 0 10px rgba(168, 85, 247, 0.4)' :
                               currentTierForProgress === 'elite' ? '0 0 10px rgba(234, 179, 8, 0.4)' :
                               currentTierForProgress === 'free' ? '0 0 12px rgba(255, 255, 255, 0.25)' : 'none'
                  }}
                ></div>
                {/* Level Indicators */}
                {renderLevelIndicators(currentTierForProgress, WIDGETS_HARDCODE, 8, 'widgets')}
              </div>
            </div>

            {/* Articles (Dynamic) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest font-montserrat">
                <span className="text-white/40">Статьи</span>
                <span className="text-white">
                  {articleProgress.current} / {articleProgress.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 relative">
                {/* Active Bar */}
                <div 
                  className={cn(
                    "absolute inset-0 h-full transition-all duration-1000 ease-out rounded-full z-10",
                    !isDataLoaded ? "w-0" : ""
                  )} 
                  style={{ 
                    width: isDataLoaded && articleProgress.total > 0 ? `${(articleProgress.current / articleProgress.total) * 100}%` : '0%',
                    backgroundColor: currentTierForProgress === 'basic' ? '#fb923c' : 
                                     currentTierForProgress === 'pro' ? '#a855f7' : 
                                     currentTierForProgress === 'elite' ? '#eab308' : '#d4d4d4',
                    boxShadow: currentTierForProgress === 'basic' ? '0 0 10px rgba(251, 146, 60, 0.4)' :
                               currentTierForProgress === 'pro' ? '0 0 10px rgba(168, 85, 247, 0.4)' :
                               currentTierForProgress === 'elite' ? '0 0 10px rgba(234, 179, 8, 0.4)' :
                               currentTierForProgress === 'free' ? '0 0 12px rgba(255, 255, 255, 0.25)' : 'none'
                  }}
                ></div>
                {/* Level Indicators */}
                {articleProgress.total > 0 && renderLevelIndicators(currentTierForProgress, articleProgress.limits, articleProgress.total, 'articles')}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 pb-0 flex items-center justify-center gap-4 border-t border-white/[0.04] relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4d4d4] shadow-[0_0_5px_rgba(255,255,255,0.2)]"></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30 font-montserrat">Free</span>
            </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#fb923c] shadow-[0_0_5px_rgba(251,146,60,0.4)]"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30 font-montserrat">Basic</span>
          </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.4)]"></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30 font-montserrat">Pro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.4)]"></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30 font-montserrat">Elite</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {TIER_INFO.map((tier) => {
          const isCurrent = tier.id === profile.subscription_tier
          const planDetails = SUBSCRIPTION_PLANS[tier.planKey as keyof typeof SUBSCRIPTION_PLANS]
          const features = planDetails.benefits
          
          // Определяем, является ли этот тариф ниже текущего активного уровня
          const tierLevels: Record<string, number> = { free: 0, basic: 1, pro: 2, elite: 3 };
          const currentLevel = tierLevels[profile.subscription_tier] || 0;
          const thisLevel = tierLevels[tier.id] || 0;
          const isLowerTier = thisLevel < currentLevel;

          return (
            <div key={tier.id} className="flex flex-col gap-6 group">
              <div 
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-500 relative flex flex-col gap-3 overflow-hidden min-h-[180px]",
                  isCurrent ? "shadow-2xl scale-[1.02]" : "hover:scale-[1.02]"
                )}
                style={{ 
                  background: tier.styles.card,
                  borderColor: tier.styles.border,
                  borderWidth: '2px'
                }}
              >
                {/* Pattern Overlay */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ 
                    backgroundImage: `linear-gradient(45deg, ${tier.styles.pattern} 25%, transparent 25%, transparent 50%, ${tier.styles.pattern} 50%, ${tier.styles.pattern} 75%, transparent 75%, transparent)`,
                    backgroundSize: '20px 20px'
                  }}
                />

                {isCurrent && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-black text-[9px] font-black rounded-b-xl uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 z-10">
                    Текущий
                  </span>
                )}
                {tier.isPopular && !isCurrent && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-purple-500 text-white text-[9px] font-black rounded-b-xl uppercase tracking-[0.2em] shadow-lg shadow-purple-500/20 z-10">
                    Популярный
                  </span>
                )}
                
                <div className="relative z-10 pt-1">
                  <h3 className="text-base font-black font-oswald uppercase tracking-tight text-white/90">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black font-oswald text-white">{tier.price}</span>
                    <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest font-montserrat">/ {tier.period}</span>
                  </div>
                  {tier.id !== 'free' && (
                    <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest font-montserrat mt-0.5 italic">
                      при оплате за 12 месяцев
                    </p>
                  )}
                </div>

                <div className="mt-auto relative z-10">
                  <button 
                    disabled={isLowerTier}
                    onClick={() => {
                      if (isCurrent) {
                        onRenewalClick();
                      } else if (!isLowerTier) {
                        onUpgradeClick();
                      }
                    }}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 font-montserrat",
                      isLowerTier 
                        ? "bg-white/5 text-white/20 cursor-default border border-white/5 opacity-50"
                        : tier.buttonStyle
                    )}
                  >
                    {(() => {
                      if (isCurrent) return 'Продлить';
                      if (isLowerTier) return 'Твоя подписка лучше!';
                      if (profile.subscription_tier === 'free') {
                        return tier.id === 'free' ? 'Улучшить' : 'Выбрать';
                      }
                      return 'Улучшить';
                    })()}
                  </button>
                </div>
              </div>

              <ul className="flex flex-col gap-4 px-2">
                {features.map((benefit, idx) => (
                  <li key={idx} className={cn(
                    "flex items-start gap-3 text-[11px] font-bold font-montserrat leading-relaxed transition-colors",
                    benefit.included ? "text-white/60 group-hover:text-white/80" : "text-white/20"
                  )}>
                    {benefit.highlight ? (
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    ) : benefit.included ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 border border-white/10 rounded-full shrink-0 mt-0.5" />
                    )}
                    <span className={cn(!benefit.included && "line-through opacity-50")}>{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* EXTRA SECTION: Purchase History & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Purchase History (Left 7/12) */}
        <div className="lg:col-span-7 flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Receipt className="w-4 h-4 text-white/60" />
              </div>
              <h3 className="text-base font-bold text-white font-oswald uppercase tracking-tight">История покупок</h3>
            </div>
            <button className="text-[9px] text-white/40 hover:text-white font-bold uppercase tracking-widest transition-colors">
              Смотреть все
            </button>
          </div>
          <div className="w-full overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs min-w-[450px] md:min-w-0">
                <thead className="bg-white/[0.01] text-[9px] uppercase text-white/20 font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-3.5">Тариф</th>
                    <th className="px-6 py-3.5">Дата</th>
                    <th className="px-6 py-3.5">Статус</th>
                    <th className="px-6 py-3.5 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {MOCK_PURCHASES.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            purchase.plan === 'Elite' ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" :
                            purchase.plan === 'Pro' ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" :
                            "bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                          )} />
                          <span className="font-bold text-white font-oswald tracking-wide">{purchase.plan}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/40 font-medium font-montserrat text-[10px]">{purchase.date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border bg-emerald-500/5 text-emerald-400/60 border-emerald-500/10">
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-oswald text-sm font-bold text-white">
                          {purchase.amount.toLocaleString('ru-RU')} ₽
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ (Right 5/12) */}
        <div className="lg:col-span-5 flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-white/[0.04] px-6 py-5 relative z-10">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <HelpCircle className="w-4 h-4 text-white/60" />
            </div>
            <h3 className="text-base font-bold text-white font-oswald uppercase tracking-tight">Частые вопросы</h3>
          </div>
          
          <div className="flex-1 p-4 space-y-2 relative z-10">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden",
                    isOpen 
                      ? "bg-white/5 border-white/10 shadow-lg" 
                      : "bg-transparent border-transparent hover:bg-white/[0.02]"
                  )}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className={cn(
                      "text-xs font-bold font-montserrat transition-colors pr-4",
                      isOpen ? "text-white" : "text-white/70"
                    )}>
                      {faq.question}
                    </span>
                    <div className={cn(
                      "shrink-0 p-1 rounded-full transition-transform duration-300",
                      isOpen ? "bg-white/10 rotate-180" : "bg-transparent"
                    )}>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-colors",
                        isOpen ? "text-white" : "text-white/30"
                      )} />
                    </div>
                  </button>
                  <div 
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="p-4 pt-0 text-[11px] leading-relaxed text-white/40 font-montserrat">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
