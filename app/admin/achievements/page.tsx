import { getAdminAchievements } from '@/lib/actions/achievements'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { AchievementsTable } from './achievements-table'
import { Trophy, ArrowLeft, Plus, Search, Filter, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAchievementsPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const result = await getAdminAchievements()
  const achievements = result.data || []

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
              <Trophy className="size-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
                Достижения
              </h1>
              <p className="mt-1 text-white/60">
                Управление системой достижений и бонусов
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-500/5 ring-1 ring-blue-500/10 p-6 border-l-4 border-blue-500/50">
        <div className="flex gap-4">
          <Info className="size-6 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Важное примечание</h3>
            <p className="text-sm text-white/60">
              Изменение количества бонусов повлияет только на пользователей, которые получат достижение в будущем. 
              Уже выданные бонусы в истории транзакций пользователей останутся прежними.
            </p>
          </div>
        </div>
      </section>

      {/* Achievements List */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Все достижения</h2>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs font-bold text-white/40 ring-1 ring-white/10">
              {achievements.length}
            </span>
          </div>
        </div>

        <AchievementsTable initialAchievements={achievements as any} />
      </section>
    </div>
  )
}
