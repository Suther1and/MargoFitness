/**
 * API Route: Тестирование email отправки
 * GET /api/test-email?type=welcome&to=email@example.com
 * 
 * ТОЛЬКО ДЛЯ РАЗРАБОТКИ - удалить перед production
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  sendWelcomeEmail,
  sendPaymentSuccessEmail,
  sendSubscriptionUpgradeEmail,
  sendSubscriptionChangeEmail
} from '@/lib/services/email'

export async function GET(request: NextRequest) {
  // Только в dev режиме
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'welcome'
  const to = searchParams.get('to')

  if (!to) {
    return NextResponse.json(
      { error: 'Email address required. Use ?to=your@email.com' },
      { status: 400 }
    )
  }

  let result = false

  try {
    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail({
          to,
          userName: 'Тестовый Пользователь'
        })
        break

      case 'payment':
        result = await sendPaymentSuccessEmail({
          to,
          userName: 'Тестовый Пользователь',
          planName: 'Pro 3 месяца',
          amount: 12822,
          duration: 3,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
        break

      case 'upgrade':
        result = await sendSubscriptionUpgradeEmail({
          to,
          userName: 'Тестовый Пользователь',
          oldPlan: 'Basic',
          newPlan: 'Pro',
          bonusDays: 28,
          totalDays: 118
        })
        break

      case 'change':
        result = await sendSubscriptionChangeEmail({
          to,
          userName: 'Тестовый Пользователь',
          changeType: 'renewed',
          planName: 'Pro',
          details: 'Ваша подписка успешно продлена на следующий период.'
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: welcome, payment, upgrade, or change' },
          { status: 400 }
        )
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Email (${type}) sent to ${to}`,
        note: 'Check your email inbox (and spam folder)'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email sending failed. Check server logs for details.',
        hint: 'Make sure RESEND_API_KEY is set in .env.local'
      })
    }

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

