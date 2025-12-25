import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BONUS_CONSTANTS } from '@/types/database'

// Используем service role для backend операций (если доступен)
const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.error('[Process Referral] SUPABASE_SERVICE_ROLE_KEY not found!')
    return null
  }
  
  return createClient(
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
    const { userId, refCode } = await request.json()

    console.log('[Process Referral] Request:', { userId, refCode })

    if (!userId || !refCode) {
      return NextResponse.json(
        { error: 'Missing userId or refCode' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getAdminClient()
    
    if (!supabaseAdmin) {
      console.error('[Process Referral] Cannot create admin client - SERVICE_ROLE_KEY missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Даем время на создание профиля триггером (увеличено)
    console.log('[Process Referral] Waiting for DB triggers...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('[Process Referral] Starting validation')

    // Проверяем бонусный аккаунт
    const { data: bonusAccount, error: bonusCheckError } = await supabaseAdmin
      .from('user_bonuses')
      .select('id, balance')
      .eq('user_id', userId)
      .single()

    console.log('[Process Referral] Bonus account check:', { 
      found: !!bonusAccount, 
      balance: bonusAccount?.balance,
      error: bonusCheckError?.message 
    })

    if (!bonusAccount) {
      console.log('[Process Referral] Creating bonus account manually')
      const refCodeGen = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      await supabaseAdmin.from('user_bonuses').insert({
        user_id: userId,
        balance: 250,
        cashback_level: 1,
        total_spent_for_cashback: 0,
        referral_level: 1,
        total_referral_earnings: 0,
      })

      await supabaseAdmin.from('referral_codes').insert({
        user_id: userId,
        code: refCodeGen,
      })

      await supabaseAdmin.from('bonus_transactions').insert({
        user_id: userId,
        amount: 250,
        type: 'welcome',
        description: 'Приветственный бонус',
      })
    }

    // Валидируем реферальный код
    const { data: refCodeData, error: refError } = await supabaseAdmin
      .from('referral_codes')
      .select('user_id')
      .eq('code', refCode)
      .single()

    console.log('[Process Referral] Ref code validation:', {
      code: refCode,
      found: !!refCodeData,
      referrerId: refCodeData?.user_id,
      error: refError?.message
    })

    if (refError || !refCodeData) {
      console.error('[Process Referral] Invalid referral code:', refError?.message)
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    const referrerId = refCodeData.user_id

    // Нельзя использовать свой код
    if (referrerId === userId) {
      console.error('[Process Referral] User trying to use own code')
      return NextResponse.json({ error: 'Cannot use own code' }, { status: 400 })
    }

    // Проверяем что реферал еще не зарегистрирован
    const { data: existing, error: existingCheckError } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .single()

    console.log('[Process Referral] Existing check:', {
      alreadyRegistered: !!existing,
      error: existingCheckError?.message
    })

    if (existing) {
      console.error('[Process Referral] User already registered with referral')
      return NextResponse.json({ error: 'Already registered' }, { status: 400 })
    }

    // Создаем связь
    console.log('[Process Referral] Creating referral link:', {
      referrer_id: referrerId,
      referred_id: userId
    })

    const { error: insertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: userId,
        status: 'registered',
      })

    if (insertError) {
      console.error('[Process Referral] Failed to insert referral:', insertError)
      throw insertError
    }

    console.log('[Process Referral] Referral link created successfully')

    // Начисляем бонус приглашенному
    console.log('[Process Referral] Adding bonus transaction:', BONUS_CONSTANTS.REFERRED_USER_BONUS)

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
      console.error('[Process Referral] Failed to add bonus transaction:', txError)
    } else {
      console.log('[Process Referral] Bonus transaction created')
    }

    // Обновляем баланс
    const { data: currentBalance, error: balanceError } = await supabaseAdmin
      .from('user_bonuses')
      .select('balance')
      .eq('user_id', userId)
      .single()

    console.log('[Process Referral] Current balance:', {
      balance: currentBalance?.balance,
      error: balanceError?.message
    })

    if (currentBalance) {
      const newBalance = currentBalance.balance + BONUS_CONSTANTS.REFERRED_USER_BONUS
      
      const { error: updateError } = await supabaseAdmin
        .from('user_bonuses')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      if (updateError) {
        console.error('[Process Referral] Failed to update balance:', updateError)
      } else {
        console.log('[Process Referral] Balance updated:', {
          oldBalance: currentBalance.balance,
          newBalance: newBalance
        })
      }
    }

    console.log('[Process Referral] ✅ SUCCESS for user:', userId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Process Referral] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

