"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { OAuthButtons } from "@/components/oauth-buttons"

function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<'auto' | 'login' | 'signup'>('auto')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Автоматический режим: сначала пробуем войти
    if (mode === 'auto') {
      // Пытаемся войти
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError) {
        // Успешный вход
        router.push(redirect)
        router.refresh()
        return
      }

      // Если пользователь не найден или неверный пароль - пробуем зарегистрировать
      if (signInError.message.includes('Invalid') || signInError.message.includes('credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
          }
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        // Успешная регистрация - входим
        router.push(redirect)
        router.refresh()
        return
      }

      // Другая ошибка
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Явный режим входа
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push(redirect)
      router.refresh()
      return
    }

    // Явный режим регистрации
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        }
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {loading ? "Загрузка..." : "Продолжить"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Мы автоматически определим нужно войти или создать новый аккаунт
      </p>
    </form>
  )
}

function OAuthSection() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  return (
    <div className="mt-6">
      <OAuthButtons redirectTo={redirect} />
    </div>
  )
}

function AuthFormWithOAuth() {
  return (
    <>
      <AuthForm />
      <Suspense fallback={<div className="mt-6 text-center text-sm text-muted-foreground">Загрузка...</div>}>
        <OAuthSection />
      </Suspense>
    </>
  )
}

export default function AuthPage() {
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

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle>Вход или регистрация</CardTitle>
            <CardDescription>
              Введите email и пароль - мы сами определим что нужно
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Загрузка...</div>}>
              <AuthFormWithOAuth />
            </Suspense>
          </CardContent>
        </Card>

        {/* Информация */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Как это работает?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>✅ Если аккаунт существует - войдете автоматически</p>
            <p>✅ Если нет - создадим новый профиль</p>
            <p>✅ Никаких лишних шагов и путаницы</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

