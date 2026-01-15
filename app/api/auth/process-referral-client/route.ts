import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { BONUS_CONSTANTS } from '@/types/database'

const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.error('[Process Referral Client] SUPABASE_SERVICE_ROLE_KEY not found!')
    return null
  }
  
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: Request) {
  try {
    const { refCode } = await request.json()

    if (!refCode) {
      return NextResponse.json({ error: 'Missing refCode' }, { status: 400 })
    }

    // Получаем текущего пользователя из сессии
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabaseAdmin = getAdminClient()
    
    if (!supabaseAdmin) {
      console.error('[Process Referral Client] Cannot create admin client')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Валидируем реферальный код
    const { data: refCodeData, error: refError } = await supabaseAdmin
      .from('referral_codes')
      .select('user_id')
      .eq('code', refCode)
      .single()

    if (refError || !refCodeData) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    const referrerId = refCodeData.user_id

    if (referrerId === user.id) {
      return NextResponse.json({ error: 'Cannot use own code' }, { status: 400 })
    }

    // Проверяем что реферал еще не зарегистрирован
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .single()

    if (existing) {
      // Если уже зарегистрирован, все равно проверяем достижения на случай если они не были выданы
      await Promise.all([
        checkAndUnlockAchievements(user.id, supabaseAdmin),
        checkAndUnlockAchievements(referrerId, supabaseAdmin)
      ])
      return NextResponse.json({ success: true, message: 'Already registered, but achievements checked' })
    }

    // Проверяем, были ли у пользователя уже успешные покупки
    const { data: purchases } = await supabaseAdmin
      .from('payment_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'succeeded')
      .limit(1)

    const hasPurchased = purchases && purchases.length > 0

    // Создаем связь
    const { error: insertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: user.id,
        status: hasPurchased ? 'first_purchase_made' : 'registered',
        first_purchase_at: hasPurchased ? new Date().toISOString() : null
      })

    if (insertError) {
      console.error('[Process Referral Client] Failed to create referral:', insertError)
      throw insertError
    }

    // Вызываем проверку достижений для обоих пользователей
    // Это автоматически начислит бонусы через систему достижений
    await Promise.all([
      checkAndUnlockAchievements(user.id, supabaseAdmin),
      checkAndUnlockAchievements(referrerId, supabaseAdmin)
    ])

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Process Referral Client] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

