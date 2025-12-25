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
    const refCode = searchParams.get('ref') // Реферальный код

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
    // State включает redirect URL, реферальный код и случайный токен
    const randomToken = randomBytes(16).toString('hex')
    const state = Buffer.from(
      JSON.stringify({ 
        redirect: redirectTo, 
        ref: refCode || null,
        token: randomToken 
      })
    ).toString('base64url')

    // Формируем URL для Yandex OAuth
    const yandexAuthUrl = new URL('https://oauth.yandex.ru/authorize')
    yandexAuthUrl.searchParams.set('response_type', 'code')
    yandexAuthUrl.searchParams.set('client_id', clientId)
    yandexAuthUrl.searchParams.set('redirect_uri', redirectUri)
    yandexAuthUrl.searchParams.set('state', state)
    // Для Яндекс ID используем пустой scope или только разрешенные в настройках приложения
    // Базовая информация о пользователе доступна по умолчанию
    // Если нужны дополнительные права, настройте их в консоли Яндекс ID
    // и раскомментируйте нужные scope (например: 'login:email login:info')
    // yandexAuthUrl.searchParams.set('scope', '')
    // Опционально: принудительное согласие (force_confirm=yes)
    // yandexAuthUrl.searchParams.set('force_confirm', 'yes')

    console.log('[Yandex Init] Redirecting to Yandex OAuth:', {
      clientId: clientId.substring(0, 8) + '...',
      redirectUri,
      redirectTo,
      refCode: refCode || 'NONE'
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

