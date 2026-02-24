'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ChevronDown,
  ShieldCheck,
  ArrowUpCircle,
  RefreshCw,
  Activity,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserDetailsSheetProps {
  userId: string | null
  onClose: () => void
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

function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs > 10 && abs < 20) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-xs text-white/30 italic">{text}</div>
  )
}

function purchaseIcon(action: string) {
  switch (action) {
    case 'upgrade':
      return { Icon: ArrowUpCircle, bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Апгрейд' }
    case 'renewal':
      return { Icon: RefreshCw, bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Продление' }
    default:
      return { Icon: ShoppingBag, bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Покупка' }
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
  const [logsExpanded, setLogsExpanded] = useState(false)
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
    return () => {
      cancelled = true
    }
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
    { value: 'free', label: 'Free', className: 'text-white/50' },
    { value: 'basic', label: 'Basic', className: 'text-orange-400' },
    { value: 'pro', label: 'Pro', className: 'text-purple-400' },
    { value: 'elite', label: 'Elite', className: 'text-yellow-400' },
  ]

  const levelOptions = [
    { value: '1', label: '🥉 Bronze', className: 'text-amber-600' },
    { value: '2', label: '🥈 Silver', className: 'text-gray-300' },
    { value: '3', label: '🥇 Gold', className: 'text-yellow-400' },
    { value: '4', label: '💎 Platinum', className: 'text-purple-400' },
  ]

  const metricBtn = 'h-8 px-3 rounded-lg text-xs font-medium bg-white/[0.05] border border-white/[0.08] ring-0'

  const tierColor =
    user?.subscription_tier === 'elite'
      ? 'text-yellow-400'
      : user?.subscription_tier === 'pro'
        ? 'text-purple-400'
        : user?.subscription_tier === 'basic'
          ? 'text-orange-400'
          : 'text-white/50'

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <SheetHeader className="sr-only">
        <SheetTitle>Карточка пользователя</SheetTitle>
        <SheetDescription>Профиль и управление</SheetDescription>
      </SheetHeader>

      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : user ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ═══════════════════════ HEADER ═══════════════════════ */}
          <div className="shrink-0 px-4 pt-4 pb-0">
            {/* Identity */}
            <div className="flex items-start gap-3 pb-3">
              <div className="relative shrink-0">
                <UserAvatar
                  fullName={user.full_name}
                  avatarUrl={user.avatar_url}
                  email={user.email}
                  className="w-11 h-11 rounded-xl ring-2 ring-white/[0.06]"
                />
                <button
                  onClick={() =>
                    handleUpdate('role', user.role === 'admin' ? 'user' : 'admin')
                  }
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center border transition-all active:scale-90',
                    user.role === 'admin'
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'bg-zinc-800 border-white/10 text-white/40 hover:text-white/70'
                  )}
                  title={user.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                >
                  <ShieldCheck className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-base font-bold text-white truncate leading-tight">
                    {user.full_name || 'Без имени'}
                  </h2>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                      user.role === 'admin'
                        ? 'bg-purple-500/15 text-purple-400'
                        : 'bg-white/5 text-white/30'
                    )}
                  >
                    {user.role === 'admin' ? 'Админ' : 'Клиент'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Mail className="w-3 h-3 shrink-0 text-white/25" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                    <Phone className="w-3 h-3 shrink-0 text-white/20" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription + Loyalty — unified button style */}
            <div className="py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 flex-wrap">
                <InlineSelect
                  value={user.subscription_tier}
                  options={tierOptions}
                  onSave={(val) => handleUpdate('subscription_tier', val)}
                  displayClassName={cn(metricBtn, 'font-bold uppercase tracking-wide text-[10px]', tierColor)}
                />
                <InlineDateInput
                  value={user.subscription_expires_at}
                  onSave={(val) => handleUpdate('subscription_expires_at', val)}
                  disabled={user.subscription_tier === 'free'}
                />
                <InlineSelect
                  value={user.cashback_level?.toString() || '1'}
                  options={levelOptions}
                  onSave={(val) => handleUpdate('cashback_level', parseInt(val))}
                  displayClassName={cn(metricBtn, 'text-white/60')}
                />
                <InlineNumberInput
                  value={user.bonus_balance || 0}
                  onSave={(val) => handleUpdate('bonus_balance', val)}
                  suffix="👟"
                />
                <div className="ml-auto shrink-0">
                  <span className="text-[9px] text-white/25 uppercase tracking-wider">LTV </span>
                  <span
                    className="text-sm font-bold text-emerald-400 tabular-nums font-oswald"
                    suppressHydrationWarning
                  >
                    {user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Stats — 1 row compact */}
            <div className="py-2.5 border-t border-white/[0.06] text-[11px] text-white/45 leading-relaxed">
              <div className="flex items-center gap-x-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-orange-400/40" />
                  <b className="text-white/60 font-medium tabular-nums">
                    {stats?.workoutsCompleted || 0}
                  </b>{' '}
                  трен.
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-400/40" />
                  <b className="text-white/60 font-medium tabular-nums">
                    {stats?.articlesRead || 0}
                  </b>{' '}
                  стат.
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-emerald-400/40" />
                  <b className="text-white/60 font-medium tabular-nums">
                    {purchases.length + intensives.length}
                  </b>{' '}
                  пок.
                </span>
                {(user.age || user.height || user.weight) && (
                  <>
                    <span className="text-white/[0.06]">|</span>
                    <div className="flex items-center gap-x-2 text-white/35">
                      {user.age && <span>{user.age} лет</span>}
                      {user.height && <span>{user.height} см</span>}
                      {user.weight && <span>{user.weight} кг</span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════ TABS ═══════════════════════ */}
          <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
            <TabsList className="shrink-0 w-full h-10 bg-transparent rounded-none border-y border-white/[0.06] p-0 gap-0">
              {[
                { value: 'info', icon: Settings, label: 'Инфо' },
                { value: 'purchases', icon: ShoppingBag, label: 'Покупки' },
                { value: 'bonuses', icon: Trophy, label: 'Бонусы' },
                { value: 'activity', icon: Activity, label: 'Актив.' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 h-full gap-1.5 rounded-none text-[10px] uppercase tracking-wider font-semibold text-white/35 data-[state=active]:text-white/80 data-[state=active]:bg-white/[0.03] border-b-2 border-transparent data-[state=active]:border-orange-500 transition-all"
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* ── TAB: Info ── */}
              <TabsContent value="info" className="m-0 p-4 space-y-5">
                {/* System */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">
                    Система
                  </div>
                  <div className="flex justify-between items-center py-1.5 text-xs">
                    <span className="text-white/40">Регистрация</span>
                    <span className="text-white/65" suppressHydrationWarning>
                      {fmtDate(user.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 text-xs">
                    <span className="text-white/40">ID</span>
                    <span className="text-white/35 font-mono text-[10px] truncate max-w-[200px]">
                      {user.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 text-xs">
                    <span className="text-white/40">Последний вход</span>
                    {authLogs.length > 0 ? (
                      <span
                        className="text-white/60 flex items-center gap-1"
                        suppressHydrationWarning
                      >
                        {authLogs[0].device_type === 'mobile' ? (
                          <Smartphone className="w-3 h-3 text-white/25" />
                        ) : (
                          <Monitor className="w-3 h-3 text-white/25" />
                        )}
                        {authLogs[0].city || '—'} · {fmtDateTime(authLogs[0].created_at)}
                      </span>
                    ) : (
                      <span className="text-white/25">—</span>
                    )}
                  </div>
                </div>

                {/* Connected accounts */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">
                    Связи
                  </div>
                  <div className="flex gap-2">
                    {[
                      { icon: Send, active: !!user.telegram_id, label: 'Telegram' },
                      { icon: ExternalLink, active: !!user.yandex_id, label: 'Yandex' },
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
                            ? 'bg-white/[0.04] border-white/10 text-white/60'
                            : 'border-white/[0.06] text-white/20'
                        )}
                      >
                        <s.icon className="w-3 h-3" />
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auth logs */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setLogsExpanded(!logsExpanded)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">
                      История входов
                    </span>
                    <span className="text-[10px] text-white/25 tabular-nums">
                      {authLogs.length}
                    </span>
                    <div className="flex-1" />
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 text-white/25 transition-transform',
                        logsExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                  {logsExpanded &&
                    (authLogs.length > 0 ? (
                      authLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0"
                        >
                          <div className="w-6 h-6 rounded bg-white/[0.04] flex items-center justify-center text-white/25 shrink-0">
                            {log.device_type === 'mobile' ? (
                              <Smartphone className="w-3 h-3" />
                            ) : (
                              <Monitor className="w-3 h-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-white/55 font-mono">
                              {log.ip_address}
                            </div>
                            <div className="text-[10px] text-white/30">
                              {log.browser} · {log.os}
                            </div>
                          </div>
                          <div
                            className="text-[10px] text-white/35 shrink-0"
                            suppressHydrationWarning
                          >
                            {fmtDateTime(log.created_at)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-white/25 italic py-2">
                        {isLogsLoading ? 'Загрузка...' : 'Нет данных'}
                      </div>
                    ))}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">
                    Заметки
                  </div>
                  <div className="relative">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Добавить заметку..."
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-orange-500/30 transition-colors placeholder:text-white/25"
                    />
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNote.trim() || isSavingNote}
                      className="absolute bottom-2 right-2 px-3 py-1 rounded-md bg-orange-500 text-white text-[10px] font-semibold active:scale-95 transition-all disabled:opacity-30"
                    >
                      {isSavingNote ? '...' : 'Сохранить'}
                    </button>
                  </div>
                  {adminNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-2.5 group/note"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[10px] text-white/35"
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
                          className="p-1 rounded hover:bg-rose-500/10 text-transparent group-hover/note:text-white/30 hover:!text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Admin actions */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">
                    Действия
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        confirm('Сбросить пароль?') && alert('В разработке')
                      }
                      className="flex-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-medium text-white/45 hover:text-white/65 hover:bg-white/[0.07] transition-all active:scale-[0.98]"
                    >
                      Сброс пароля
                    </button>
                    <button
                      onClick={() =>
                        prompt('Причина бана:') && alert('Забанен')
                      }
                      className="flex-1 py-2 rounded-lg bg-rose-500/[0.05] border border-rose-500/[0.08] text-[10px] font-medium text-rose-400/40 hover:text-rose-400/70 hover:bg-rose-500/10 transition-all active:scale-[0.98]"
                    >
                      Бан
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB: Purchases ── */}
              <TabsContent value="purchases" className="m-0 p-4 space-y-1">
                {purchases.length > 0 || intensives.length > 0 ? (
                  <>
                    {purchases.map((p: any) => {
                      const pi = purchaseIcon(p.action)
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-2.5 py-2.5 border-b border-white/[0.06] last:border-0"
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                              pi.bg,
                              pi.text
                            )}
                            title={pi.label}
                          >
                            <pi.Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-white/80 font-medium truncate">
                              {p.products?.name || p.product_id}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <div className="text-[10px] flex items-center gap-1.5 flex-wrap">
                                {p.promo_code && (
                                  <span className="text-purple-400/70 font-medium">
                                    {p.promo_code}
                                    {p.promo_percent ? ` -${p.promo_percent}%` : ''}
                                  </span>
                                )}
                                {p.bonus_amount_used > 0 && (
                                  <span className="text-yellow-400/60 font-medium">
                                    -{p.bonus_amount_used}👟
                                    {p.products?.price > 0 && (
                                      <span className="text-[9px] opacity-60 ml-0.5">
                                        ({Math.round((p.bonus_amount_used / p.products.price) * 100)}%)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-[10px] text-white/30 flex items-center gap-1 flex-wrap"
                                suppressHydrationWarning
                              >
                                {fmtDate(p.created_at, { day: '2-digit', month: 'short' })}
                                {p.payment_provider && (
                                  <>
                                    <span className="text-white/10">·</span>
                                    {p.payment_provider}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className="text-[13px] font-semibold text-emerald-400 tabular-nums"
                              suppressHydrationWarning
                            >
                              {p.actual_paid_amount?.toLocaleString('ru-RU')} ₽
                            </div>
                            {p.products?.price > p.actual_paid_amount && (
                              <div
                                className="text-[10px] text-white/25 line-through tabular-nums"
                                suppressHydrationWarning
                              >
                                {p.products.price.toLocaleString('ru-RU')} ₽
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {intensives.length > 0 && purchases.length > 0 && (
                      <div className="pt-3 pb-1 text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                        Интенсивы
                      </div>
                    )}

                    {intensives.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 py-2.5 border-b border-white/[0.06] last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-white/80 font-medium truncate">
                            {item.products?.name}
                          </div>
                          <div
                            className="text-[10px] text-white/35 mt-0.5"
                            suppressHydrationWarning
                          >
                            {fmtDate(item.created_at, { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                        <span
                          className="text-[13px] font-semibold text-white/60 tabular-nums shrink-0"
                          suppressHydrationWarning
                        >
                          {item.actual_paid_amount?.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <EmptyState text="Покупок пока нет" />
                )}
              </TabsContent>

              {/* ── TAB: Bonuses ── */}
              <TabsContent value="bonuses" className="m-0 p-4">
                <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-yellow-400/[0.05] border border-yellow-400/[0.1] mb-4">
                  <div>
                    <div className="text-[9px] text-yellow-400/50 font-medium uppercase tracking-wider leading-none mb-1">
                      Баланс
                    </div>
                    <div className="text-lg font-bold text-white leading-tight font-oswald tabular-nums">
                      {user.bonus_balance || 0}{' '}
                      <span className="text-sm">👟</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-white/25 font-medium uppercase tracking-wider leading-none mb-1">
                      LTV
                    </div>
                    <div
                      className="text-lg font-bold text-emerald-400 leading-tight font-oswald tabular-nums"
                      suppressHydrationWarning
                    >
                      {user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>

                {bonusTransactions.length > 0 ? (
                  <div className="space-y-0">
                    {bonusTransactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-2.5 py-2 border-b border-white/[0.06] last:border-0"
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center shrink-0',
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
                          <div className="text-xs text-white/70 truncate">
                            {tx.description || 'Операция'}
                          </div>
                          <div
                            className="text-[10px] text-white/30 mt-0.5"
                            suppressHydrationWarning
                          >
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
                  <EmptyState text="Операций пока нет" />
                )}
              </TabsContent>

              {/* ── TAB: Activity ── */}
              <TabsContent value="activity" className="m-0 p-4 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-orange-500/[0.05] border border-orange-500/[0.1]">
                    <Dumbbell className="w-4 h-4 text-orange-400/50 mb-1.5" />
                    <div className="text-xl font-bold text-white font-oswald leading-none">
                      {stats?.workoutsCompleted || 0}
                    </div>
                    <div className="text-[10px] text-white/35 mt-1">тренировок</div>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-blue-500/[0.05] border border-blue-500/[0.1]">
                    <BookOpen className="w-4 h-4 text-blue-400/50 mb-1.5" />
                    <div className="text-xl font-bold text-white font-oswald leading-none">
                      {stats?.articlesRead || 0}
                    </div>
                    <div className="text-[10px] text-white/35 mt-1">статей</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-2">
                    Дневник
                  </div>
                  {data?.lastDiaryEntries?.length > 0 ? (
                    data.lastDiaryEntries.map((entry: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0 text-xs"
                      >
                        <span className="text-white/45" suppressHydrationWarning>
                          {fmtDate(entry.date, { day: '2-digit', month: 'short' })}
                        </span>
                        <div className="flex gap-3 text-white/60 tabular-nums">
                          {entry.metrics?.weight && (
                            <span>{entry.metrics.weight} кг</span>
                          )}
                          {entry.metrics?.steps && (
                            <span suppressHydrationWarning>
                              {entry.metrics.steps.toLocaleString('ru-RU')} шаг.
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState text="Записей в дневнике нет" />
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
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
