'use client'

import { useState } from 'react'
import { UserBonus, CashbackLevel, calculateLevelProgress, BonusTransaction } from '@/types/database'
import type { getReferralStats } from '@/lib/actions/referrals'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  Award, 
  Star, 
  ShoppingBag, 
  History, 
  Users,
  Link as LinkIcon,
  CreditCard,
  Check,
  Copy
} from 'lucide-react'

interface BonusesTabProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
    recentTransactions: BonusTransaction[]
  } | null
  referralStats: Awaited<ReturnType<typeof getReferralStats>>['data'] | undefined
  referralLink: string | null
  referralCode: string | null
  userId: string
}

export function BonusesTab({ bonusStats, referralStats, referralLink, referralCode, userId }: BonusesTabProps) {
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (!bonusStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="size-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* TOP SECTION: Card (1/3) & Status (2/3) */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Bonus Card (Left 1/3) */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-zinc-950 p-8 text-white shadow-2xl border border-white/5 min-h-[280px]">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>
          
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/40">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Баланс</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-amber-200">
                {bonusStats.levelData.name}
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-oswald font-black leading-none tracking-tight">
                  {bonusStats.account.balance.toLocaleString('ru-RU')}
                </span>
                <span className="text-lg text-white/40 font-oswald uppercase">шагов</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" />
                +150 в неделю
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Карта</span>
                <span className="font-mono text-lg tracking-[0.3em] text-white/60">**** {userId.slice(-4)}</span>
              </div>
              <div className="h-10 w-14 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Referral Status (Right 2/3) */}
        <div className="md:col-span-2 flex flex-col rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="mb-6 flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight flex items-center gap-3">
                Реферальный статус: {referralStats?.referralLevel || 1} уровень
                <span className="text-2xl">🏆</span>
              </h3>
              <p className="text-sm text-white/30 mt-1">Вы входите в число самых активных участников</p>
            </div>
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 text-blue-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-8 relative z-10">
            <div className="mb-3 flex justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
              <span className="text-white/40">Прогресс до уровня {referralStats?.progress.nextLevel || (referralStats?.referralLevel || 1) + 1}</span>
              <span className="text-blue-400">{referralStats?.progress.progress || 0}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out rounded-full" 
                style={{ width: `${referralStats?.progress.progress || 0}%` }}
              ></div>
            </div>
            <p className="mt-3 text-[11px] text-white/20">
              Нужно еще <span className="text-white/60 font-bold">{referralStats?.progress.remaining.toLocaleString('ru-RU') || 0} ₽</span> дохода для повышения
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-auto grid grid-cols-3 divide-x divide-white/[0.04] border-t border-white/[0.04] pt-6 relative z-10">
            <div className="px-2 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-1">Бонус</p>
              <p className="text-3xl font-bold text-white font-oswald">{referralStats?.referralPercent || 0}%</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-1">Заработано</p>
              <p className="text-3xl font-bold text-white font-oswald">{Math.floor((referralStats?.totalEarned || 0) / 1000)}k</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-1">Рефералы</p>
              <p className="text-3xl font-bold text-white font-oswald">{referralStats?.referrals.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Referral Link Block */}
      <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Реферальная программа</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Приглашайте друзей и получайте бонусы</h3>
            <p className="mt-2 text-white/40 text-sm leading-relaxed">
              Поделитесь ссылкой. Вы получите <span className="font-bold text-white/70">500 бонусов</span> за каждого друга после первой покупки и <span className="font-bold text-white/70">{referralStats?.referralPercent || 0}%</span> от всех его будущих оплат.
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2 rounded-2xl bg-white/[0.03] p-2 border border-white/[0.06] backdrop-blur-md">
            <LinkIcon className="ml-3 w-4 h-4 text-white/20" />
            <input 
              className="w-full bg-transparent border-none text-sm text-white/60 focus:ring-0 font-medium" 
              readOnly 
              type="text" 
              value={referralLink || ''}
            />
            <button 
              onClick={() => handleCopy(referralLink || '')}
              className="shrink-0 rounded-xl bg-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10 uppercase tracking-widest"
            >
              {copiedLink ? 'Готово' : 'Копировать'}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Referrals (2/3) & History (1/3) */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Referrals List (Left 2/3) */}
        <div className="md:col-span-2 flex flex-col rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-8 py-6">
            <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-tight">Ваши рефералы</h3>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/30 font-bold uppercase tracking-widest">
              Всего: {referralStats?.referrals.length || 0}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.01] text-[10px] uppercase text-white/20 font-bold tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-4">Пользователь</th>
                  <th className="px-8 py-4">Дата</th>
                  <th className="px-8 py-4">Статус</th>
                  <th className="px-8 py-4 text-right">Бонусы</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {referralStats?.referrals && referralStats.referrals.length > 0 ? (
                  referralStats.referrals.slice(0, 5).map((ref: any) => (
                    <tr key={ref.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            fullName={ref.referred_name} 
                            avatarUrl={ref.referred_avatar_url} 
                            className="w-10 h-10 rounded-xl border border-white/10 transition-transform group-hover:scale-110"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{ref.referred_name || 'Без имени'}</span>
                            <span className="text-[11px] text-white/20">{ref.referred_email || 'Email скрыт'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-white/30 font-medium">{new Date(ref.created_at).toLocaleDateString('ru-RU')}</td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/5 px-3 py-1 text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest border border-emerald-500/10">
                          Активен
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="font-oswald text-xl font-bold text-emerald-400">+{ref.total_earned?.toLocaleString('ru-RU') || 0}</span>
                          <span className="text-[10px] text-emerald-400/40 font-bold">👟</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10">
                        <Users className="w-12 h-12 mb-3" />
                        <p className="text-sm font-bold uppercase tracking-widest">Список пуст</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History (Right 1/3) */}
        <div className="flex flex-col rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-white/[0.04]">
            <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-tight">История</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-white/[0.02]">
            {bonusStats.recentTransactions.length > 0 ? (
              bonusStats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-white/[0.01] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors",
                      tx.amount > 0 
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/10" 
                        : "bg-white/5 border-white/10 text-white/40 group-hover:bg-white/10"
                    )}>
                      {tx.amount > 0 ? <ShoppingBag className="w-5 h-5" /> : <History className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/80 truncate group-hover:text-white transition-colors">{tx.description}</p>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">
                        {new Date(tx.created_at || '').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className={cn(
                      "font-oswald text-xl font-bold",
                      tx.amount > 0 ? "text-emerald-400" : "text-white/40"
                    )}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-10">
                <History className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest">Пусто</p>
              </div>
            )}
          </div>
          <div className="mt-auto border-t border-white/[0.04] p-6">
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em]">
              Вся история
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
