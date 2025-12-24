import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

/**
 * Yandex OAuth Init Endpoint
 * Инициирует OAuth flow, перенаправляя пользователя на Yandex авторизацию
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const redirectTo = searchParams.get('redirect') || '/dashboard'

    // Получаем credentials из environment variables
    const clientId = process.env.YANDEX_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/yandex/callback`

    if (!clientId) {
      console.error('[Yandex Init] Client ID not configured')
      return NextResponse.json(
        { error: 'Yandex OAuth not configured' },
        { status: 500 }
      )
    }

    // Генерируем state для защиты от CSRF
    // State включает redirect URL и случайный токен
    const randomToken = randomBytes(16).toString('hex')
    const state = Buffer.from(
      JSON.stringify({ redirect: redirectTo, token: randomToken })
    ).toString('base64url')

    // Формируем URL для Yandex OAuth
    const yandexAuthUrl = new URL('https://oauth.yandex.ru/authorize')
    yandexAuthUrl.searchParams.set('response_type', 'code')
    yandexAuthUrl.searchParams.set('client_id', clientId)
    yandexAuthUrl.searchParams.set('redirect_uri', redirectUri)
    yandexAuthUrl.searchParams.set('state', state)
    // Запрашиваем необходимые права доступа
    yandexAuthUrl.searchParams.set('scope', 'login:email login:info login:avatar')
    // Опционально: принудительное согласие (force_confirm=yes)
    // yandexAuthUrl.searchParams.set('force_confirm', 'yes')

    console.log('[Yandex Init] Redirecting to Yandex OAuth:', {
      clientId: clientId.substring(0, 8) + '...',
      redirectUri,
      redirectTo
    })

    // Редиректим пользователя на Yandex
    return NextResponse.redirect(yandexAuthUrl.toString())
  } catch (error) {
    console.error('[Yandex Init] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

