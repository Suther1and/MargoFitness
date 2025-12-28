import Link from "next/link"
import { getCurrentProfile } from "@/lib/actions/profile"
import { headers } from "next/headers"
import { AuthButton } from "./auth-button"

const colors = {
  background: '#0a0a0f',
  primary: '#f97316',
  secondary: '#ea580c',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  navbarBg: 'rgba(255, 255, 255, 0.08)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
}

export default async function NavbarNew() {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Скрываем навигацию на тестовых страницах дизайна
  if (pathname.startsWith("/design-test")) {
    return null
  }

  const profile = await getCurrentProfile()

  return (
    <div className="sticky top-0 z-50 px-4 py-4">
      <nav className="backdrop-blur-xl rounded-full shadow-2xl shadow-black/30" style={{
        background: colors.navbarBg,
        border: `1px solid ${colors.cardBorder}`
      }}>
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-4">
          <Link href="/home-new" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="flex text-white rounded-lg md:rounded-xl w-8 h-8 md:w-10 md:h-10 items-center justify-center shadow-lg" style={{
              background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 4px 20px ${colors.primary}40`
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6.5 6.5 11 11"></path>
                <path d="m21 21-1-1"></path>
                <path d="m3 3 1 1"></path>
                <path d="m18 22 4-4"></path>
                <path d="m2 6 4-4"></path>
                <path d="m3 10 7-7"></path>
                <path d="m14 21 7-7"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="uppercase leading-none text-base md:text-lg font-semibold tracking-tight" style={{ color: colors.textPrimary }}>MargoFitness</span>
              <span className="text-[0.55rem] uppercase tracking-widest hidden sm:block" style={{ color: colors.textSecondary }}>Elite Performance</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/home-new" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-80" style={{ color: colors.textPrimary }}>
              Главная
            </Link>
            <Link href="/home-new#pricing" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-100" style={{ color: colors.textSecondary }}>
              Тарифы
            </Link>
            <Link href="/free-content" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-100" style={{ color: colors.textSecondary }}>
              Бесплатное
            </Link>
            
            {profile && (
              <>
                <Link href="/dashboard-new" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-100" style={{ color: colors.textSecondary }}>
                  Кабинет
                </Link>
                {profile.role === 'admin' && (
                  <Link href="/admin" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-100" style={{ color: '#fbbf24' }}>
                    Админка
                  </Link>
                )}
              </>
            )}
          </div>

          {profile ? (
            <div className="flex items-center gap-2">
              {profile.avatar_url && (
                <Link href="/dashboard-new" className="flex items-center gap-2 hidden md:flex">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || profile.email || 'Avatar'} 
                    className="size-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                  />
                </Link>
              )}
              <Link href="/auth/logout" className="uppercase hover:opacity-80 transition-all flex text-xs font-semibold tracking-wider rounded-full py-2 px-4 md:px-5 gap-2 items-center backdrop-blur flex-shrink-0 active:scale-95" style={{
                color: colors.textPrimary,
                border: `1px solid ${colors.cardBorder}`,
                background: `${colors.textPrimary}0D`,
              }}>
                <span className="pointer-events-none">Выход</span>
              </Link>
            </div>
          ) : (
            <AuthButton />
          )}
        </div>
      </nav>
    </div>
  )
}

