"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

function LoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    const ref = searchParams.get('ref')
    
    let targetUrl = '/'
    const params = new URLSearchParams()
    
    if (ref) params.append('ref', ref)
    if (redirect) params.append('redirect', redirect)
    
    if (params.toString()) {
      targetUrl = `/?${params.toString()}`
    }
    
    router.replace(targetUrl)
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

// Редирект со старой страницы /auth/login на главную
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

