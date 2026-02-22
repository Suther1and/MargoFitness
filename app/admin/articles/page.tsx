import { getAdminArticles, getArticleStats } from '@/lib/actions/admin-articles'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { ArticlesAdminTable } from './articles-admin-table'
import { BookOpen, ArrowLeft, Info, Activity, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const [articlesResult, statsResult] = await Promise.all([
    getAdminArticles(),
    getArticleStats()
  ])

  const articles = articlesResult.data || []
  const statsData = statsResult.data || {
    total: 0,
    visible: 0,
    adminsOnly: 0,
    hidden: 0,
    isNew: 0,
    isUpdated: 0
  }

  const stats = [
    {
      label: 'Всего статей',
      value: statsData.total,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Видно всем',
      value: statsData.visible,
      icon: Eye,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Только админам',
      value: statsData.adminsOnly,
      icon: Activity,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Скрыто',
      value: statsData.hidden,
      icon: EyeOff,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Новые / Обновленные',
      value: `${statsData.isNew} / ${statsData.isUpdated}`,
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
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
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-orange-500/10 ring-1 ring-orange-500/20">
              <BookOpen className="size-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
                Управление статьями
              </h1>
              <p className="mt-1 text-white/60">
                Управление базой знаний, видимостью и порядком статей
              </p>
            </div>
          </div>
        </div>
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

      {/* Info Note */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-500/5 ring-1 ring-blue-500/10 p-6 border-l-4 border-blue-500/50">
        <div className="flex gap-4">
          <Info className="size-6 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Логика публикации</h3>
            <p className="text-sm text-white/60">
              Новые статьи по умолчанию видны только админам. После проверки измените статус на "Видна всем". 
              Статьи с флагом "NEW" или "UPDATED" получают соответствующий бейдж в списке материалов.
            </p>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Все статьи</h2>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs font-bold text-white/40 ring-1 ring-white/10">
              {articles.length}
            </span>
          </div>
        </div>

        <ArticlesAdminTable initialArticles={articles} />
      </section>
    </div>
  )
}
