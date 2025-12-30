import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/services/email'
import { registerReferral } from '@/lib/actions/referrals'
import { ensureBonusAccountExists } from '@/lib/actions/bonuses'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'
  let refCode = requestUrl.searchParams.get('ref') // Реферальный код из URL
  const origin = requestUrl.origin

  console.log('='.repeat(80))
  console.log('[Callback] START - Full URL:', requestUrl.toString())
  console.log('[Callback] Params:', {
    code: code ? 'YES' : 'NO',
    redirect,
    refCode: refCode || 'NONE (will check localStorage)',
    origin
  })
  console.log('='.repeat(80))

  if (code) {
    try {
      const supabase = await createClient()
      
      // Обмениваем код на сессию
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('[Callback] Session exchange error:', sessionError)
        return NextResponse.redirect(`${origin}/?error=session_exchange_failed`)
      }

      console.log('[Callback] Session created for user:', sessionData.user?.id, sessionData.user?.email)

      // Если ref кода нет в URL, проверяем metadata
      if (!refCode && sessionData.user.user_metadata?.ref_code) {
        refCode = sessionData.user.user_metadata.ref_code
        console.log('[Callback] Retrieved ref code from metadata:', refCode)
      }

      // Проверяем, существует ли профиль
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single()

      console.log('[Callback] Profile check:', profile ? 'EXISTS' : 'NOT FOUND', profileError?.code)

      // Если профиль существует, убедимся что есть бонусный аккаунт
      if (profile) {
        const bonusResult = await ensureBonusAccountExists(sessionData.user.id)
        if (!bonusResult.success) {
          console.error('[Callback] Failed to ensure bonus account:', bonusResult.error)
        }
      }

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
          
          // ВАЖНО: Создаем бонусный аккаунт (на случай если триггер не сработал)
          const bonusResult = await ensureBonusAccountExists(sessionData.user.id)
          if (bonusResult.success) {
            console.log('[Callback] Bonus account ensured, created:', bonusResult.created)
          } else {
            console.error('[Callback] Failed to ensure bonus account:', bonusResult.error)
          }
          
          // Регистрация реферала (если есть код)
          if (refCode) {
            console.log('[Callback] Processing referral code:', refCode)
            const referralResult = await registerReferral(refCode, sessionData.user.id)
            if (referralResult.success) {
              console.log('[Callback] Referral registered successfully')
            } else {
              console.error('[Callback] Referral registration failed:', referralResult.error)
            }
          }
          
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
      return NextResponse.redirect(`${origin}/?error=callback_failed`)
    }
  } else {
    console.log('[Callback] No code provided, redirecting directly')
  }

  // Редирект на указанную страницу или dashboard после успешной авторизации
  console.log('[Callback] Final redirect to:', redirect)
  return NextResponse.redirect(`${origin}${redirect}`)
}

