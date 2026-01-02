import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getPromoCodes } from '@/lib/actions/promo-codes'
import { CreatePromoDialog } from './create-promo-dialog'
import { PromoCodesList } from './promo-codes-list'
import { Tag, ArrowLeft, Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Промокоды | Админка',
  description: 'Управление промокодами',
}

export default async function PromoCodesPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const result = await getPromoCodes()
  const promoCodes = result.data || []

  const stats = [
    { label: 'Всего промокодов', value: promoCodes.length, icon: Ticket, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Активные', value: promoCodes.filter(p => p.is_active).length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Использований', value: promoCodes.reduce((sum, p) => sum + p.usage_count, 0), icon: Tag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Истекшие', value: promoCodes.filter(p => p.expires_at && new Date(p.expires_at) < new Date()).length, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10' },
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
            Промокоды
          </h1>
          <p className="mt-2 text-white/60">
            Управление скидочными кодами и маркетинговыми кампаниями
          </p>
        </div>
        <CreatePromoDialog />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 transition-all hover:ring-white/20">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.bg} blur-2xl pointer-events-none`} />
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/30">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold font-oswald text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Promo Codes List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Ticket className="size-5 text-rose-400" />
          <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Активные купоны</h2>
        </div>
        
        <PromoCodesList promoCodes={promoCodes} />
      </div>
    </div>
  )
}
