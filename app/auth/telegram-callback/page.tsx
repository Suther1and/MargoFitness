"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function TelegramCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      // Получаем данные от Telegram из URL
      const telegramData = {
        id: parseInt(searchParams.get('id') || '0'),
        first_name: searchParams.get('first_name') || '',
        last_name: searchParams.get('last_name') || undefined,
        username: searchParams.get('username') || undefined,
        photo_url: searchParams.get('photo_url') || undefined,
        auth_date: parseInt(searchParams.get('auth_date') || '0'),
        hash: searchParams.get('hash') || ''
      }

      if (!telegramData.id || !telegramData.hash) {
        setError('Неверные данные от Telegram')
        return
      }

      try {
        // Отправляем на наш API
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(telegramData),
        })

        const data = await response.json()

        if (!response.ok || !data.success || !data.session) {
          throw new Error(data.error || 'Ошибка авторизации')
        }

        // Устанавливаем сессию в Supabase
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })

        if (sessionError) {
          throw new Error('Ошибка установки сессии')
        }

        // Редирект на dashboard
        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        console.error('[Telegram Callback] Error:', err)
        setError(err instanceof Error ? err.message : 'Ошибка авторизации')
      }
    }

    handleAuth()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка авторизации</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Вернуться на страницу входа
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card>
        <CardHeader>
          <CardTitle>Авторизация через Telegram</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin" />
          <span>Входим в систему...</span>
        </CardContent>
      </Card>
    </div>
  )
}

