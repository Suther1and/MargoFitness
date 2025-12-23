"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Используем полный редирект для гарантированной перезагрузки
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    }

    handleLogout()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card>
        <CardHeader>
          <CardTitle>Выход из аккаунта</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin" />
          <span>Выходим из системы...</span>
        </CardContent>
      </Card>
    </div>
  )
}

