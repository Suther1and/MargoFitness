import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Просто редиректим на клиентскую страницу, которая обработает авторизацию
  // Передаем все параметры из Telegram
  const params = new URLSearchParams()
  searchParams.forEach((value, key) => {
    params.set(key, value)
  })
  
  return NextResponse.redirect(
    new URL(`/auth/telegram-callback?${params.toString()}`, request.url)
  )
}

