import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DebugPage() {
  const supabase = await createClient()
  
  // Получаем пользователя
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Пробуем получить профиль
  let profile = null
  let profileError = null
  
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    profile = data
    profileError = error
  }
  
  // Проверяем все профили (для админа)
  const { data: allProfiles, error: allProfilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5)

  return (
    <div className="container mx-auto space-y-6 py-10">
      <h1 className="text-3xl font-bold">Debug Information</h1>
      
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Auth User</CardTitle>
        </CardHeader>
        <CardContent>
          {userError ? (
            <pre className="text-red-500">{JSON.stringify(userError, null, 2)}</pre>
          ) : user ? (
            <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
          ) : (
            <p>No user logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          {profileError ? (
            <div className="space-y-2">
              <p className="text-red-500 font-medium">Error fetching profile:</p>
              <pre className="text-xs text-red-500">{JSON.stringify(profileError, null, 2)}</pre>
            </div>
          ) : profile ? (
            <pre className="text-xs">{JSON.stringify(profile, null, 2)}</pre>
          ) : (
            <p>No profile found</p>
          )}
        </CardContent>
      </Card>

      {/* All Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>All Profiles (first 5)</CardTitle>
        </CardHeader>
        <CardContent>
          {allProfilesError ? (
            <div className="space-y-2">
              <p className="text-red-500 font-medium">Error:</p>
              <pre className="text-xs text-red-500">{JSON.stringify(allProfilesError, null, 2)}</pre>
            </div>
          ) : allProfiles && allProfiles.length > 0 ? (
            <pre className="text-xs">{JSON.stringify(allProfiles, null, 2)}</pre>
          ) : (
            <p>No profiles in database</p>
          )}
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs">
            User ID: {user?.id || 'N/A'}{'\n'}
            Email: {user?.email || 'N/A'}{'\n'}
            Email Confirmed: {user?.email_confirmed_at ? 'Yes' : 'No'}{'\n'}
            Created: {user?.created_at || 'N/A'}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

