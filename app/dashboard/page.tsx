import { getCurrentProfile } from "@/lib/actions/profile"
import { getUserPurchasesWithProducts } from "@/lib/actions/products"
import { getCurrentWeekWithAccess } from "@/lib/actions/content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Crown, Dumbbell, Package, Calendar, TrendingUp, Settings, Mail, Phone } from "lucide-react"
import { getDaysUntilExpiration, isSubscriptionActive, getTierDisplayName } from "@/lib/access-control"
import { Suspense } from "react"
import PaymentSuccessAlert from "./payment-success-alert"
import { UserAvatar } from "@/components/user-avatar"
import { ProfileEditDialogWrapper } from "./profile-edit-wrapper"
import { SubscriptionManager } from "./subscription-manager"

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login?redirect=/dashboard')
  }

  const purchases = await getUserPurchasesWithProducts(profile.id)
  const weekData = await getCurrentWeekWithAccess()
  const stats = (profile.stats as any) || {}

  const subscriptionActive = isSubscriptionActive(profile)
  const daysLeft = getDaysUntilExpiration(profile)
  
  const accessibleWorkouts = weekData?.sessions.filter(s => s.hasAccess) || []
  const completedThisWeek = weekData?.sessions.filter(s => s.isCompleted).length || 0

  return (
    <div className="container mx-auto space-y-8 py-10">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <UserAvatar
              avatarUrl={profile.avatar_url}
              fullName={profile.full_name}
              email={profile.email}
              size="xl"
            />
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {profile.full_name || 'Пользователь'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Добро пожаловать в личный кабинет!
                  </p>
                </div>
                
                <ProfileEditDialogWrapper profile={profile} />
              </div>

              <div className="space-y-2">
                {profile.email && !profile.email.includes('@telegram.local') && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {!profile.phone && (!profile.email || profile.email.includes('@telegram.local')) && (
                  <p className="text-sm text-muted-foreground">
                    Добавьте контактную информацию
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <PaymentSuccessAlert />
      </Suspense>

      {profile.role === 'admin' && (
        <Card className="border-2 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Settings className="size-5" />
              Администратор
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              У вас есть доступ к панели администратора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button variant="outline" className="border-amber-300 dark:border-amber-700">
                Перейти в админ-панель
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Подписка</CardTitle>
            <Crown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTierDisplayName(profile.subscription_tier)}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionActive 
                ? `Активна ${daysLeft ? `(${daysLeft} дн.)` : ''}` 
                : 'Неактивна'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено за неделю</CardTitle>
            <Dumbbell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Из {weekData?.sessions.length || 0} доступных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доступных тренировок</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessibleWorkouts.length}</div>
            <p className="text-xs text-muted-foreground">
              На текущей неделе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Куплено паков</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">
              Программы в собственности
            </p>
          </CardContent>
        </Card>
      </div>

      {weekData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Текущая неделя
            </CardTitle>
            <CardDescription>
              {weekData.title} • {formatDateRange(weekData.start_date, weekData.end_date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {weekData.description}
              </p>
              <Link href="/workouts">
                <Button>
                  <Dumbbell className="mr-2 size-4" />
                  Смотреть тренировки
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <SubscriptionManager profile={profile} />

      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Мои покупки
            </CardTitle>
            <CardDescription>
              Программы тренировок, которые вы купили навсегда
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.map((purchase: any) => (
                <div key={purchase.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{purchase.product?.name || 'Программа'}</p>
                    <p className="text-sm text-muted-foreground">
                      Куплено {new Date(purchase.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{purchase.amount} ₽</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Link href="/workouts">
            <Button variant="outline" className="w-full">
              <Dumbbell className="mr-2 size-4" />
              Смотреть тренировки
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="w-full">
              <Crown className="mr-2 size-4" />
              Тарифы
            </Button>
          </Link>
          <Link href="/auth/logout">
            <Button variant="outline" className="w-full">
              Выйти
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}`
}
