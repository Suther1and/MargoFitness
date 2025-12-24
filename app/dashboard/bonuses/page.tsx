import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import { getReferralStats, getReferralLink } from '@/lib/actions/referrals'
import { BonusCard } from './bonus-card'
import { ReferralSection } from './referral-section'
import { BonusHistory } from './bonus-history'

export const metadata = {
  title: 'Бонусы | MargoFitness',
  description: 'Управление бонусами и реферальной программой',
}

export default async function BonusesPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  // Получаем данные параллельно
  const [bonusStatsResult, referralStatsResult, referralLinkResult] = await Promise.all([
    getBonusStats(profile.id),
    getReferralStats(profile.id),
    getReferralLink(profile.id),
  ])

  if (!bonusStatsResult.success || !bonusStatsResult.data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Ошибка загрузки данных: {bonusStatsResult.error}
        </div>
      </div>
    )
  }

  const bonusStats = bonusStatsResult.data
  const referralStats = referralStatsResult.data
  const referralLink = referralLinkResult.link

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold">Бонусная программа 👟</h1>
        <p className="text-muted-foreground mt-2">
          Зарабатывайте шаги за покупки и приглашайте друзей
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Левая колонка */}
        <div className="space-y-8">
          {/* Бонусная карточка */}
          <BonusCard
            account={bonusStats.account}
            levelData={bonusStats.levelData}
            progress={bonusStats.progress}
          />

          {/* Информация */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">ℹ️ Как использовать шаги</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Оплачивайте до 30% стоимости подписки шагами</li>
              <li>• 1 шаг = 1 рубль</li>
              <li>• Шаги не сгорают</li>
              <li>• Кешбек начисляется от фактически оплаченной суммы</li>
            </ul>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="space-y-8">
          {/* Реферальная программа */}
          {referralLink && referralStats && (
            <ReferralSection
              referralLink={referralLink}
              stats={referralStats}
            />
          )}

          {/* История операций */}
          <BonusHistory transactions={bonusStats.recentTransactions} userId={profile.id} />
        </div>
      </div>
    </div>
  )
}

