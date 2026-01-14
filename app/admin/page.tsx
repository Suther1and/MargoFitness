import { getCurrentProfile } from "@/lib/actions/profile"
import { getRegistrationStats, getRevenueByPeriod } from "@/lib/actions/analytics"
import { redirect } from "next/navigation"
import { Calendar, BookOpen, Users, TrendingUp, Tag, ArrowRight, Settings, Activity, DollarSign, Percent, Trophy } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const [registrationsResult, revenueResult] = await Promise.all([
    getRegistrationStats(),
    getRevenueByPeriod()
  ])

  const statsData = registrationsResult.data
  const revenueData = revenueResult.data

  const stats = [
    {
      label: 'Пользователей',
      value: statsData?.total || 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'С подпиской',
      value: statsData?.withActiveSubscription || 0,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Заходов сегодня',
      value: statsData?.activeToday || 0,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Выручка',
      value: `${(revenueData?.totalRevenue || 0).toLocaleString('ru-RU')} ₽`,
      icon: DollarSign,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Конверсия',
      value: `${(statsData?.conversionRate || 0).toFixed(1)}%`,
      icon: Percent,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    }
  ]

  const navCards = [
    {
      title: 'Управление неделями',
      description: 'Создание и редактирование тренировочных недель',
      href: '/admin/weeks',
      icon: Calendar,
      color: 'text-purple-300',
      bg: 'bg-purple-500/10',
      ring: 'ring-purple-400/20',
      accent: 'from-purple-500/10'
    },
    {
      title: 'Пользователи',
      description: 'Управление подписками и ролями пользователей',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-300',
      bg: 'bg-blue-500/10',
      ring: 'ring-blue-400/20',
      accent: 'from-blue-500/10'
    },
    {
      title: 'Аналитика',
      description: 'Выручка, конверсия и статистика платежей',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      ring: 'ring-emerald-400/20',
      accent: 'from-emerald-500/10'
    },
    {
      title: 'Бесплатные материалы',
      description: 'Управление контентом для всех пользователей',
      href: '/admin/free-content',
      icon: BookOpen,
      color: 'text-orange-300',
      bg: 'bg-orange-500/10',
      ring: 'ring-orange-400/20',
      accent: 'from-orange-500/10'
    },
    {
      title: 'Промокоды',
      description: 'Создание скидок и маркетинговые акции',
      href: '/admin/promo-codes',
      icon: Tag,
      color: 'text-rose-300',
      bg: 'bg-rose-500/10',
      ring: 'ring-rose-400/20',
      accent: 'from-rose-500/10'
    },
    {
      title: 'Достижения',
      description: 'Управление системой достижений, условиями и бонусами',
      href: '/admin/achievements',
      icon: Trophy,
      color: 'text-yellow-300',
      bg: 'bg-yellow-500/10',
      ring: 'ring-yellow-400/20',
      accent: 'from-yellow-500/10'
    }
  ]

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 mb-6 backdrop-blur">
          <Settings className="size-4 text-orange-300" />
          <span className="text-sm text-orange-200/90">Управление платформой</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white font-oswald uppercase">
          Админ-панель
        </h1>
        <p className="mt-4 text-white/70 max-w-2xl text-lg">
          Добро пожаловать в центр управления MargoFitness. Здесь вы можете управлять контентом, пользователями и анализировать показатели.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/5 p-5 transition-all hover:bg-white/[0.06] hover:border-white/10"
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`size-3.5 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 truncate">
                  {stat.label}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-oswald tracking-tight ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Navigation Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white font-oswald uppercase tracking-tight">Разделы управления</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navCards.map((card, i) => (
            <Link key={i} href={card.href} className="group block h-full">
              <section className={`h-full relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 flex flex-col transition-all hover:ring-white/25 hover:shadow-2xl hover:shadow-black/50 active:scale-[0.98]`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} via-transparent to-transparent pointer-events-none`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${card.bg} ring-1 ${card.ring} flex items-center justify-center`}>
                      <card.icon className={`size-6 ${card.color}`} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="size-4 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1">
                    {card.description}
                  </p>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/40 uppercase tracking-widest group-hover:text-white/80 transition-colors">Перейти</span>
                    <div className="flex -space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')} opacity-40`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')} opacity-20`} />
                    </div>
                  </div>
                </div>
              </section>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Note */}
      <section className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 border-l-4 border-orange-500/50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-2 font-oswald uppercase tracking-tight">Подсказка</h3>
          <p className="text-sm text-white/60">
            Используйте боковую навигацию или карточки выше для быстрого доступа к разделам. Все изменения вступают в силу мгновенно для всех пользователей.
          </p>
        </div>
      </section>
    </div>
  )
}
