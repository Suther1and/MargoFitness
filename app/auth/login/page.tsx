"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

function LoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    const url = redirect ? `/auth?redirect=${redirect}` : '/auth'
    router.replace(url)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Перенаправление...</span>
      </div>
    </div>
  )
}

// Редирект на новую единую страницу /auth
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    }>
      <LoginRedirect />
    </Suspense>
  )
}
