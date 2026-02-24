import { getAllUsers, getUsersStats } from '@/lib/actions/admin-users'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { UserTableRow } from './user-table-row'
import { Users, Search, X, ChevronLeft } from 'lucide-react'
import { FilterSelect } from './inline-edit-cell'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

interface SearchParams {
  role?: string
  tier?: string
  status?: string
  search?: string
  cashback_level?: string
  expired?: string
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
    search: (params.search || '').trim(),
    cashback_level: params.cashback_level || 'all',
    expired: params.expired || 'all',
  }

  // Загружаем данные последовательно, чтобы легче отлавливать ошибки и не перегружать БД
  const usersResult = await getAllUsers({
    role: filters.role !== 'all' ? filters.role : undefined,
    tier: filters.tier !== 'all' ? filters.tier : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    search: filters.search || undefined,
    cashback_level: filters.cashback_level !== 'all' ? filters.cashback_level : undefined,
    expired: filters.expired === 'true' ? 'true' : filters.expired === 'false' ? 'false' : undefined,
  })

  const statsResult = await getUsersStats()

  const users = usersResult.users || []
  const stats = statsResult.stats

  const statCards = stats ? [
    { label: 'Всего в базе', value: stats.total, color: 'text-white/60' },
    { label: 'Новые сегодня', value: (stats as any).newToday, color: 'text-orange-400' },
    { label: 'За неделю', value: (stats as any).newWeek, color: 'text-blue-400' },
    { label: 'Активные подписки', value: stats.activeSubscriptions, color: 'text-emerald-400' },
    { label: 'Pro/Elite', value: (stats as any).tierCounts ? (stats as any).tierCounts.pro + (stats as any).tierCounts.elite : 0, color: 'text-yellow-400' },
  ] : []

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group"
        >
          <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Назад</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-oswald uppercase">
            Пользователи
          </h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium mt-1">
            Управление доступом и базой
          </p>
        </div>
      </div>

      {/* Stats - Ultra Compact */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col gap-1"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{stat.label}</span>
            <div className={`text-xl font-bold font-oswald ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <form method="get" className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
            <input
              type="text"
              name="search"
              placeholder="Поиск по email или имени..."
              defaultValue={filters.search}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
            />
            {/* Скрытые поля для сохранения фильтров при поиске */}
            <input type="hidden" name="role" value={filters.role} />
            <input type="hidden" name="tier" value={filters.tier} />
            <input type="hidden" name="expired" value={filters.expired} />
          </form>
          
          <div className="flex items-center gap-2">
            <Suspense>
              <FilterSelect 
                name="role"
                defaultValue={filters.role}
                placeholder="Все роли"
                options={[
                  { value: 'user', label: 'Пользователь' },
                  { value: 'admin', label: 'Админ', className: 'text-purple-400' }
                ]}
              />

              <FilterSelect 
                name="tier"
                defaultValue={filters.tier}
                placeholder="Все тарифы"
                options={[
                  { value: 'free', label: 'Free' },
                  { value: 'basic', label: 'Basic', className: 'text-orange-400' },
                  { value: 'pro', label: 'Pro', className: 'text-purple-400' },
                  { value: 'elite', label: 'Elite', className: 'text-yellow-400' }
                ]}
              />

              <FilterSelect 
                name="expired"
                defaultValue={filters.expired}
                placeholder="Все сроки"
                options={[
                  { value: 'true', label: 'Истекшие', className: 'text-rose-400' },
                  { value: 'false', label: 'Активные', className: 'text-emerald-400' }
                ]}
              />
            </Suspense>
          </div>

          <div className="flex gap-2 ml-auto">
            <Link href="/admin/users" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 text-white/40">
              <X className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Users List */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Список пользователей</h2>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs font-bold text-white/40 ring-1 ring-white/10">
              {users.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[30%] text-center">Пользователь</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[15%] text-center">Тариф</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[20%] text-center">Истекает</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[15%] text-center">Бонусы</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[10%] text-center">Уровень</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[10%] text-center">Роль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <UserTableRow key={user.id} user={user} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
                        <Users className="size-8 text-white/20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/80 font-medium">Пользователи не найдены</p>
                        <p className="text-sm text-white/40">Попробуйте изменить параметры фильтрации</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
