'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { UserAvatar } from '@/components/user-avatar'
import { getUserFullDetails } from '@/lib/actions/admin-user-details'
import { updateUserProfile } from '@/lib/actions/admin-users'
import {
  getUserAuthLogs,
  getAdminNotes,
  saveAdminNote,
  deleteAdminNote,
} from '@/lib/actions/admin-user-extra'
import { InlineSelect, InlineNumberInput, InlineDateInput } from './inline-edit-cell'
import {
  ShoppingBag,
  Trophy,
  BookOpen,
  Dumbbell,
  User as UserIcon,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Plus,
  Minus,
  Zap,
  Trash2,
  Monitor,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Settings,
  Gift,
  LogIn,
  MessageSquare,
  ArrowUpCircle,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserDetailsSheetProps {
  userId: string | null
  onClose: () => void
}

function Section({
  title,
  icon: Icon,
  badge,
  defaultOpen = false,
  children,
  color = 'text-white/40',
}: {
  title: string
  icon: React.ElementType
  badge?: string | number
  defaultOpen?: boolean
  children: React.ReactNode
  color?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/[0.02] transition-colors active:bg-white/[0.04]"
      >
        <Icon className={cn('w-4 h-4 shrink-0', color)} />
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex-1 text-left">
          {title}
        </span>
        {badge !== undefined && (
          <span className="text-[10px] font-medium text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded tabular-nums">
            {badge}
          </span>
        )}
        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 text-white/15 transition-transform duration-200',
            open && 'rotate-90'
          )}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function Row({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between py-2 min-h-[36px]', className)}>
      <span className="text-[11px] text-white/30 font-medium shrink-0">{label}</span>
      <div className="text-sm text-white/70 font-medium text-right">{children}</div>
    </div>
  )
}

function fmtDate(
  d: string | null | undefined,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(
      'ru-RU',
      opts || { day: '2-digit', month: 'short', year: 'numeric' }
    )
  } catch {
    return '—'
  }
}

