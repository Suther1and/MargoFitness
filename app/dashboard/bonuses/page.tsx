import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import { getReferralStats, getReferralLink } from '@/lib/actions/referrals'
import { BonusesClient } from './bonuses-client'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#18181b]">
        <div className="text-center text-red-400">
          Ошибка загрузки данных: {bonusStatsResult.error}
        </div>
      </div>
    )
  }

  const bonusStats = bonusStatsResult.data
  const referralStats = referralStatsResult.data
  const referralLink = referralLinkResult.link

  return (
    <BonusesClient
      bonusStats={bonusStats}
      referralStats={referralStats}
      referralLink={referralLink || null}
      userId={profile.id}
    />
  )
}

