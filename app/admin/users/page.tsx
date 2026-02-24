import { getAllUsers, getUsersStats } from '@/lib/actions/admin-users'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CancelSubscriptionButton } from './cancel-subscription-button'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { UserTableRow } from './user-table-row'
import { Users, ShieldCheck, Zap, Star, Search, Filter, X } from 'lucide-react'

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
    search: (params.search || '').trim(),
    cashback_level: params.cashback_level || 'all',
  }

  // Загружаем данные последовательно, чтобы легче отлавливать ошибки и не перегружать БД
  const usersResult = await getAllUsers({
    role: filters.role !== 'all' ? filters.role : undefined,
    tier: filters.tier !== 'all' ? filters.tier : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    search: filters.search || undefined,
    cashback_level: filters.cashback_level !== 'all' ? filters.cashback_level : undefined,
  })

  const statsResult = await getUsersStats()

  const users = usersResult.users || []
  const stats = statsResult.stats

  const statCards = stats ? [
    { label: 'Всего пользователей', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Администраторы', value: stats.admins, icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Активные подписки', value: stats.activeSubscriptions, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Пользователи Pro+', value: stats.tierCounts.pro + stats.tierCounts.elite, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ] : []

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-4"
          >
            <X className="size-4" />
            <span>Назад в панель</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
            Пользователи
          </h1>
          <p className="mt-2 text-white/60">
            Управление всей базой пользователей и их правами доступа
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div 
            key={i}
            className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6"
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.bg} blur-2xl pointer-events-none`} />
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-white/50">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold font-oswald text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="size-4 text-orange-300" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Фильтры поиска</h2>
        </div>

        <form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="lg:col-span-2 xl:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input
              type="text"
              name="search"
              placeholder="Поиск по email или имени..."
              defaultValue={filters.search}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          
          <select
            name="role"
            defaultValue={filters.role}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#1a1a24]">Все роли</option>
            <option value="user" className="bg-[#1a1a24]">Пользователь</option>
            <option value="admin" className="bg-[#1a1a24]">Админ</option>
          </select>

          <select
            name="tier"
            defaultValue={filters.tier}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#1a1a24]">Все тарифы</option>
            <option value="free" className="bg-[#1a1a24]">Free</option>
            <option value="basic" className="bg-[#1a1a24]">Basic</option>
            <option value="pro" className="bg-[#1a1a24]">Pro</option>
            <option value="elite" className="bg-[#1a1a24]">Elite</option>
          </select>

          <select
            name="status"
            defaultValue={filters.status}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#1a1a24]">Все статусы</option>
            <option value="active" className="bg-[#1a1a24]">Активна</option>
            <option value="inactive" className="bg-[#1a1a24]">Неактивна</option>
            <option value="canceled" className="bg-[#1a1a24]">Отменена</option>
          </select>

          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-500/20"
            >
              Найти
            </button>
            <Link href="/admin/users" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 text-white/60">
              <X className="size-5" />
            </Link>
          </div>
        </form>
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
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[25%]">Пользователь</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[12%]">Тариф</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[15%]">Истекает</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[12%]">Бонусы</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[12%]">Уровень</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-[12%]">Роль</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right w-[12%]">Действия</th>
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
