import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import { HealthTrackerContent } from './health-tracker-content'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  // Параллельно загружаем bonusStats (после проверки профиля)
  // Используем try/catch для предотвращения падения всей страницы
  let bonusStats = null
  try {
    const bonusStatsResult = await getBonusStats(profile.id)
    if (bonusStatsResult.success) {
      bonusStats = bonusStatsResult.data ?? null
    }
  } catch (e) {
    console.error('Failed to load bonus stats in DashboardPage:', e)
  }

  return <HealthTrackerContent profile={profile} bonusStats={bonusStats} />
}
