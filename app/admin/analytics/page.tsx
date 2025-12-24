import { getCurrentProfile } from "@/lib/actions/profile"
import { 
  getRevenueByPeriod, 
  getSubscriptionStats, 
  getRegistrationStats,
  getRecentTransactions 
} from "@/lib/actions/analytics"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile()

  // Проверка доступа: только для админов
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Загрузить все данные параллельно
  const [revenueResult, subscriptionsResult, registrationsResult, transactionsResult] = await Promise.all([
    getRevenueByPeriod(),
    getSubscriptionStats(),
    getRegistrationStats(),
    getRecentTransactions(10)
  ])

  const revenue = revenueResult.data
  const subscriptions = subscriptionsResult.data
  const registrations = registrationsResult.data
  const transactions = transactionsResult.data || []

  return (
    <div className="container mx-auto space-y-8 py-10">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">
            Статистика выручки и подписок
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            ← Назад в админ-панель
          </Button>
        </Link>
      </div>

      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Общая выручка */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Общая выручка
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenue?.totalRevenue.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenue?.transactionsCount} транзакций
            </p>
          </CardContent>
        </Card>

        {/* Активные подписки */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные подписки
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              из {subscriptions?.total} пользователей
            </p>
          </CardContent>
        </Card>

        {/* Средний чек */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Средний чек
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(revenue?.averageTransaction || 0).toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              за транзакцию
            </p>
          </CardContent>
        </Card>

        {/* Конверсия */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Конверсия
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registrations?.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              регистрация → оплата
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Выручка по тарифам и подписки по уровням */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Выручка по тарифам */}
        <Card>
          <CardHeader>
            <CardTitle>Выручка по тарифам</CardTitle>
            <CardDescription>
              Распределение выручки по уровням подписок
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Basic */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Basic</span>
                  <span className="font-semibold">
                    {revenue?.byTier.basic.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ 
                      width: `${revenue && revenue.totalRevenue > 0 
                        ? (revenue.byTier.basic / revenue.totalRevenue) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Pro */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Pro</span>
                  <span className="font-semibold">
                    {revenue?.byTier.pro.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ 
                      width: `${revenue && revenue.totalRevenue > 0 
                        ? (revenue.byTier.pro / revenue.totalRevenue) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Elite */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Elite</span>
                  <span className="font-semibold">
                    {revenue?.byTier.elite.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all"
                    style={{ 
                      width: `${revenue && revenue.totalRevenue > 0 
                        ? (revenue.byTier.elite / revenue.totalRevenue) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Подписчики по уровням */}
        <Card>
          <CardHeader>
            <CardTitle>Подписчики по уровням</CardTitle>
            <CardDescription>
              Количество пользователей на каждом тарифе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Free */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="font-medium text-sm">Free</span>
                </div>
                <span className="font-bold text-lg">{subscriptions?.byTier.free}</span>
              </div>

              {/* Basic */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-sm">Basic</span>
                </div>
                <span className="font-bold text-lg">{subscriptions?.byTier.basic}</span>
              </div>

              {/* Pro */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-sm">Pro</span>
                </div>
                <span className="font-bold text-lg">{subscriptions?.byTier.pro}</span>
              </div>

              {/* Elite */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="font-medium text-sm">Elite</span>
                </div>
                <span className="font-bold text-lg">{subscriptions?.byTier.elite}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Новые пользователи */}
      <Card>
        <CardHeader>
          <CardTitle>Рост пользовательской базы</CardTitle>
          <CardDescription>
            Новые регистрации за период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <ArrowUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations?.newThisWeek}</p>
                <p className="text-sm text-muted-foreground">За неделю</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations?.newThisMonth}</p>
                <p className="text-sm text-muted-foreground">За месяц</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations?.total}</p>
                <p className="text-sm text-muted-foreground">Всего</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Последние транзакции */}
      <Card>
        <CardHeader>
          <CardTitle>Последние транзакции</CardTitle>
          <CardDescription>
            10 последних платежей в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет транзакций
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Дата</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Пользователь</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Продукт</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Тип</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Сумма</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">
                        {new Date(tx.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 text-sm">{tx.user_email}</td>
                      <td className="py-3 text-sm">{tx.product_name}</td>
                      <td className="py-3 text-sm">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {tx.payment_type}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-semibold">
                        {tx.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-3 text-sm">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'succeeded' 
                            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}>
                          {tx.status === 'succeeded' ? 'Успешно' :
                           tx.status === 'pending' ? 'В обработке' :
                           'Отменен'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

