"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { TelegramLoginWidget } from "@/components/telegram-login-widget"

interface OAuthButtonsProps {
  redirectTo?: string
}

export function OAuthButtons({ redirectTo = "/dashboard" }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [showTelegramWidget, setShowTelegramWidget] = useState(false)
  const supabase = createClient()

  // Получаем имя бота из переменных окружения
  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || ''

  const handleGoogleLogin = async () => {
    try {
      setLoadingProvider("google")
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
        },
      })

      if (error) {
        console.error("Google OAuth error:", error)
        alert("Ошибка входа через Google. Попробуйте снова.")
        setLoadingProvider(null)
      }
    } catch (error) {
      console.error("Google OAuth error:", error)
      alert("Ошибка входа через Google. Попробуйте снова.")
      setLoadingProvider(null)
    }
  }

  const handleTelegramClick = () => {
    if (!telegramBotName) {
      alert("Telegram авторизация не настроена. Обратитесь к администратору.")
      return
    }
    setShowTelegramWidget(true)
  }

  const handleComingSoon = (provider: string) => {
    alert(`Вход через ${provider} скоро будет доступен! 🚀`)
  }

  return (
    <div className="space-y-3">
      {/* Разделитель */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Или войдите через
          </span>
        </div>
      </div>

      {/* Google OAuth - работает */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loadingProvider !== null}
      >
        <GoogleIcon />
        <span className="ml-2">
          {loadingProvider === "google" ? "Вход..." : "Google"}
        </span>
      </Button>

      {/* Yandex - заглушка */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleComingSoon("Yandex")}
        disabled={loadingProvider !== null}
      >
        <YandexIcon />
        <span className="ml-2">Yandex</span>
      </Button>

      {/* VK - заглушка */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleComingSoon("ВКонтакте")}
        disabled={loadingProvider !== null}
      >
        <VKIcon />
        <span className="ml-2">ВКонтакте</span>
      </Button>

      {/* Telegram - официальный Login Widget */}
      {!showTelegramWidget ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleTelegramClick}
          disabled={loadingProvider !== null}
        >
          <TelegramIcon />
          <span className="ml-2">Telegram</span>
        </Button>
      ) : (
        <div className="rounded-lg border border-muted bg-muted/20 p-4">
          <div className="mb-2 text-center text-sm text-muted-foreground">
            Нажмите кнопку ниже для входа через Telegram
          </div>
          <TelegramLoginWidget
            botName={telegramBotName}
            redirectTo={redirectTo}
            buttonSize="large"
            requestAccess={true}
            usePic={true}
            lang="ru"
          />
          <button
            onClick={() => setShowTelegramWidget(false)}
            className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  )
}

// SVG иконки для провайдеров
function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function YandexIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 15h-1.8V9.5h-1.2V8h1.2c0-1.1.5-2 2.3-2h1v1.5h-.8c-.6 0-.7.3-.7.8V8h1.5v1.5h-1.5V17z"
        fill="#FC3F1D"
      />
    </svg>
  )
}

function VKIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.53 13.97h-1.37c-.38 0-.5-.31-.94-.75-.47-.48-1.16-1.17-1.16-.84 0 .44 0 1.59-.69 1.59-1.03 0-2.19-1.31-3-2.81-.56-1.03-.84-1.88-.84-2.03 0-.16.06-.31.31-.31h1.41c.25 0 .34.12.44.34.5 1.38 1.34 2.59 1.69 2.59.13 0 .19-.06.19-.38v-1.5c-.06-.81-.47-.88-.47-1.16 0-.12.1-.25.28-.25h2.22c.19 0 .25.12.25.31v2.06c0 .19.09.25.16.25.13 0 .22-.06.44-.28.69-.78 1.19-1.97 1.19-1.97.06-.16.19-.31.44-.31h1.41c.31 0 .38.16.31.38-.13.63-1.44 2.34-1.44 2.34-.1.16-.13.22 0 .41.09.13.41.41.63.66.41.44.72.81.81 1.06.06.28-.03.44-.31.44z"
        fill="#0077FF"
      />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
        fill="#0088cc"
      />
    </svg>
  )
}

