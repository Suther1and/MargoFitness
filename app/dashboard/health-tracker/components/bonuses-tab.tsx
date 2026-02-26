'use client'

import { useState } from 'react'
import { UserBonus, CashbackLevel, calculateLevelProgress, BonusTransaction, CASHBACK_LEVELS } from '@/types/database'
import type { getReferralStats } from '@/lib/actions/referrals'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
  Copy,
  Trophy,
  Sparkles,
  ChevronRight,
  ArrowRight,
  UserPlus,
  Settings,
  ArrowDownCircle
} from 'lucide-react'


import { getBonusTransactions } from '@/lib/actions/bonuses'

interface BonusesTabProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
    recentTransactions: BonusTransaction[]
    hasMoreTransactions?: boolean
  } | null
  referralStats: Awaited<ReturnType<typeof getReferralStats>>['data'] | undefined
  referralLink: string | null
  referralCode: string | null
  userId: string
  referralAchievements?: {
    mentor?: any
    advancedMentor?: any
    guru?: any
  }
}

const getBonusLevelStyles = (level: number) => {
  switch (level) {
    case 4: // Platinum
      return {
        gradient: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 25%, #dbeafe 50%, #94a3b8 100%)',
        badge: 'bg-slate-900/90 border-white/10 text-white',
        points: 'text-[#020617]',
        subtext: 'text-slate-600',
        cta: 'bg-slate-900 border-white/10 text-white hover:bg-black',
        icon: 'text-slate-800',
        shadow: 'shadow-blue-300/40',
        pattern: 'rgba(15, 23, 42, 0.1)',
        progressBar: 'bg-slate-900',
        progressTrack: 'bg-slate-950/10',
        circle: 'border-white/20'
      }
    case 3: // Gold
      return {
        gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #aa771c 100%)',
        badge: 'bg-amber-950/90 border-white/10 text-amber-50',
        points: 'text-[#2d1a0a]',
        subtext: 'text-amber-900/70',
        cta: 'bg-amber-950 border-white/10 text-amber-50 hover:bg-black',
        icon: 'text-amber-900',
        shadow: 'shadow-yellow-500/20',
        pattern: 'rgba(69, 26, 3, 0.12)',
        progressBar: 'bg-amber-950',
        progressTrack: 'bg-amber-950/10',
        circle: 'border-amber-900/10'
      }
    case 2: // Silver
      return {
        gradient: 'linear-gradient(135deg, #8e9196 0%, #ffffff 35%, #5c5f66 75%, #2a2c30 100%)',
        badge: 'bg-slate-900/90 border-white/10 text-slate-50',
        points: 'text-[#0f172a]',
        subtext: 'text-slate-600',
        cta: 'bg-slate-900 border-white/10 text-slate-50 hover:bg-black',
        icon: 'text-slate-800',
        shadow: 'shadow-slate-400/15',
        pattern: 'rgba(15, 23, 42, 0.08)',
        progressBar: 'bg-slate-900',
        progressTrack: 'bg-slate-900/10',
        circle: 'border-white/5'
      }
    default: // Bronze (1)
      return {
        gradient: 'linear-gradient(135deg, #b46d3e 0%, #dfa579 25%, #8c4a20 50%, #5d2e12 100%)',
        badge: 'bg-[#2d1a0a]/90 border-white/10 text-orange-50',
        points: 'text-[#1e0f04]',
        subtext: 'text-[#4a2e19]/70',
        cta: 'bg-[#2d1a0a] border-white/10 text-orange-50 hover:bg-black',
        icon: 'text-[#3e2614]',
        shadow: 'shadow-orange-900/20',
        pattern: 'rgba(255, 255, 255, 0.15)',
        progressBar: 'bg-[#2d1a0a]',
        progressTrack: 'bg-[#2d1a0a]/10',
        circle: 'border-white/5'
      }
  }
}

