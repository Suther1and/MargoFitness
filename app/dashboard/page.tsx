import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import { HealthTrackerContent } from './health-tracker-content'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  // Параллельно загружаем bonusStats и referralStats (после проверки профиля)
  // Используем try/catch для предотвращения падения всей страницы
  let bonusStats = null
  let referralStats = null
  try {
    const [bonusStatsResult, referralStatsResult] = await Promise.all([
      getBonusStats(profile.id),
      import('@/lib/actions/referrals').then(m => m.getReferralStats(profile.id))
    ])

    if (bonusStatsResult.success) {
      bonusStats = bonusStatsResult.data ?? null
    }
    if (referralStatsResult.success) {
      referralStats = referralStatsResult.data ?? null
    }
  } catch (e) {
    console.error('Failed to load stats in DashboardPage:', e)
  }

  return <HealthTrackerContent profile={profile} bonusStats={bonusStats} initialReferralStats={referralStats} />
}
