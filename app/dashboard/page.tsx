import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import DashboardClient from './dashboard-client'

export default async function DashboardNewPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  return <DashboardClient profile={profile} />
}
