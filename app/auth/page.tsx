"use client"

import { useState, Suspense, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { OAuthButtons } from "@/components/oauth-buttons"
import { validateReferralCode } from "@/lib/actions/referrals"

function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<'auto' | 'login' | 'signup'>('auto')
  const [referralInfo, setReferralInfo] = useState<{ userName: string | null } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const refCode = searchParams.get('ref')

  // Проверяем реферальный код при загрузке
  useEffect(() => {
    if (refCode) {
      validateReferralCode(refCode).then((result) => {
        if (result.success && result.data) {
          setReferralInfo({ userName: result.data.userName })
          // Показываем toast
          const toast = document.createElement('div')
          toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom'
          toast.innerHTML = `🎁 ${result.data.userName ? `${result.data.userName} пригласил вас!` : 'Вы приглашены!'} Получите 250 шагов при регистрации`
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 5000)
        }
      })
    }
  }, [refCode])

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

    if (mode === 'auto') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError) {
        router.push(redirect)
        router.refresh()
        return
      }

      if (signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}${refCode ? `&ref=${refCode}` : ''}`,
            data: {
              ref_code: refCode || null
            }
          }
        })

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Неверный пароль')
          } else {
            setError(signUpError.message)
          }
          setLoading(false)
          return
        }

        // Если есть ref код, обрабатываем его сразу
        if (refCode && signUpData.user) {
          try {
            await fetch('/api/auth/process-referral', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId: signUpData.user.id, 
                refCode 
              })
            })
          } catch (err) {
            console.error('Failed to process referral:', err)
          }
        }

        router.push(redirect)
        router.refresh()
        return
      }

      setError('Неверный email или пароль')
      setLoading(false)
      return
    }

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

    if (mode === 'signup') {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}${refCode ? `&ref=${refCode}` : ''}`,
          data: {
            ref_code: refCode || null
          }
        }
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Если есть ref код, обрабатываем его сразу
      if (refCode && signUpData.user) {
        try {
          await fetch('/api/auth/process-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: signUpData.user.id, 
              refCode 
            })
          })
        } catch (err) {
          console.error('Failed to process referral:', err)
        }
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
  const refCode = searchParams.get('ref')
  
  return (
    <div className="mt-6">
      <OAuthButtons redirectTo={redirect} referralCode={refCode} />
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
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="size-8 text-primary" />
            <span className="text-2xl font-bold">MargoFitness</span>
          </Link>
        </div>

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

