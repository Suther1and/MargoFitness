'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'
import { Award, Calendar, Crown, Sparkles, TrendingUp, Check } from 'lucide-react'

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
    color: 'from-gray-500/20 to-gray-600/20',
    iconColor: 'text-gray-300',
    icon: Award
  },
  { 
    id: 'basic', 
    name: 'Basic', 
    price: '299₽', 
    period: 'в месяц',
    color: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400',
    icon: Sparkles
  },
  { 
    id: 'pro', 
    name: 'Pro', 
    price: '599₽', 
    period: 'в месяц',
    color: 'from-purple-500/20 to-indigo-500/20',
    iconColor: 'text-purple-400',
    icon: TrendingUp
  },
  { 
    id: 'elite', 
    name: 'Elite', 
    price: '999₽', 
    period: 'в месяц',
    color: 'from-yellow-500/20 to-amber-500/20',
    iconColor: 'text-yellow-400',
    icon: Crown
  },
]

export function SubscriptionTab({ profile, onRenewalClick, onUpgradeClick }: SubscriptionTabProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  const subscriptionActive = isSubscriptionActive(profile)
  const daysLeft = getDaysUntilExpiration(profile)

  const currentTierInfo = TIER_INFO.find(t => t.id === profile.subscription_tier)

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Current Subscription Card */}
      <div className="mb-8">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentTierInfo?.color} ring-1 ring-white/10 p-8`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {currentTierInfo && (
                    <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center`}>
                      <currentTierInfo.icon className={`w-6 h-6 ${currentTierInfo.iconColor}`} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-oswald font-bold uppercase text-white tracking-tight">
                      {tierDisplayName}
                    </h2>
                    <p className="text-sm text-white/60">Текущая подписка</p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {subscriptionActive ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200 ring-1 ring-emerald-400/40">
                    <span className="relative h-2 w-2 rounded-full bg-emerald-400">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
                    </span>
                    Активна
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-200 ring-1 ring-red-400/40">
                    <span className="relative h-2 w-2 rounded-full bg-red-400"></span>
                    Неактивна
                  </div>
                )}
              </div>
            </div>

            {profile.subscription_expires_at && (
              <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl ${!subscriptionActive ? 'bg-red-500/10 ring-1 ring-red-500/20' : 'bg-white/5'}`}>
                <Calendar className={`w-5 h-5 ${!subscriptionActive ? 'text-red-400/60' : 'text-white/40'}`} />
                <div className="flex-1">
                  <p className="text-sm text-white/60">{subscriptionActive ? 'Дата окончания' : 'Подписка истекла'}</p>
                  <p className={`text-lg font-semibold ${!subscriptionActive ? 'text-red-300' : 'text-white'}`}>
                    {new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                {daysLeft !== null && daysLeft > 0 ? (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{daysLeft}</p>
                    <p className="text-xs text-white/60">
                      {(() => {
                        const lastDigit = daysLeft % 10
                        const lastTwoDigits = daysLeft % 100
                        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней'
                        if (lastDigit === 1) return 'день'
                        if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
                        return 'дней'
                      })()}
                    </p>
                  </div>
                ) : !subscriptionActive ? (
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-red-400/80">Доступ ограничен</p>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex gap-3">
              {profile.subscription_tier !== 'free' && (
                <button 
                  onClick={onRenewalClick}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all ring-1 font-semibold active:scale-[0.98] ${
                    !subscriptionActive
                      ? 'bg-red-500/20 hover:bg-red-500/30 ring-red-500/40 text-white'
                      : 'bg-white/10 hover:bg-white/15 ring-white/20 text-white'
                  }`}
                >
                  {!subscriptionActive ? 'Возобновить подписку' : 'Продлить подписку'}
                </button>
              )}
              <button 
                onClick={() => profile.subscription_tier === 'free' ? window.location.href = '/#pricing' : onUpgradeClick()}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all text-black font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98]"
              >
                {profile.subscription_tier === 'free' ? 'Выбрать тариф' : 'Изменить тариф'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="mb-4">
        <h3 className="text-2xl font-oswald font-bold uppercase text-white mb-6">Сравнение тарифов</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIER_INFO.map((tier) => {
          const isCurrent = tier.id === profile.subscription_tier
          const Icon = tier.icon
          const features = TIER_FEATURES[tier.id as keyof typeof TIER_FEATURES]

          return (
            <div
              key={tier.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.color} ring-1 transition-all ${
                isCurrent 
                  ? 'ring-white/30 shadow-2xl' 
                  : 'ring-white/10 hover:ring-white/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 p-6">
                {isCurrent && (
                  <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-200 text-xs font-bold px-2 py-1 rounded-full ring-1 ring-emerald-400/40">
                    Текущий
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${tier.iconColor}`} />
                </div>

                <h4 className="text-2xl font-oswald font-bold uppercase text-white mb-1">
                  {tier.name}
                </h4>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-sm text-white/60 ml-2">{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <button 
                    onClick={() => window.location.href = '/#pricing'}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-all ring-1 ring-white/20 text-white font-semibold text-sm active:scale-[0.98]"
                  >
                    Выбрать тариф
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
