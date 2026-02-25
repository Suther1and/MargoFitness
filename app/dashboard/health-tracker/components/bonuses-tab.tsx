'use client'

import { UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'
import type { getReferralStats } from '@/lib/actions/referrals'
import { BonusCard } from '../../bonuses/bonus-card'
import { ReferralSection } from '../../bonuses/referral-section'
import { BonusHistory } from '../../bonuses/bonus-history'

interface BonusesTabProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
    recentTransactions: any[]
  } | null
  referralStats: Awaited<ReturnType<typeof getReferralStats>>['data'] | undefined
  referralLink: string | null
  referralCode: string | null
  userId: string
}

export function BonusesTab({ bonusStats, referralStats, referralLink, referralCode, userId }: BonusesTabProps) {
  if (!bonusStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка бонусной программы...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Desktop: сетка 2 колонки */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {/* Левая колонка: главная информация + реферальная */}
        <div className="space-y-8">
          <BonusCard
            account={bonusStats.account}
            levelData={bonusStats.levelData}
            progress={bonusStats.progress}
          />
          
          {referralLink && referralStats && referralCode && (
            <ReferralSection
              referralLink={referralLink}
              stats={referralStats}
              referralCode={referralCode}
            />
          )}
        </div>

        {/* Правая колонка: история */}
        <div>
          <BonusHistory transactions={bonusStats.recentTransactions} userId={userId} />
        </div>
      </div>

      {/* Mobile: вертикальный стэк */}
      <div className="lg:hidden space-y-6">
        <BonusCard
          account={bonusStats.account}
          levelData={bonusStats.levelData}
          progress={bonusStats.progress}
        />
        
        {referralLink && referralStats && referralCode && (
          <ReferralSection
            referralLink={referralLink}
            stats={referralStats}
            referralCode={referralCode}
          />
        )}
        
        <BonusHistory transactions={bonusStats.recentTransactions} userId={userId} />
      </div>
    </div>
  )
}
