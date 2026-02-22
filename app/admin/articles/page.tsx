import { getAdminArticles, getArticleStats } from '@/lib/actions/admin-articles'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { ArticlesAdminTable } from './articles-admin-table'
import { BookOpen, ArrowLeft, Activity, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react'

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
    isUpdated: 0,
    totalViews: 0
  }

  const stats = [
    {
      label: 'Статьи',
      value: statsData.total,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      description: 'Всего в базе'
    },
    {
      label: 'Просмотры',
      value: statsData.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      description: 'Общий охват'
    },
    {
      label: 'Видимость',
      customValue: (
        <div className="flex items-baseline gap-1.5">
          <span className="text-emerald-400" title="Всем">{statsData.visible}</span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-amber-400" title="Админам">{statsData.adminsOnly}</span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-red-400" title="Скрыто">{statsData.hidden}</span>
        </div>
      ),
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      description: 'Всем / Админ / Скрыто'
    },
    {
      label: 'Бейджи',
      customValue: (
        <div className="flex items-baseline gap-1.5">
          <span className="text-purple-400" title="New">{statsData.isNew}</span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-blue-400" title="Updated">{statsData.isUpdated}</span>
        </div>
      ),
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      description: 'New / Updated'
    }
  ]

  return (
    <div className="space-y-8 py-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-4 transition-all hover:bg-white/[0.04] hover:border-white/10"
          >
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`size-3.5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 truncate">
                    {stat.label}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-2xl font-bold font-oswald tracking-tight leading-none">
                  {'customValue' in stat ? stat.customValue : (
                    <span className={stat.color}>{stat.value}</span>
                  )}
                </div>
                <p className="mt-1.5 text-[9px] font-medium text-white/20 uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
