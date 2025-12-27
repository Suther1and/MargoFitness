import Link from "next/link"
import { getCurrentProfile } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Dumbbell, Menu, X } from "lucide-react"
import { headers } from "next/headers"

export default async function Navbar() {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Скрываем навигацию на тестовых страницах дизайна
  if (pathname.startsWith("/design-test")) {
    return null
  }

  const profile = await getCurrentProfile()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Dumbbell className="size-6 text-primary" />
          <span>MargoFitness</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Главная
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Тарифы
          </Link>

          {profile ? (
            <>
              <Link href="/free-content" className="text-sm font-medium hover:text-primary transition-colors">
                Бесплатное
              </Link>
              
              {profile.subscription_tier !== 'free' && (
                <Link href="/workouts" className="text-sm font-medium hover:text-primary transition-colors">
                  Тренировки
                </Link>
              )}
              
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Кабинет
              </Link>

              <Link href="/dashboard/bonuses" className="text-sm font-medium hover:text-primary transition-colors">
                👟 Бонусы
              </Link>

              {profile.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors">
                  Админка
                </Link>
              )}

              {profile.avatar_url && (
                <Link href="/dashboard" className="flex items-center gap-2">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || profile.email || 'Avatar'} 
                    className="size-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                  />
                </Link>
              )}

              <Link href="/auth/logout">
                <Button variant="ghost" size="sm">
                  Выход
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button size="sm">
                  Вход / Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <details className="dropdown">
            <summary className="btn btn-ghost">
              <Menu className="size-6" />
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg">
              <div className="flex flex-col p-2 gap-1">
                <Link href="/" className="px-3 py-2 text-sm hover:bg-muted rounded">
                  Главная
                </Link>
                <Link href="/pricing" className="px-3 py-2 text-sm hover:bg-muted rounded">
                  Тарифы
                </Link>

                {profile ? (
                  <>
                    <Link href="/free-content" className="px-3 py-2 text-sm hover:bg-muted rounded">
                      Бесплатное
                    </Link>
                    {profile.subscription_tier !== 'free' && (
                      <Link href="/workouts" className="px-3 py-2 text-sm hover:bg-muted rounded">
                        Тренировки
                      </Link>
                    )}
                    <Link href="/dashboard" className="px-3 py-2 text-sm hover:bg-muted rounded">
                      Кабинет
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="px-3 py-2 text-sm text-amber-600 hover:bg-muted rounded">
                        Админка
                      </Link>
                    )}
                    <div className="border-t my-1"></div>
                    <Link href="/auth/logout" className="px-3 py-2 text-sm hover:bg-muted rounded">
                      Выход
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="border-t my-1"></div>
                    <Link href="/auth" className="px-3 py-2 text-sm hover:bg-muted rounded">
                      Вход / Регистрация
                    </Link>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </nav>
  )
}

