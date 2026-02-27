'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive, getEffectiveTier } from '@/lib/access-control'
import { Check, Settings, FileText, Verified, Sparkles, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { HABIT_LIMITS, WIDGET_LIMITS } from '@/lib/constants/subscriptions'

interface SubscriptionTabProps {
  profile: Profile
  onRenewalClick: () => void
  onUpgradeClick: () => void
}

const TIER_FEATURES = {
  free: [
    'Базовый трекер здоровья',
    '1 привычка',
    '1 виджет',
  ],
  basic: [
    'Все возможности Free',
    'До 6 привычек',
    '6 виджетов',
    'Расширенная статистика',
  ],
  pro: [
    'Все возможности Basic',
    'До 10 привычек',
    'Все 8 виджетов',
    'Персональные тренировки',
  ],
  elite: [
    'Все возможности Pro',
    'До 15 привычек',
    'Личный тренер',
    'Персональные планы питания',
    'VIP поддержка 24/7',
  ]
}

const TIER_INFO = [
  { 
    id: 'free', 
    name: 'Free', 
    price: '0₽', 
    period: 'навсегда',
    color: 'from-gray-500/10 to-gray-600/10',
    borderColor: 'border-white/10',
    buttonStyle: 'border-2 border-white/10 text-white/60 hover:bg-white/5',
    buttonText: 'Выбрать тариф'
  },
  { 
    id: 'basic', 
    name: 'Starter', 
    price: '299₽', 
    period: 'в месяц',
    color: 'from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/20',
    buttonStyle: 'bg-orange-500 text-black shadow-lg shadow-orange-500/20 hover:bg-orange-400',
    buttonText: 'Выбрать тариф'
  },
  { 
    id: 'pro', 
    name: 'Pro', 
    price: '599₽', 
    period: 'в месяц',
    color: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/40',
    buttonStyle: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-400',
    buttonText: 'Выбрать тариф',
    isPopular: true
  },
  { 
    id: 'elite', 
    name: 'Enterprise', 
    price: '999₽', 
    period: 'в месяц',
    color: 'from-yellow-500/10 to-amber-500/10',
    borderColor: 'border-yellow-500/20',
    buttonStyle: 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-400',
    buttonText: 'Связаться с нами'
  },
]

export function SubscriptionTab({ profile, onRenewalClick, onUpgradeClick }: SubscriptionTabProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const subscriptionActive = isSubscriptionActive(profile)
  const effectiveTier = getEffectiveTier(profile)

  useEffect(() => {
    setDaysLeft(getDaysUntilExpiration(profile))
  }, [profile])

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

  const subStyles = getSubscriptionStyles(profile.subscription_tier)

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 pb-20">
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

      {/* Current Subscription Section */}
      <section>
        <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2 font-oswald uppercase tracking-wider">
          <Verified className="w-5 h-5 text-emerald-500" />
          Текущая подписка
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan Card */}
          <div className="sub-card rounded-2xl p-8 flex flex-col justify-between min-h-[280px]">
            <div className="sub-pattern"></div>
            <div className="sub-shine"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn("size-14 rounded-2xl flex items-center justify-center text-white shrink-0 bg-black/40 border border-white/5 shadow-inner")}>
                  <Verified className={cn("w-7 h-7", subStyles.status)} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-60 font-montserrat", subStyles.status)}>
                      {subscriptionActive ? 'Активный тариф' : 'Тариф истек'}
                    </p>
                    {subscriptionActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black tracking-widest uppercase border border-emerald-500/20">
                        Обновляется
                      </span>
                    )}
                  </div>
                  <p className="text-white text-3xl font-black font-oswald uppercase tracking-tight">
                    {tierDisplayName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-8">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest font-montserrat">
                  {subscriptionActive ? 'Следующее списание' : 'Подписка закончилась'}
                </p>
                <p className="text-white text-sm font-semibold">
                  {profile.subscription_expires_at 
                    ? format(new Date(profile.subscription_expires_at), 'd MMMM yyyy', { locale: ru })
                    : '—'}
                  {subscriptionActive && profile.subscription_tier !== 'free' && ' (599₽/мес)'}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4">
              <button 
                onClick={onRenewalClick}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl font-montserrat bg-gradient-to-b",
                  subStyles.btnPrimary
                )}
              >
                <Settings className={cn("w-4 h-4", subStyles.btnPrimaryIcon)} />
                Управлять
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 text-white/60 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10 font-montserrat active:scale-95">
                <FileText className="w-4 h-4 text-white/20" />
                Чеки
              </button>
            </div>
          </div>

          {/* Resource Usage Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] font-montserrat">Использование ресурсов</h3>
              <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black font-montserrat">Месячный цикл</span>
            </div>
            
            <div className="space-y-6">
              {/* Workouts */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest font-montserrat">
                  <span className="text-white/40">Тренировки</span>
                  <span className="text-white">
                    2 / 3 <span className="ml-2 text-purple-400">66%</span>
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 p-[1px] border border-white/5">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.4)]" style={{ width: '66%' }}></div>
                </div>
              </div>

              {/* Habits */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest font-montserrat">
                  <span className="text-white/40">Привычки</span>
                  <span className="text-white">
                    6 / {HABIT_LIMITS[profile.subscription_tier as keyof typeof HABIT_LIMITS] || 15} 
                    <span className="ml-2 text-orange-400">
                      {Math.round((6 / (HABIT_LIMITS[profile.subscription_tier as keyof typeof HABIT_LIMITS] || 15)) * 100)}%
                    </span>
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 p-[1px] border border-white/5">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.4)]" style={{ width: `${(6 / (HABIT_LIMITS[profile.subscription_tier as keyof typeof HABIT_LIMITS] || 15)) * 100}%` }}></div>
                </div>
              </div>

              {/* Widgets */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest font-montserrat">
                  <span className="text-white/40">Виджеты</span>
                  <span className="text-white">
                    {WIDGET_LIMITS[profile.subscription_tier as keyof typeof WIDGET_LIMITS] || 8} / 8 
                    <span className="ml-2 text-emerald-400">
                      {Math.round(((WIDGET_LIMITS[profile.subscription_tier as keyof typeof WIDGET_LIMITS] || 8) / 8) * 100)}%
                    </span>
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 p-[1px] border border-white/5">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${((WIDGET_LIMITS[profile.subscription_tier as keyof typeof WIDGET_LIMITS] || 8) / 8) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section>
        <h2 className="text-white text-xl font-bold mb-8 font-oswald uppercase tracking-wider">Сравнение тарифов</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIER_INFO.map((tier) => {
            const isCurrent = tier.id === profile.subscription_tier
            const features = TIER_FEATURES[tier.id as keyof typeof TIER_FEATURES]

            return (
              <div key={tier.id} className="flex flex-col gap-6 group">
                <div className={cn(
                  "p-8 rounded-2xl bg-white/[0.03] border transition-all duration-500 relative flex flex-col gap-6",
                  tier.borderColor,
                  isCurrent ? "bg-white/[0.06] ring-1 " + tier.borderColor : "hover:bg-white/[0.05] hover:scale-[1.02]",
                  tier.isPopular && "scale-105 shadow-2xl shadow-purple-500/10"
                )}>
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-black text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 z-10">
                      Текущий
                    </span>
                  )}
                  {tier.isPopular && !isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-purple-500 text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-purple-500/20 z-10">
                      Популярный
                    </span>
                  )}
                  
                  <div className="relative">
                    <h3 className="text-xl font-black font-oswald uppercase tracking-tight text-white/90">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black font-oswald text-white">{tier.price}</span>
                      <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest font-montserrat">/ {tier.period}</span>
                    </div>
                  </div>

                  <button 
                    disabled={isCurrent}
                    onClick={() => tier.id === 'free' ? null : onUpgradeClick()}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 font-montserrat",
                      isCurrent 
                        ? "bg-white/5 text-white/20 cursor-default border border-white/5" 
                        : tier.buttonStyle
                    )}
                  >
                    {isCurrent ? 'Активен' : tier.buttonText}
                  </button>
                </div>

                <ul className="flex flex-col gap-4 px-2">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[11px] font-bold text-white/40 font-montserrat leading-relaxed group-hover:text-white/60 transition-colors">
                      {feature.includes('Все возможности') || feature.includes('Персональные') ? (
                        <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
