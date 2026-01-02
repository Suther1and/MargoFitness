import { getCurrentProfile } from '@/lib/actions/profile'
import HomeNewPage from './page'

export default async function HomePageWrapper() {
  const profile = await getCurrentProfile()
  
  return <HomeNewPage initialProfile={profile} />
}

