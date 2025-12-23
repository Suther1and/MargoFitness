"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { OAuthButtons } from "@/components/oauth-buttons"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    
    // Через 2 секунды редиректим на dashboard
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="size-8 text-primary" />
            <span className="text-2xl font-bold">MargoFitness</span>
          </Link>
        </div>

        {/* Signup Card */}
        <Card>
          <CardHeader>
            <CardTitle>Создать аккаунт</CardTitle>
            <CardDescription>
              Начните свой путь к идеальной форме
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-center text-green-700 dark:bg-green-950 dark:text-green-300">
                  <p className="font-medium">Регистрация успешна! ✅</p>
                  <p className="mt-2 text-sm">
                    Перенаправляем в личный кабинет...
                  </p>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Если SMTP настроен, проверьте email для подтверждения.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Пароль
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Минимум 6 символов
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Создание аккаунта..." : "Зарегистрироваться"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Уже есть аккаунт? </span>
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Войти
                  </Link>
                </div>
              </form>
            )}

            {/* OAuth кнопки */}
            {!success && (
              <div className="mt-6">
                <OAuthButtons redirectTo="/dashboard" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Информация */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Что будет дальше?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>✅ Автоматически создастся профиль с тарифом Free</p>
            <p>✅ Получите доступ к бесплатным тренировкам</p>
            <p>✅ Сможете оформить подписку или купить программы</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

