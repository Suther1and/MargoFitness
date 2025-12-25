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

    console.log('[Process Referral Client] Request:', { refCode })

    if (!refCode) {
      return NextResponse.json(
        { error: 'Missing refCode' },
        { status: 400 }
      )
    }

    // Получаем текущего пользователя из сессии
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[Process Referral Client] No authenticated user')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('[Process Referral Client] Processing for user:', userId)

    const supabaseAdmin = getAdminClient()
    
    if (!supabaseAdmin) {
      console.error('[Process Referral Client] Cannot create admin client')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Валидируем реферальный код
    const { data: refCodeData, error: refError } = await supabaseAdmin
      .from('referral_codes')
      .select('user_id')
      .eq('code', refCode)
      .single()

    console.log('[Process Referral Client] Ref code validation:', {
      found: !!refCodeData,
      error: refError?.message
    })

    if (refError || !refCodeData) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    const referrerId = refCodeData.user_id

    if (referrerId === userId) {
      return NextResponse.json({ error: 'Cannot use own code' }, { status: 400 })
    }

    // Проверяем что реферал еще не зарегистрирован
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .single()

    if (existing) {
      console.log('[Process Referral Client] Already registered')
      return NextResponse.json({ error: 'Already registered' }, { status: 400 })
    }

    // Создаем связь
    const { error: insertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: userId,
        status: 'registered',
      })

    if (insertError) {
      console.error('[Process Referral Client] Insert error:', insertError)
      throw insertError
    }

    // Начисляем бонус
    const { error: txError } = await supabaseAdmin
      .from('bonus_transactions')
      .insert({
        user_id: userId,
        amount: BONUS_CONSTANTS.REFERRED_USER_BONUS,
        type: 'referral_bonus',
        description: 'Бонус за регистрацию по приглашению',
        related_user_id: referrerId,
      })

    if (txError) {
      console.error('[Process Referral Client] Transaction error:', txError)
    }

    // Обновляем баланс
    const { data: currentBalance } = await supabaseAdmin
      .from('user_bonuses')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (currentBalance) {
      const newBalance = currentBalance.balance + BONUS_CONSTANTS.REFERRED_USER_BONUS
      
      await supabaseAdmin
        .from('user_bonuses')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      console.log('[Process Referral Client] ✅ SUCCESS - Balance updated:', newBalance)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Process Referral Client] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