export function BonusesTab({ bonusStats, referralStats, referralLink, referralCode, userId, referralAchievements }: BonusesTabProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [transactions, setTransactions] = useState<BonusTransaction[]>(bonusStats?.recentTransactions || [])
  const [hasMore, setHasMore] = useState(bonusStats?.hasMoreTransactions || false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const result = await getBonusTransactions(userId, 20, transactions.length)
      if (result.success && result.data) {
        setTransactions(prev => [...prev, ...result.data!])
        setHasMore(result.hasMore || false)
      }
    } catch (error) {
      console.error('Failed to load more transactions:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

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

  const bonusStyles = getBonusLevelStyles(bonusStats.levelData.level)

  const getReferralStatusText = (level: number) => {
    switch (level) {
      case 1:
        return (
          <span className="flex items-center gap-1">
            Приглашай друзей и получай 3% <Sparkles className="w-3 h-3 text-current inline" /> с их покупок. На следующем уровне — 5%
          </span>
        )
      case 2:
        return (
          <span className="flex items-center gap-1">
            Твои рекомендации работают! Твоя новая цель — 7% <Sparkles className="w-3 h-3 text-current inline" /> за покупки друзей
          </span>
        )
      case 3:
        return (
          <span className="flex items-center gap-1">
            Ты — настоящий амбассадор! Еще немного до максимального бонуса 10% <Sparkles className="w-3 h-3 text-current inline" />
          </span>
        )
      case 4:
        return (
          <span className="flex items-center gap-1">
            Высший статус в Margo Fitness! Ты достигла максимума — 10% <Sparkles className="w-3 h-3 text-current inline" />
          </span>
        )
      default:
        return 'Приглашай друзей и получай бонусы с их покупок'
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* TOP SECTION: Card & Status */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Bonus Card (Left 5/12) */}
        <div className="md:col-span-5 relative group">
          <div 
            className={cn(
              "relative overflow-hidden rounded-[2rem] p-5 shadow-xl transition-all duration-300 flex flex-col justify-between",
              bonusStyles.shadow
            )}
            style={{ background: bonusStyles.gradient }}
          >
            {/* Diagonal Light Overlay */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none" 
              style={{ 
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 45%, transparent 60%)',
                backgroundSize: '200% auto'
              }} 
              />
            
            {/* Geometric Patterns overlay */}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                backgroundImage: `radial-gradient(circle at 1px 1px, ${bonusStyles.pattern} 1px, transparent 0)`, 
                backgroundSize: '20px 20px' 
              }}
            />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Trophy className={cn("w-4 h-4", bonusStyles.icon)} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 font-sans", bonusStyles.icon)}>Бонусы</span>
                </div>
                
                <div className={cn("relative overflow-hidden border rounded-lg px-2.5 h-6 flex items-center justify-center bg-black/20", bonusStyles.badge)}>
                  <span className="text-[10px] font-black tracking-widest relative z-10 uppercase font-sans leading-none">
                    {bonusStats.levelData.name}
                  </span>
                </div>
              </div>

              {/* Card Middle (Points) */}
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-1 font-sans leading-none", bonusStyles.subtext)}>баланс</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-5xl font-black font-oswald tracking-tight leading-none", bonusStyles.points)}>
                          {bonusStats.account.balance.toLocaleString('ru-RU')}
                        </span>
                        <Sparkles className={cn("w-5 h-5", bonusStyles.subtext)} />
                      </div>
                      
                      {/* Cashback Badge */}
                      <div className={cn(
                        "px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-tight font-sans flex items-center gap-1.5 shadow-sm bg-white/10 shrink-0",
                        bonusStyles.badge
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", bonusStyles.icon === bonusStyles.points ? "bg-current" : "bg-white")} />
                        <span>{bonusStats.levelData.percent}% кэшбэк</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className={cn("h-1.5 w-full rounded-full overflow-hidden", bonusStyles.progressTrack)}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${bonusStats.levelData.level === 4 ? 100 : bonusStats.progress.progress}%` }}
                      className={cn("h-full rounded-full", bonusStyles.progressBar)}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest font-sans", bonusStyles.subtext)}>
                      {bonusStats.levelData.level < 4 ? (
                        <>еще {bonusStats.progress.remaining.toLocaleString('ru-RU')} ₽ до {CASHBACK_LEVELS.find(l => l.level === bonusStats.levelData.level + 1)?.name}</>
                      ) : 'Максимальный уровень'}
                    </span>
                    <span className={cn("text-[10px] font-black font-oswald", bonusStyles.points)}>
                      {bonusStats.levelData.level === 4 ? '100%' : `${bonusStats.progress.progress}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-50 font-sans", bonusStyles.icon)}>Карта</span>
                  <span className={cn("font-mono text-sm tracking-[0.2em] font-bold", bonusStyles.points)}>**** {userId.slice(-4)}</span>
                </div>
                <button className={cn(
                  "bg-white/10 border text-[10px] font-black uppercase tracking-widest h-9 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg font-sans active:scale-95",
                  bonusStyles.cta
                )}>
                  <span>Использовать</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Status (Right 7/12) */}
        <div className="md:col-span-7 flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="mb-4 flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight flex items-center gap-3">
                Реферальный статус: {referralStats?.referralLevel || 1} уровень
                <span className="text-xl">🏆</span>
              </h3>
              <p className="text-[11px] text-white/30 mt-0.5">{getReferralStatusText(referralStats?.referralLevel || 1)}</p>
            </div>
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-2.5 text-blue-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-4 relative z-10">
            <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="text-white/40">Прогресс до уровня {referralStats?.progress.nextLevel || (referralStats?.referralLevel || 1) + 1}</span>
              <span className="text-blue-400">{referralStats?.progress.progress || 0}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out rounded-full" 
                style={{ width: `${referralStats?.progress.progress || 0}%` }}
              ></div>
            </div>
            <p className="mt-2 text-[10px] text-white/20 flex items-center gap-1">
              Получи еще <span className="text-white/60 font-bold">{referralStats?.progress.remaining.toLocaleString('ru-RU') || 0}</span>
              <Sparkles className="w-3 h-3 text-blue-400" />
              от покупок твоих рефералов для повышения
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-auto grid grid-cols-3 divide-x divide-white/[0.04] border-t border-white/[0.04] pt-4 relative z-10">
            <div className="px-2 text-center">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold mb-0.5">Бонус</p>
              <p className="text-2xl font-bold text-white font-oswald">{referralStats?.referralPercent || 0}%</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold mb-0.5">Заработано</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-white font-oswald">{Math.floor((referralStats?.totalEarned || 0) / 1000)}k</p>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="px-2 text-center">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold mb-0.5">Рефералы</p>
              <p className="text-2xl font-bold text-white font-oswald">{referralStats?.referrals.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Referral Link Block */}
      <div className="rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Реферальная программа</span>
            </div>
            <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-tight">Приглашай друзей и получай бонусы</h3>
            <p className="mt-1 text-white/40 text-xs leading-relaxed">
              {(() => {
                const mentor = referralAchievements?.mentor
                const advancedMentor = referralAchievements?.advancedMentor
                const guru = referralAchievements?.guru
                const percent = referralStats?.referralPercent || 0

                if (!mentor?.isUnlocked) {
                  return (
                    <>Ты получишь <span className="font-bold text-white/70">500 бонусов</span> за первого друга после его первой покупки и <span className="font-bold text-white/70">{percent}%</span> <Sparkles className="w-3 h-3 text-current inline" /> от всех его будущих покупок.</>
                  )
                }

                if (!advancedMentor?.isUnlocked) {
                  const remaining = Math.max(0, (advancedMentor?.targetValue || 3) - (advancedMentor?.currentValue || 0))
                  return (
                    <>Пригласи еще <span className="font-bold text-white/70">{remaining}</span> {remaining === 1 ? 'друга' : 'друзей'} для получения <span className="font-bold text-white/70">750</span> <Sparkles className="w-3 h-3 text-current inline" />. Ты получаешь <span className="font-bold text-white/70">{percent}%</span> <Sparkles className="w-3 h-3 text-current inline" /> от всех покупок своих друзей.</>
                  )
                }

                if (!guru?.isUnlocked) {
                  const remaining = Math.max(0, (guru?.targetValue || 5) - (guru?.currentValue || 0))
                  return (
                    <>Пригласи еще <span className="font-bold text-white/70">{remaining}</span> {remaining === 1 ? 'друга' : 'друзей'} для получения <span className="font-bold text-white/70">1000</span> <Sparkles className="w-3 h-3 text-current inline" />. Ты получаешь <span className="font-bold text-white/70">{percent}%</span> <Sparkles className="w-3 h-3 text-current inline" /> от всех покупок своих друзей.</>
                  )
                }

                return (
                  <>Ты получаешь <span className="font-bold text-white/70">{percent}%</span> <Sparkles className="w-3 h-3 text-current inline" /> от всех покупок своих друзей.</>
                )
              })()}
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-white/[0.03] p-1.5 border border-white/[0.06] backdrop-blur-md">
            <LinkIcon className="ml-3 w-3.5 h-3.5 text-white/20" />
            <input 
              className="w-full bg-transparent border-none text-xs text-white/60 focus:ring-0 font-medium" 
              readOnly 
              type="text" 
              value={referralLink || ''}
            />
            <button 
              onClick={() => handleCopy(referralLink || '')}
              className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-[10px] font-bold text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10 uppercase tracking-widest"
            >
              {copiedLink ? 'Готово' : 'Копировать'}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Referrals & History */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Referrals List (Left 7/12) */}
        <div className="md:col-span-7 flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-5">
            <h3 className="text-base font-bold text-white font-oswald uppercase tracking-tight">Ваши рефералы</h3>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/30 font-bold uppercase tracking-widest">
              Всего: {referralStats?.referrals.length || 0}
            </div>
          </div>
          <div className="w-full">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs min-w-[500px] md:min-w-0">
                <thead className="bg-white/[0.01] text-[9px] uppercase text-white/20 font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-3.5">Пользователь</th>
                    <th className="px-6 py-3.5">Дата</th>
                    <th className="px-6 py-3.5">Статус</th>
                    <th className="px-6 py-3.5 text-right">Бонусы</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {referralStats?.referrals && referralStats.referrals.length > 0 ? (
                    referralStats.referrals.slice(0, 5).map((ref: any) => (
                      <tr key={ref.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              fullName={ref.referred_name} 
                              avatarUrl={ref.referred_avatar_url} 
                              className="w-9 h-9 rounded-xl border border-white/10 transition-transform group-hover:scale-105"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{ref.referred_name || 'Без имени'}</span>
                              <span className="text-[10px] text-white/20 truncate">{ref.referred_email || 'Email скрыт'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/30 font-medium">{new Date(ref.created_at).toLocaleDateString('ru-RU')}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/5 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest border border-emerald-500/10">
                            Активен
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="font-oswald text-lg font-bold text-emerald-400">+{ref.total_earned?.toLocaleString('ru-RU') || 0}</span>
                            <Sparkles className="w-3 h-3 text-emerald-400/40" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center opacity-10">
                          <Users className="w-10 h-10 mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Список пуст</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transaction History (Right 5/12) */}
        <div className="md:col-span-5 flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-sm overflow-hidden min-w-0">
          <div className="px-6 py-5 border-b border-white/[0.04]">
            <h3 className="text-base font-bold text-white font-oswald uppercase tracking-tight">История</h3>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-[400px] divide-y divide-white/[0.02] custom-scrollbar">
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                let Icon = History
                let iconColor = "text-white/40"
                let bgColor = "bg-white/5 border-white/10"

                if (tx.type === 'cashback') {
                  Icon = ShoppingBag
                  iconColor = "text-emerald-400"
                  bgColor = "bg-emerald-500/5 border-emerald-500/10"
                } else if (tx.type === 'referral_bonus' || tx.type === 'referral_income') {
                  Icon = UserPlus
                  iconColor = "text-blue-400"
                  bgColor = "bg-blue-500/5 border-blue-500/10"
                } else if (tx.type === 'achievement') {
                  Icon = Trophy
                  iconColor = "text-amber-400"
                  bgColor = "bg-amber-500/5 border-amber-500/10"
                } else if (tx.type === 'admin_adjustment') {
                  Icon = Settings
                  iconColor = "text-purple-400"
                  bgColor = "bg-purple-500/5 border-purple-500/10"
                } else if (tx.amount < 0) {
                  Icon = ArrowDownCircle
                  iconColor = "text-rose-400"
                  bgColor = "bg-rose-500/5 border-rose-500/10"
                }

                return (
                  <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-white/[0.01] transition-colors group">
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                        bgColor,
                        iconColor
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-1">
                          {new Date(tx.created_at || '').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xs font-bold text-white/80 truncate group-hover:text-white transition-colors">{tx.description}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className={cn(
                        "font-oswald text-lg font-bold",
                        tx.amount > 0 ? "text-emerald-400" : "text-white/40"
                      )}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                      <Sparkles className={cn(
                        "w-3 h-3",
                        tx.amount > 0 ? "text-emerald-400/40" : "text-white/20"
                      )} />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-16 text-center opacity-10">
                <History className="w-10 h-10 mx-auto mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Пусто</p>
              </div>
            )}
          </div>
          <div className="mt-auto border-t border-white/[0.04] p-5">
            {hasMore && (
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? 'Загрузка...' : 'Вся история'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
