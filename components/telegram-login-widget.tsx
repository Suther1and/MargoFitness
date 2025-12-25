"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TelegramLoginWidgetProps {
  botName: string
  redirectTo?: string
  referralCode?: string | null
  onAuth?: (user: TelegramUser) => void
  buttonSize?: 'large' | 'medium' | 'small'
  cornerRadius?: number
  requestAccess?: boolean
  usePic?: boolean
  lang?: string
  useRedirect?: boolean
  onLoadingChange?: (loading: boolean) => void
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}

export function TelegramLoginWidget({
  botName,
  redirectTo = '/dashboard',
  referralCode,
  onAuth,
  buttonSize = 'large',
  cornerRadius,
  requestAccess = true,
  usePic = true,
  lang = 'ru',
  useRedirect = false,
  onLoadingChange
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])
  
  // Сохраняем реферальный код в localStorage перед авторизацией
  useEffect(() => {
    if (referralCode) {
      localStorage.setItem('telegram_ref_code', referralCode)
      console.log('[Telegram Widget] Stored ref code:', referralCode)
    } else {
      localStorage.removeItem('telegram_ref_code')
    }
  }, [referralCode])

  useEffect(() => {
    if (!botName) {
      console.error('[Telegram Widget] Bot name not provided')
      setError('Telegram bot не настроен')
      return
    }

    window.onTelegramAuth = async (user: TelegramUser) => {
      console.log('[Telegram Widget] Auth callback received:', user.username)
      setLoading(true)
      setError(null)

      try {
        if (onAuth) {
          await onAuth(user)
          return
        }

        // Получаем реферальный код из localStorage
        const refCode = localStorage.getItem('telegram_ref_code')
        console.log('[Telegram Widget] Retrieved ref code from localStorage:', refCode || 'NONE')
        
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...user,
            ref_code: refCode || undefined
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка авторизации')
        }

        if (data.success && data.session) {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })

          if (sessionError) {
            throw new Error('Ошибка установки сессии')
          }

          // Очищаем реферальный код из localStorage
          localStorage.removeItem('telegram_ref_code')

          router.push(redirectTo)
          router.refresh()
        } else {
          throw new Error('Не получена сессия')
        }
      } catch (err) {
        console.error('[Telegram Widget] Auth error:', err)
        setError(err instanceof Error ? err.message : 'Ошибка авторизации')
        setLoading(false)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', buttonSize)
    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString())
    }
    script.setAttribute('data-request-access', requestAccess ? 'write' : 'read')
    script.setAttribute('data-userpic', usePic.toString())
    script.setAttribute('data-lang', lang)
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')

    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      delete window.onTelegramAuth
    }
  }, [botName, redirectTo, onAuth, buttonSize, cornerRadius, requestAccess, usePic, lang, router])

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return <div ref={containerRef} className="flex justify-center" />
}

