'use client'

import { UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'
import type { getReferralStats } from '@/lib/actions/referrals'
import { BonusCard } from './bonus-card'
import { ReferralSection } from './referral-section'
import { BonusHistory } from './bonus-history'

interface BonusesClientProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
    recentTransactions: any[]
  }
  referralStats: Awaited<ReturnType<typeof getReferralStats>>['data'] | undefined
  referralLink: string | null
  userId: string
}

export function BonusesClient({ bonusStats, referralStats, referralLink, userId }: BonusesClientProps) {
  return (
    <>
      <style jsx global>{`
        /* Мобильные оптимизации */
        @media (max-width: 1023px) {
          .absolute.rounded-full.blur-3xl {
            display: none !important;
          }
          
          .backdrop-blur-xl {
            backdrop-filter: blur(4px) !important;
          }
          
          .shadow-2xl {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15) !important;
          }
          
          * {
            transition-duration: 0.2s !important;
          }
          
          @media (hover: none) {
            button:hover {
              transform: none !important;
            }
          }
        }
      `}</style>
      
      <div className="min-h-screen antialiased flex flex-col items-center justify-center text-neutral-900 font-inter p-0 xl:pt-2 xl:pr-4 xl:pb-8 xl:pl-4 relative overflow-x-hidden selection:bg-orange-500 selection:text-white" style={{ background: 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)' }}>
        <main className="relative w-full xl:max-w-[96rem] xl:rounded-[3rem] rounded-b-[3rem] overflow-hidden min-h-screen xl:min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#18181b]">
          <div className="container mx-auto px-4 md:px-8 py-10 pb-12">
            {/* Header с компактной бонусной картой */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8 mb-8 lg:mb-12">
              {/* Заголовок */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white font-oswald uppercase">
                  Бонусная программа
                </h1>
                <p className="mt-3 md:mt-4 text-base md:text-lg text-white/70">
                  Зарабатывайте шаги и получайте больше возможностей
                </p>
              </div>

              {/* Компактная бонусная карта (справа на десктопе) */}
              <div className="lg:flex-shrink-0 lg:w-auto w-full">
                <BonusCard
                  account={bonusStats.account}
                  levelData={bonusStats.levelData}
                  progress={bonusStats.progress}
                />
              </div>
            </div>

            {/* Сетка контента: реферальная программа и история */}
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
              {/* Реферальная программа */}
              {referralLink && referralStats && (
                <ReferralSection
                  referralLink={referralLink}
                  stats={referralStats}
                />
              )}

              {/* История операций */}
              <BonusHistory transactions={bonusStats.recentTransactions} userId={userId} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

