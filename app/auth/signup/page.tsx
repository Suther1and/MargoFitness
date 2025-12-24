"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Редирект на новую единую страницу /auth
export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Перенаправление...</span>
      </div>
    </div>
  )
}

