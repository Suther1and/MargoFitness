import { getCurrentProfile } from "@/lib/actions/profile"
import { 
  getRevenueByPeriod, 
  getSubscriptionStats, 
  getRegistrationStats,
  getRecentTransactions 
} from "@/lib/actions/analytics"
import { getAdminBonusStats } from "@/lib/actions/bonuses"
import { getAdminReferralStats } from "@/lib/actions/referrals"
import { getPromoCodeStats } from "@/lib/actions/promo-codes"
import { redirect } from "next/navigation"
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown, Gift, UserPlus, Tag, ArrowLeft, MoreHorizontal, Wallet, Sparkles } from "lucide-react"
import Link from "next/link"
import { CASHBACK_LEVELS } from "@/types/database"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const [
    revenueResult, 
    subscriptionsResult, 
    registrationsResult, 
    transactionsResult,
    bonusStatsResult,
    referralStatsResult,
    promoStatsResult
  ] = await Promise.all([
    getRevenueByPeriod(),
    getSubscriptionStats(),
    getRegistrationStats(),
    getRecentTransactions(10),
    getAdminBonusStats(),
    getAdminReferralStats(),
    getPromoCodeStats()
  ])

  const revenue = revenueResult.data
  const subscriptions = subscriptionsResult.data
  const registrations = registrationsResult.data
  const transactions = transactionsResult.data || []
  const bonusStats = bonusStatsResult.data
  const referralStats = referralStatsResult.data
  const promoStats = promoStatsResult.data

  const mainMetrics = [
    { 
      label: 'Общая выручка', 
      value: `${revenue?.totalRevenue.toLocaleString('ru-RU')} ₽`, 
      sub: `${revenue?.transactionsCount} транзакций`,
      icon: DollarSign, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Активные подписки', 
      value: subscriptions?.active, 
      sub: `из ${subscriptions?.total} пользователей`,
      icon: Activity, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Средний чек', 
      value: `${Math.round(revenue?.averageTransaction || 0).toLocaleString('ru-RU')} ₽`, 
      sub: 'за транзакцию',
      icon: TrendingUp, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10' 
    },
    { 
      label: 'Конверсия', 
      value: `${registrations?.conversionRate.toFixed(1)}%`, 
      sub: 'регистрация → оплата',
      icon: Users, 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/10' 
    }
  ]

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            <span>Назад в панель</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
            Аналитика
          </h1>
          <p className="mt-2 text-white/60">
            Детальный обзор финансовых показателей и роста платформы
          </p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, i) => (
          <div 
            key={i}
            className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8"
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${metric.bg} blur-2xl pointer-events-none`} />
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${metric.bg}`}>
                <metric.icon className={`size-5 ${metric.color}`} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-white/40">{metric.label}</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-oswald text-white">{metric.value}</div>
              <p className="text-xs text-white/40">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Tier */}
        <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Выручка по тарифам</h3>
            <div className="p-2 rounded-xl bg-white/5">
              <DollarSign className="size-5 text-white/20" />
            </div>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Basic', value: revenue?.byTier.basic || 0, color: 'bg-orange-500' },
              { label: 'Pro', value: revenue?.byTier.pro || 0, color: 'bg-purple-500' },
              { label: 'Elite', value: revenue?.byTier.elite || 0, color: 'bg-yellow-500' }
            ].map((tier, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/70">{tier.label}</span>
                  <span className="text-sm font-bold text-white">{tier.value.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${tier.color} transition-all duration-1000`}
                    style={{ 
                      width: `${revenue && revenue.totalRevenue > 0 
                        ? (tier.value / revenue.totalRevenue) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscriptions by Tier */}
        <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Подписчики по уровням</h3>
            <div className="p-2 rounded-xl bg-white/5">
              <Users className="size-5 text-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Free', count: subscriptions?.byTier.free || 0, color: 'text-gray-400', bg: 'bg-white/5' },
              { label: 'Basic', count: subscriptions?.byTier.basic || 0, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: 'Pro', count: subscriptions?.byTier.pro || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Elite', count: subscriptions?.byTier.elite || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
            ].map((tier, i) => (
              <div key={i} className={`p-4 rounded-2xl ${tier.bg} border border-white/5 flex flex-col items-center justify-center text-center`}>
                <span className={`text-2xl font-bold font-oswald ${tier.color}`}>{tier.count}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">{tier.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Growth Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="size-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Рост пользовательской базы</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'За неделю', value: registrations?.newThisWeek || 0, icon: ArrowUp, color: 'text-emerald-400' },
            { label: 'За месяц', value: registrations?.newThisMonth || 0, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Всего', value: registrations?.total || 0, icon: Users, color: 'text-purple-400' }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                <p className="text-3xl font-bold font-oswald text-white">{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5`}>
                <item.icon className={`size-6 ${item.color}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus System Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20">
            <Gift className="size-5 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Бонусная программа</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Выдано всего', value: <span className="flex items-center gap-1">{bonusStats?.totalBonusesIssued.toLocaleString('ru-RU')} <Sparkles className="w-4 h-4 text-amber-400" /></span>, sub: 'Начисления', color: 'text-amber-400' },
            { label: 'Потрачено', value: <span className="flex items-center gap-1">{bonusStats?.totalBonusesSpent.toLocaleString('ru-RU')} <Sparkles className="w-4 h-4 text-rose-400" /></span>, sub: 'На оплаты', color: 'text-rose-400' },
            { label: 'В обращении', value: <span className="flex items-center gap-1">{bonusStats?.totalBonusesInCirculation.toLocaleString('ru-RU')} <Sparkles className="w-4 h-4 text-blue-400" /></span>, sub: `Средний: ${bonusStats?.averageBalance || 0}`, color: 'text-blue-400' },
            { label: 'Рефералы', value: referralStats?.totalReferrals || 0, sub: `Активных: ${referralStats?.activeReferrals || 0}`, color: 'text-purple-400' }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.04] ring-1 ring-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">{item.label}</p>
              <p className={`text-2xl font-bold font-oswald ${item.color} mb-1`}>{item.value}</p>
              <p className="text-[10px] text-white/40">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cashback Levels */}
          <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Распределение кешбека</h4>
            <div className="space-y-4">
              {CASHBACK_LEVELS.map((level) => (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span>{level.icon}</span>
                      <span className="text-white/70">{level.name} ({level.percent}%)</span>
                    </span>
                    <span className="font-bold text-white">
                      {bonusStats?.usersByLevel[level.level] || 0}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                      style={{ 
                        width: `${bonusStats ? 
                          ((bonusStats.usersByLevel[level.level] || 0) / 
                          Object.values(bonusStats.usersByLevel).reduce((a, b) => a + (b as number), 0)) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Referral Stats */}
          <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Рефералы и выплаты</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <UserPlus className="size-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-oswald text-white">{referralStats?.totalReferrals || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Приглашено друзей</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <Wallet className="size-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-oswald text-white flex items-center gap-1">{referralStats?.totalBonusesPaid.toLocaleString('ru-RU')} <Sparkles className="w-5 h-5 text-amber-400" /></p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Выплачено бонусов</p>
                </div>
              </div>
            </div>
          </section>

          {/* Promo Stats */}
          <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Промокоды</h4>
              <Link href="/admin/promo-codes" className="text-[10px] font-bold uppercase text-orange-400 hover:underline">Управление</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 flex-1">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2.5 rounded-xl bg-rose-500/10">
                  <Tag className="size-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-oswald text-white">{promoStats?.totalPromoCodes || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Всего создано</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <TrendingUp className="size-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-oswald text-white">{promoStats?.totalUsage || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Использований</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Последние транзакции</h2>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs font-bold text-white/40 ring-1 ring-white/10">
              10 последних
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Дата</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Пользователь</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Продукт</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Тип</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Сумма</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white/80">
                        {new Date(tx.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {new Date(tx.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white/70 truncate max-w-[150px] block">
                      {tx.user_email}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white/70">
                      {tx.product_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-tight text-white/40">
                      {tx.payment_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-white">
                      {tx.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                      tx.status === 'succeeded' 
                        ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                        : tx.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30'
                    }`}>
                      {tx.status === 'succeeded' ? 'Успешно' :
                       tx.status === 'pending' ? 'В обработке' :
                       'Отменен'}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <p className="text-white/30 font-medium font-oswald uppercase tracking-widest">Нет транзакций</p>
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
