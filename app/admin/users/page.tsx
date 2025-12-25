import { getAllUsers, getUsersStats } from '@/lib/actions/admin-users'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CancelSubscriptionButton } from './cancel-subscription-button'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { UserTableRow } from './user-table-row'

export const dynamic = 'force-dynamic'

interface SearchParams {
  role?: string
  tier?: string
  status?: string
  search?: string
  cashback_level?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const filters = {
    role: params.role || 'all',
    tier: params.tier || 'all',
    status: params.status || 'all',
    search: params.search || '',
    cashback_level: params.cashback_level || 'all',
  }

  const [usersResult, statsResult] = await Promise.all([
    getAllUsers({
      role: filters.role !== 'all' ? filters.role : undefined,
      tier: filters.tier !== 'all' ? filters.tier : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      search: filters.search || undefined,
      cashback_level: filters.cashback_level !== 'all' ? filters.cashback_level : undefined,
    }),
    getUsersStats(),
  ])

  const users = usersResult.users || []
  const stats = statsResult.stats

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <p className="text-muted-foreground">
            Список всех пользователей системы
          </p>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Всего</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Админов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Активных</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pro+</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.tierCounts.pro + stats.tierCounts.elite}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                name="search"
                placeholder="Поиск по email..."
                defaultValue={filters.search}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <select
              name="role"
              defaultValue={filters.role}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Все роли</option>
              <option value="user">Пользователь</option>
              <option value="admin">Админ</option>
            </select>

            <select
              name="tier"
              defaultValue={filters.tier}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Все тарифы</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>

            <select
              name="status"
              defaultValue={filters.status}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активна</option>
              <option value="inactive">Неактивна</option>
              <option value="canceled">Отменена</option>
            </select>

            <select
              name="cashback_level"
              defaultValue={filters.cashback_level}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Все уровни</option>
              <option value="1">🥉 Bronze</option>
              <option value="2">🥈 Silver</option>
              <option value="3">🥇 Gold</option>
              <option value="4">💎 Platinum</option>
            </select>

            <button 
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Применить
            </button>
            <Link href="/admin/users">
              <button 
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Сбросить
              </button>
            </Link>
          </form>
        </CardContent>
      </Card>

      {/* Таблица пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Тариф</th>
                  <th className="text-left p-2">Статус</th>
                  <th className="text-left p-2">Истекает</th>
                  <th className="text-left p-2">Бонусы</th>
                  <th className="text-left p-2">Уровень</th>
                  <th className="text-left p-2">Роль</th>
                  <th className="text-right p-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserTableRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Пользователи не найдены
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

