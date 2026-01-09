import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import { HealthTrackerContent } from './health-tracker-content'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const bonusStatsResult = await getBonusStats(profile.id)
  const bonusStats = bonusStatsResult.success ? (bonusStatsResult.data ?? null) : null

  return <HealthTrackerContent profile={profile} bonusStats={bonusStats} />
}
