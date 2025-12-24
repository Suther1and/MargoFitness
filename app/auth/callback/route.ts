import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/services/email'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'
  const origin = requestUrl.origin

  console.log('[Callback] Received callback with code:', code ? 'YES' : 'NO')

  if (code) {
    try {
      const supabase = await createClient()
      
      // Обмениваем код на сессию
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('[Callback] Session exchange error:', sessionError)
        return NextResponse.redirect(`${origin}/auth/login?error=session_exchange_failed`)
      }

      console.log('[Callback] Session created for user:', sessionData.user?.id, sessionData.user?.email)

      // Проверяем, существует ли профиль
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single()

      console.log('[Callback] Profile check:', profile ? 'EXISTS' : 'NOT FOUND', profileError?.code)

      // Если профиля нет, создаем его вручную
      if (profileError?.code === 'PGRST116' || !profile) {
        console.log('[Callback] Creating profile for user:', sessionData.user.id)
        
        // Извлекаем дополнительные данные из метаданных
        const userMetadata = sessionData.user.user_metadata || {}
        const fullName = userMetadata.full_name || userMetadata.name || null
        const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null
        
        console.log('[Callback] User metadata:', { fullName, avatarUrl })
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: sessionData.user.id,
            email: sessionData.user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            role: 'user',
            subscription_status: 'inactive',
            subscription_tier: 'free'
          })
          .select()
          .single()

        if (createError) {
          console.error('[Callback] Profile creation error:', createError)
          // Продолжаем редирект, профиль будет создан при первом запросе
        } else {
          console.log('[Callback] Profile created successfully:', newProfile)
          
          // Отправка приветственного письма (не блокирует выполнение)
          sendWelcomeEmail({
            to: sessionData.user.email!,
            userName: fullName || undefined
          }).catch(err => {
            console.error('[Callback] Failed to send welcome email:', err)
          })
        }
      }
    } catch (error) {
      console.error('[Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
    }
  }

  // Редирект на указанную страницу или dashboard после успешной авторизации
  console.log('[Callback] Redirecting to:', redirect)
  return NextResponse.redirect(`${origin}${redirect}`)
}

