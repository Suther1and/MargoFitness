import { NextResponse } from 'next/server'
import { registerReferral } from '@/lib/actions/referrals'
import { ensureBonusAccountExists } from '@/lib/actions/bonuses'

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

    // Убедимся что бонусный аккаунт существует
    const bonusResult = await ensureBonusAccountExists(userId)
    if (!bonusResult.success) {
      console.error('[Process Referral] Failed to ensure bonus account:', bonusResult.error)
    }

    // Даем время на создание профиля триггером
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Регистрируем реферала
    const result = await registerReferral(refCode, userId)

    if (result.success) {
      console.log('[Process Referral] Success for user:', userId)
      return NextResponse.json({ success: true })
    } else {
      console.error('[Process Referral] Failed:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Process Referral] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

