import { getCurrentProfile } from '@/lib/actions/profile'
import { getDiarySettings, getDiaryEntries } from '@/lib/actions/diary'
import { redirect } from 'next/navigation'
import DiaryDashboard from './diary-dashboard'

export default async function DiaryPage2() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  // Fetch settings
  const settingsRes = await getDiarySettings(profile.id)
  const settings = settingsRes.success ? settingsRes.data : null

  // Fetch today's entry
  const today = new Date().toISOString().split('T')[0]
  const entriesRes = await getDiaryEntries(profile.id, today, today)
  const todayEntry = entriesRes.success && entriesRes.data ? entriesRes.data[0] : null

  return (
    <DiaryDashboard 
      profile={profile} 
      settings={settings} 
      initialEntry={todayEntry} 
    />
  )
}

