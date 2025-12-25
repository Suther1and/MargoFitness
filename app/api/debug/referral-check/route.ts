import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
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
    const { refCode, userId } = await request.json()

    console.log('='.repeat(80))
    console.log('[DEBUG] Checking referral system')
    console.log('RefCode:', refCode)
    console.log('UserId:', userId)

    const supabaseAdmin = getAdminClient()
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'SERVICE_ROLE_KEY not configured',
        hasServiceKey: false
      })
    }

    // 1. Проверяем существование реферального кода
    const { data: refCodeData, error: refError } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('code', refCode)
      .single()

    console.log('[DEBUG] Ref code check:', { found: !!refCodeData, error: refError?.message })

    // 2. Проверяем бонусный аккаунт нового пользователя
    const { data: bonusAccount, error: bonusError } = await supabaseAdmin
      .from('user_bonuses')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('[DEBUG] Bonus account:', { found: !!bonusAccount, balance: bonusAccount?.balance, error: bonusError?.message })

    // 3. Проверяем существующие рефералы для этого пользователя
    const { data: existingReferral, error: existingError } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .single()

    console.log('[DEBUG] Existing referral:', { found: !!existingReferral, error: existingError?.message })

    // 4. Проверяем транзакции
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('bonus_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    console.log('[DEBUG] Transactions:', { count: transactions?.length || 0, error: txError?.message })

    console.log('='.repeat(80))

    return NextResponse.json({
      success: true,
      hasServiceKey: true,
      checks: {
        refCodeExists: !!refCodeData,
        refCodeOwner: refCodeData?.user_id || null,
        bonusAccountExists: !!bonusAccount,
        bonusBalance: bonusAccount?.balance || 0,
        referralExists: !!existingReferral,
        transactionsCount: transactions?.length || 0,
        transactions: transactions?.map(t => ({
          type: t.type,
          amount: t.amount,
          description: t.description,
          created_at: t.created_at
        }))
      },
      errors: {
        refCode: refError?.message || null,
        bonusAccount: bonusError?.message || null,
        existingReferral: existingError?.message || null,
        transactions: txError?.message || null
      }
    })

  } catch (error) {
    console.error('[DEBUG] Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST refCode and userId to debug',
    example: {
      refCode: 'abc12345',
      userId: 'uuid-here'
    }
  })
}

