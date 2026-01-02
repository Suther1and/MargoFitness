import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import DashboardClient from './dashboard-client'

export default async function DashboardNewPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const bonusStatsResult = await getBonusStats(profile.id)
  const bonusStats = bonusStatsResult.success ? (bonusStatsResult.data ?? null) : null

  return <DashboardClient profile={profile} bonusStats={bonusStats} />
}