function UserDetailsContent({ userId }: UserDetailsSheetProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLogs, setAuthLogs] = useState<any[]>([])
  const [adminNotes, setAdminNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const result = await getUserFullDetails(userId)
        if (!cancelled && result.success) setData(result.data)
      } catch (e) {
        console.error('Error fetching user details:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const loadExtra = async () => {
      setIsLogsLoading(true)
      try {
        const [logsRes, notesRes] = await Promise.all([
          getUserAuthLogs(userId),
          getAdminNotes(userId),
        ])
        if (!cancelled) {
          if (logsRes.success) setAuthLogs(logsRes.data || [])
          if (notesRes.success) setAdminNotes(notesRes.data || [])
        }
      } catch (e) {
        console.error('Error fetching extra data:', e)
      } finally {
        if (!cancelled) setIsLogsLoading(false)
      }
    }

    load()
    loadExtra()
    return () => { cancelled = true }
  }, [userId])

  const handleSaveNote = async () => {
    if (!userId || !newNote.trim() || isSavingNote) return
    setIsSavingNote(true)
    try {
      const result = await saveAdminNote(userId, newNote)
      if (result.success) {
        setNewNote('')
        const notesRes = await getAdminNotes(userId)
        if (notesRes.success) setAdminNotes(notesRes.data || [])
      }
    } catch (e) {
      console.error('Error saving note:', e)
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Удалить заметку?')) return
    try {
      const result = await deleteAdminNote(noteId)
      if (result.success && userId) {
        const notesRes = await getAdminNotes(userId)
        if (notesRes.success) setAdminNotes(notesRes.data || [])
      }
    } catch (e) {
      console.error('Error deleting note:', e)
    }
  }

  const handleUpdate = async (field: string, value: unknown) => {
    if (!userId) return
    const updateData: Record<string, unknown> = { [field]: value }

    if (field === 'subscription_expires_at' && value !== null)
      updateData.subscription_status = 'active'
    if (field === 'subscription_expires_at' && value === null) {
      updateData.subscription_status = 'inactive'
      updateData.subscription_tier = 'free'
    }
    if (field === 'subscription_tier' && value === 'free') {
      updateData.subscription_expires_at = null
      updateData.subscription_status = 'inactive'
    }

    try {
      const result = await updateUserProfile(
        userId,
        updateData as Parameters<typeof updateUserProfile>[1]
      )
      if (result.success) {
        setData((prev: any) =>
          prev ? { ...prev, profile: { ...prev.profile, ...updateData } } : prev
        )
        router.refresh()
      }
    } catch (e) {
      console.error('Error updating user:', e)
    }
  }

  if (!userId) return null

  const user = data?.profile
  const stats = data?.stats
  const purchases: any[] = data?.purchases || []
  const intensives: any[] = data?.intensives || []
  const bonusTransactions: any[] = data?.bonusTransactions || []

  const tierOptions = [
    { value: 'free', label: 'FREE', className: 'text-white/40' },
    { value: 'basic', label: 'BASIC', className: 'text-orange-400' },
    { value: 'pro', label: 'PRO', className: 'text-purple-400' },
    { value: 'elite', label: 'ELITE', className: 'text-yellow-400' },
  ]

  const levelOptions = [
    { value: '1', label: '🥉 Bronze', className: 'text-amber-600' },
    { value: '2', label: '🥈 Silver', className: 'text-gray-300' },
    { value: '3', label: '🥇 Gold', className: 'text-yellow-400' },
    { value: '4', label: '💎 Platinum', className: 'text-purple-400' },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <SheetHeader className="sr-only">
        <SheetTitle>Карточка пользователя</SheetTitle>
        <SheetDescription>Профиль и управление пользователем</SheetDescription>
      </SheetHeader>

      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : user ? (
        <div className="flex-1 overflow-y-auto">
          {/* ── Profile Header ── */}
          <div className="p-4 pb-3">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <UserAvatar
                  fullName={user.full_name}
                  avatarUrl={user.avatar_url}
                  email={user.email}
                  className="w-12 h-12 rounded-xl ring-2 ring-white/[0.06]"
                />
                <button
                  onClick={() =>
                    handleUpdate('role', user.role === 'admin' ? 'user' : 'admin')
                  }
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center border transition-all active:scale-90',
                    user.role === 'admin'
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'bg-zinc-800 border-white/10 text-white/30 hover:text-white/60'
                  )}
                  title={user.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                >
                  <ShieldCheck className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-lg font-bold text-white truncate leading-tight">
                    {user.full_name || 'Без имени'}
                  </h2>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                      user.role === 'admin'
                        ? 'bg-purple-500/15 text-purple-400'
                        : 'bg-white/5 text-white/25'
                    )}
                  >
                    {user.role === 'admin' ? 'Админ' : 'Клиент'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
                <div
                  className="text-[10px] text-white/15 font-mono mt-1 truncate"
                  suppressHydrationWarning
                >
                  {user.id}
                </div>
              </div>
            </div>
          </div>

          {/* ── Subscription Bar ── */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <InlineSelect
                value={user.subscription_tier}
                options={tierOptions}
                onSave={(val) => handleUpdate('subscription_tier', val)}
                displayClassName={cn(
                  'h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border-0 ring-0',
                  user.subscription_tier === 'elite'
                    ? 'bg-yellow-400/15 text-yellow-400'
                    : user.subscription_tier === 'pro'
                      ? 'bg-purple-500/15 text-purple-400'
                      : user.subscription_tier === 'basic'
                        ? 'bg-orange-500/15 text-orange-400'
                        : 'bg-white/5 text-white/40'
                )}
              />
              <InlineDateInput
                value={user.subscription_expires_at}
                onSave={(val) => handleUpdate('subscription_expires_at', val)}
                disabled={user.subscription_tier === 'free'}
              />
              <div className="ml-auto text-right pl-2 shrink-0">
                <div className="text-[9px] text-white/20 font-medium uppercase tracking-wider leading-none">
                  LTV
                </div>
                <div
                  className="text-sm font-bold text-emerald-400 tabular-nums leading-tight font-oswald"
                  suppressHydrationWarning
                >
                  {user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                {
                  label: 'Трен.',
                  value: stats?.workoutsCompleted || 0,
                  icon: Dumbbell,
                  color: 'text-orange-400',
                },
                {
                  label: 'Стат.',
                  value: stats?.articlesRead || 0,
                  icon: BookOpen,
                  color: 'text-blue-400',
                },
                {
                  label: 'Бон.',
                  value: user.bonus_balance || 0,
                  icon: Trophy,
                  color: 'text-yellow-400',
                },
                {
                  label: 'Пок.',
                  value: purchases.length,
                  icon: ShoppingBag,
                  color: 'text-emerald-400',
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <s.icon className={cn('w-3.5 h-3.5 mb-1 opacity-50', s.color)} />
                  <span className="text-base font-bold text-white leading-none tabular-nums font-oswald">
                    {s.value}
                  </span>
                  <span className="text-[9px] text-white/20 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Physical Stats (if any) ── */}
          {(user.age || user.height || user.weight) && (
            <div className="px-4 pb-3">
              <div className="flex items-center justify-center gap-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs">
                {user.age && (
                  <span className="text-white/40">
                    <span className="text-white/60 font-medium">{user.age}</span> лет
                  </span>
                )}
                {user.height && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-white/40">
                      <span className="text-white/60 font-medium">{user.height}</span> см
                    </span>
                  </>
                )}
                {user.weight && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-white/40">
                      <span className="text-white/60 font-medium">{user.weight}</span> кг
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Collapsible Sections ── */}
          <div className="border-t border-white/[0.06]">
            {/* System */}
            <Section title="Система" icon={Settings} color="text-white/30" defaultOpen>
              <div className="divide-y divide-white/[0.04]">
                <Row label="Регистрация">
                  <span suppressHydrationWarning>{fmtDate(user.created_at)}</span>
                </Row>
                <Row label="Последний вход">
                  {authLogs.length > 0 ? (
                    <span
                      className="flex items-center gap-1.5"
                      suppressHydrationWarning
                    >
                      {authLogs[0].device_type === 'mobile' ? (
                        <Smartphone className="w-3 h-3 text-white/20" />
                      ) : (
                        <Monitor className="w-3 h-3 text-white/20" />
                      )}
                      {authLogs[0].city || '—'} ·{' '}
                      {fmtDate(authLogs[0].created_at, {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </Row>
              </div>

              <div className="flex gap-2 mt-3">
                {[
                  { icon: Send, active: !!user.telegram_id, label: 'TG' },
                  { icon: ExternalLink, active: !!user.yandex_id, label: 'YA' },
                  {
                    icon: UserIcon,
                    active: !!user.profile_completed_at,
                    label: 'Профиль',
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[10px] font-medium',
                      s.active
                        ? 'bg-white/[0.03] border-white/10 text-white/50'
                        : 'bg-transparent border-white/[0.04] text-white/10'
                    )}
                  >
                    <s.icon className="w-3 h-3" />
                    {s.label}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() =>
                    confirm('Сбросить пароль?') && alert('В разработке')
                  }
                  className="flex-1 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-semibold text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
                >
                  Сброс пароля
                </button>
                <button
                  onClick={() =>
                    prompt('Причина бана:') && alert('Забанен')
                  }
                  className="flex-1 py-2 rounded-lg bg-rose-500/[0.05] border border-rose-500/10 text-[10px] font-semibold text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-[0.98]"
                >
                  Бан
                </button>
              </div>
            </Section>

            {/* Loyalty */}
            <Section title="Лояльность" icon={Trophy} color="text-yellow-400/50">
              <div className="divide-y divide-white/[0.04]">
                <Row label="Уровень кэшбэка">
                  <InlineSelect
                    value={user.cashback_level?.toString() || '1'}
                    options={levelOptions}
                    onSave={(val) => handleUpdate('cashback_level', parseInt(val))}
                    displayClassName="h-7 px-2.5 rounded-lg border-0 ring-0 text-[11px] font-medium bg-white/[0.04] text-white/60"
                  />
                </Row>
                <Row label="Баланс бонусов">
                  <InlineNumberInput
                    value={user.bonus_balance || 0}
                    onSave={(val) => handleUpdate('bonus_balance', val)}
                    suffix="👟"
                  />
                </Row>
                <Row label="Общий LTV">
                  <span
                    className="text-emerald-400 font-semibold"
                    suppressHydrationWarning
                  >
                    {user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽
                  </span>
                </Row>
              </div>
            </Section>

            {/* Purchases */}
            <Section
              title="Покупки"
              icon={ShoppingBag}
              badge={purchases.length}
              color="text-emerald-400/50"
            >
              {purchases.length > 0 ? (
                <div>
                  {purchases.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          p.action === 'upgrade'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        )}
                      >
                        {p.action === 'upgrade' ? (
                          <ArrowUpCircle className="w-4 h-4" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/70 font-medium truncate">
                          {p.products?.name || p.product_id}
                        </div>
                        <div
                          className="text-[10px] text-white/25 flex items-center gap-1 flex-wrap"
                          suppressHydrationWarning
                        >
                          {fmtDate(p.created_at, { day: '2-digit', month: 'short' })}
                          {p.payment_provider && (
                            <>
                              <span className="text-white/10">·</span>
                              {p.payment_provider}
                            </>
                          )}
                          {p.promo_code && (
                            <>
                              <span className="text-white/10">·</span>
                              <span className="text-purple-400/60">
                                {p.promo_code}
                              </span>
                            </>
                          )}
                          {p.bonus_amount_used > 0 && (
                            <>
                              <span className="text-white/10">·</span>
                              <span className="text-yellow-400/60">
                                -{p.bonus_amount_used}👟
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="text-sm font-semibold text-emerald-400 tabular-nums"
                          suppressHydrationWarning
                        >
                          {p.actual_paid_amount?.toLocaleString('ru-RU')} ₽
                        </div>
                        {p.products?.price > p.actual_paid_amount && (
                          <div
                            className="text-[10px] text-white/15 line-through tabular-nums"
                            suppressHydrationWarning
                          >
                            {p.products.price.toLocaleString('ru-RU')} ₽
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[11px] text-white/15 italic">
                  Покупок нет
                </div>
              )}
            </Section>

            {/* Intensives */}
            <Section
              title="Интенсивы"
              icon={Zap}
              badge={intensives.length}
              color="text-orange-400/50"
            >
              {intensives.length > 0 ? (
                <div>
                  {intensives.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/70 font-medium truncate">
                          {item.products?.name}
                        </div>
                        <div className="text-[10px] text-white/25" suppressHydrationWarning>
                          {fmtDate(item.created_at, { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-sm font-semibold text-white/60 tabular-nums"
                          suppressHydrationWarning
                        >
                          {item.actual_paid_amount} ₽
                        </span>
                        <span className="text-[9px] font-medium text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ✓
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[11px] text-white/15 italic">
                  Интенсивов нет
                </div>
              )}
            </Section>

            {/* Activity */}
            <Section title="Активность" icon={Activity} color="text-blue-400/50">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-lg bg-orange-500/[0.04] border border-orange-500/10">
                  <Dumbbell className="w-4 h-4 text-orange-400/50 shrink-0" />
                  <div>
                    <div className="text-base font-bold text-white leading-none font-oswald">
                      {stats?.workoutsCompleted || 0}
                    </div>
                    <div className="text-[9px] text-white/25">тренировок</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-lg bg-blue-500/[0.04] border border-blue-500/10">
                  <BookOpen className="w-4 h-4 text-blue-400/50 shrink-0" />
                  <div>
                    <div className="text-base font-bold text-white leading-none font-oswald">
                      {stats?.articlesRead || 0}
                    </div>
                    <div className="text-[9px] text-white/25">статей</div>
                  </div>
                </div>
              </div>

              {data?.lastDiaryEntries?.length > 0 ? (
                <div>
                  <div className="text-[10px] text-white/20 font-medium mb-1.5 uppercase tracking-wider">
                    Дневник
                  </div>
                  {data.lastDiaryEntries.map((entry: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 text-xs"
                    >
                      <span className="text-white/40" suppressHydrationWarning>
                        {fmtDate(entry.date, { day: '2-digit', month: 'short' })}
                      </span>
                      <div className="flex gap-3 text-white/50 tabular-nums">
                        {entry.metrics?.weight && <span>{entry.metrics.weight} кг</span>}
                        {entry.metrics?.steps && (
                          <span suppressHydrationWarning>
                            {entry.metrics.steps.toLocaleString('ru-RU')} шагов
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-white/15 text-center py-3 italic">
                  Записей нет
                </div>
              )}
            </Section>

            {/* Bonuses */}
            <Section
              title="Бонусы"
              icon={Gift}
              badge={bonusTransactions.length}
              color="text-yellow-400/50"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-400/[0.04] border border-yellow-400/10 mb-3">
                <div>
                  <div className="text-[9px] text-yellow-400/40 font-medium uppercase tracking-wider leading-none mb-1">
                    Баланс
                  </div>
                  <div className="text-lg font-bold text-white leading-tight font-oswald">
                    {user.bonus_balance || 0}{' '}
                    <span className="text-sm">👟</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-white/20 font-medium uppercase tracking-wider leading-none mb-1">
                    LTV
                  </div>
                  <div
                    className="text-lg font-bold text-emerald-400 leading-tight font-oswald"
                    suppressHydrationWarning
                  >
                    {user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              {bonusTransactions.length > 0 ? (
                <div>
                  {bonusTransactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                          tx.amount > 0
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        )}
                      >
                        {tx.amount > 0 ? (
                          <Plus className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/60 truncate">
                          {tx.description || 'Операция'}
                        </div>
                        <div className="text-[10px] text-white/20" suppressHydrationWarning>
                          {fmtDate(tx.created_at, { day: '2-digit', month: 'short' })} ·{' '}
                          {tx.type}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums shrink-0',
                          tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-[11px] text-white/15 italic">
                  Операций нет
                </div>
              )}
            </Section>

            {/* Auth Logs */}
            <Section
              title="Входы"
              icon={LogIn}
              badge={authLogs.length}
              color="text-blue-400/50"
            >
              {authLogs.length > 0 ? (
                <div>
                  {authLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                    >
                      <div className="w-7 h-7 rounded-md bg-white/[0.03] flex items-center justify-center text-white/15 shrink-0">
                        {log.device_type === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/50 font-mono">
                          {log.ip_address}
                        </div>
                        <div className="text-[10px] text-white/20">
                          {log.browser} · {log.os}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-white/30" suppressHydrationWarning>
                          {fmtDate(log.created_at, { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-white/15" suppressHydrationWarning>
                          {new Date(log.created_at).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-[11px] text-white/15 italic">
                  {isLogsLoading ? 'Загрузка...' : 'Нет данных'}
                </div>
              )}
            </Section>

            {/* Admin Notes */}
            <Section
              title="Заметки"
              icon={MessageSquare}
              badge={adminNotes.length}
              color="text-orange-400/50"
            >
              <div className="relative mb-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Заметка..."
                  rows={2}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-orange-500/30 transition-colors placeholder:text-white/15"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || isSavingNote}
                  className="absolute bottom-2 right-2 px-3 py-1 rounded-md bg-orange-500 text-white text-[10px] font-semibold active:scale-95 transition-all disabled:opacity-30"
                >
                  {isSavingNote ? '...' : 'Сохранить'}
                </button>
              </div>

              {adminNotes.length > 0 && (
                <div className="space-y-2">
                  {adminNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 group/note"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-[10px] text-white/25"
                          suppressHydrationWarning
                        >
                          {note.admin?.full_name || 'Админ'} ·{' '}
                          {fmtDate(note.created_at, {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded hover:bg-rose-500/10 text-transparent group-hover/note:text-white/20 hover:!text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Bottom spacing for safe area */}
          <div className="h-8" />
        </div>
      ) : null}
    </div>
  )
}

export function UserDetailsSheet({ userId, onClose }: UserDetailsSheetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Sheet open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-[#0f0f13] border-white/[0.06] p-0 overflow-hidden flex flex-col"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement
          if (target?.closest('[data-radix-portal]')) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement
          if (target?.closest('[data-radix-portal]')) e.preventDefault()
        }}
      >
        <UserDetailsContent userId={userId} onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
