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
  ArrowUpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserDetailsSheetProps {
  userId: string | null
  onClose: () => void
}

function SectionLabel({
  title,
  count,
  color,
}: {
  title: string
  count?: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-5 pb-1.5">
      <div className={cn('w-1 h-3.5 rounded-full', color)} />
      <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-1 h-px bg-white/[0.06]" />
      {count !== undefined && (
        <span className="text-[10px] font-medium text-white/20 tabular-nums">{count}</span>
      )}
    </div>
  )
}

function Expandable({
  title,
  count,
  color,
  children,
}: {
  title: string
  count?: number
  color: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 pt-5 pb-1.5 hover:bg-white/[0.01] transition-colors"
      >
        <div className={cn('w-1 h-3.5 rounded-full', color)} />
        <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        {count !== undefined && (
          <span className="text-[10px] font-medium text-white/20 tabular-nums mr-1">
            {count}
          </span>
        )}
        <ChevronRight
          className={cn(
            'w-3 h-3 text-white/15 transition-transform duration-200',
            open && 'rotate-90'
          )}
        />
      </button>
      {open && <div className="px-4 pb-2 pt-1">{children}</div>}
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
          {/* ═══ Identity ═══ */}
          <div className="p-4 pb-2">
            <div className="flex items-start gap-3">
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
                      : 'bg-zinc-800 border-white/10 text-white/30 hover:text-white/60'
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
                        : 'bg-white/5 text-white/25'
                    )}
                  >
                    {user.role === 'admin' ? 'Админ' : 'Клиент'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Mail className="w-3 h-3 shrink-0 text-white/20" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-white/30 mt-0.5">
                    <Phone className="w-3 h-3 shrink-0 text-white/15" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Subscription + Loyalty Card ═══ */}
          <div className="px-4 pb-2">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="flex items-center gap-2">
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
                <div className="ml-auto text-right shrink-0 pl-2">
                  <div className="text-[9px] text-white/20 uppercase tracking-wider leading-none">
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
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                <InlineSelect
                  value={user.cashback_level?.toString() || '1'}
                  options={levelOptions}
                  onSave={(val) => handleUpdate('cashback_level', parseInt(val))}
                  displayClassName="h-7 px-2.5 rounded-lg border-0 ring-0 text-[11px] font-medium bg-white/[0.04] text-white/60"
                />
                <span className="text-white/[0.08]">·</span>
                <InlineNumberInput
                  value={user.bonus_balance || 0}
                  onSave={(val) => handleUpdate('bonus_balance', val)}
                  suffix="👟"
                />
              </div>
            </div>
          </div>

          {/* ═══ Activity & Physical summary line ═══ */}
          <div className="px-4 pb-3 flex items-center gap-x-3.5 gap-y-1 flex-wrap text-[11px] text-white/30">
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-orange-400/40" />
              <span className="text-white/50 font-medium tabular-nums">
                {stats?.workoutsCompleted || 0}
              </span>{' '}
              трен.
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-400/40" />
              <span className="text-white/50 font-medium tabular-nums">
                {stats?.articlesRead || 0}
              </span>{' '}
              стат.
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-emerald-400/40" />
              <span className="text-white/50 font-medium tabular-nums">
                {purchases.length}
              </span>{' '}
              пок.
            </span>
            {(user.age || user.height || user.weight) && (
              <>
                <span className="text-white/[0.08]">|</span>
                {user.age && <span>{user.age} лет</span>}
                {user.height && (
                  <span>
                    {user.age ? '· ' : ''}
                    {user.height} см
                  </span>
                )}
                {user.weight && (
                  <span>
                    {user.age || user.height ? '· ' : ''}
                    {user.weight} кг
                  </span>
                )}
              </>
            )}
          </div>

          {/* ═══ PURCHASES (always visible) ═══ */}
          <SectionLabel title="Покупки" count={purchases.length} color="bg-emerald-400/60" />
          <div className="px-4 pb-1">
            {purchases.length > 0 ? (
              purchases.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      p.action === 'upgrade'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    )}
                  >
                    {p.action === 'upgrade' ? (
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white/70 font-medium truncate leading-tight">
                      {p.products?.name || p.product_id}
                    </div>
                    <div
                      className="text-[10px] text-white/20 flex items-center gap-1 flex-wrap leading-tight mt-0.5"
                      suppressHydrationWarning
                    >
                      {fmtDate(p.created_at, { day: '2-digit', month: 'short' })}
                      {p.payment_provider && (
                        <>
                          <span className="text-white/[0.08]">·</span>
                          {p.payment_provider}
                        </>
                      )}
                      {p.promo_code && (
                        <>
                          <span className="text-white/[0.08]">·</span>
                          <span className="text-purple-400/50">{p.promo_code}</span>
                        </>
                      )}
                      {p.bonus_amount_used > 0 && (
                        <>
                          <span className="text-white/[0.08]">·</span>
                          <span className="text-yellow-400/50">-{p.bonus_amount_used}👟</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="text-[13px] font-semibold text-emerald-400 tabular-nums leading-tight"
                      suppressHydrationWarning
                    >
                      {p.actual_paid_amount?.toLocaleString('ru-RU')} ₽
                    </div>
                    {p.products?.price > p.actual_paid_amount && (
                      <div
                        className="text-[10px] text-white/15 line-through tabular-nums leading-tight"
                        suppressHydrationWarning
                      >
                        {p.products.price.toLocaleString('ru-RU')} ₽
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-[11px] text-white/15 italic">Нет покупок</div>
            )}
          </div>

          {/* ═══ INTENSIVES (always visible) ═══ */}
          <SectionLabel title="Интенсивы" count={intensives.length} color="bg-orange-400/60" />
          <div className="px-4 pb-1">
            {intensives.length > 0 ? (
              intensives.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white/70 font-medium truncate leading-tight">
                      {item.products?.name}
                    </div>
                    <div
                      className="text-[10px] text-white/20 leading-tight mt-0.5"
                      suppressHydrationWarning
                    >
                      {fmtDate(item.created_at, { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-[13px] font-semibold text-white/50 tabular-nums"
                      suppressHydrationWarning
                    >
                      {item.actual_paid_amount} ₽
                    </span>
                    <span className="text-[9px] font-medium text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ✓
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-[11px] text-white/15 italic">Нет интенсивов</div>
            )}
          </div>

          {/* ═══ BONUS TRANSACTIONS (always visible) ═══ */}
          <SectionLabel
            title="Бонусы"
            count={bonusTransactions.length}
            color="bg-yellow-400/60"
          />
          <div className="px-4 pb-1">
            {bonusTransactions.length > 0 ? (
              bonusTransactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center shrink-0',
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
                    <div className="text-xs text-white/50 truncate leading-tight">
                      {tx.description || 'Операция'}
                    </div>
                    <div
                      className="text-[10px] text-white/15 leading-tight mt-0.5"
                      suppressHydrationWarning
                    >
                      {fmtDate(tx.created_at, { day: '2-digit', month: 'short' })} ·{' '}
                      {tx.type}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold tabular-nums shrink-0',
                      tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-3 text-[11px] text-white/15 italic">Нет операций</div>
            )}
          </div>

          {/* ═══ ACTIVITY (always visible) ═══ */}
          <SectionLabel title="Активность" color="bg-blue-400/60" />
          <div className="px-4 pb-1">
            {data?.lastDiaryEntries?.length > 0 ? (
              data.lastDiaryEntries.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 text-xs"
                >
                  <span className="text-white/35" suppressHydrationWarning>
                    {fmtDate(entry.date, { day: '2-digit', month: 'short' })}
                  </span>
                  <div className="flex gap-3 text-white/45 tabular-nums">
                    {entry.metrics?.weight && <span>{entry.metrics.weight} кг</span>}
                    {entry.metrics?.steps && (
                      <span suppressHydrationWarning>
                        {entry.metrics.steps.toLocaleString('ru-RU')} шаг.
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-[11px] text-white/15 italic">Нет записей</div>
            )}
          </div>

          {/* ═══ NOTES (expandable) ═══ */}
          <Expandable
            title="Заметки"
            count={adminNotes.length}
            color="bg-orange-400/40"
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
                    className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5 group/note"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] text-white/25"
                        suppressHydrationWarning
                      >
                        {note.admin?.full_name || 'Админ'} ·{' '}
                        {fmtDate(note.created_at, { day: '2-digit', month: 'short' })}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-transparent group-hover/note:text-white/20 hover:!text-rose-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Expandable>

          {/* ═══ AUTH LOGS (expandable) ═══ */}
          <Expandable
            title="Входы"
            count={authLogs.length}
            color="bg-blue-400/40"
          >
            {authLogs.length > 0 ? (
              authLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-6 h-6 rounded bg-white/[0.03] flex items-center justify-center text-white/15 shrink-0">
                    {log.device_type === 'mobile' ? (
                      <Smartphone className="w-3 h-3" />
                    ) : (
                      <Monitor className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-white/45 font-mono leading-tight">
                      {log.ip_address}
                    </div>
                    <div className="text-[10px] text-white/15 leading-tight mt-0.5">
                      {log.browser} · {log.os}
                    </div>
                  </div>
                  <div className="text-right shrink-0" suppressHydrationWarning>
                    <div className="text-[10px] text-white/25 leading-tight">
                      {fmtDate(log.created_at, { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[10px] text-white/15 leading-tight">
                      {new Date(log.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-[11px] text-white/15 italic">
                {isLogsLoading ? 'Загрузка...' : 'Нет данных'}
              </div>
            )}
          </Expandable>

          {/* ═══ Footer: system info & actions ═══ */}
          <div className="px-4 py-4 mt-3 border-t border-white/[0.06] space-y-3">
            <div className="flex gap-2">
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
                    'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-medium',
                    s.active
                      ? 'bg-white/[0.03] border-white/10 text-white/45'
                      : 'bg-transparent border-white/[0.04] text-white/10'
                  )}
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </div>
              ))}
            </div>

            <div
              className="text-[10px] text-white/15 flex items-center gap-1.5 flex-wrap"
              suppressHydrationWarning
            >
              <span>
                Рег:{' '}
                {fmtDate(user.created_at, {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                })}
              </span>
              <span className="text-white/[0.06]">·</span>
              <span className="font-mono truncate">{user.id}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  confirm('Сбросить пароль?') && alert('В разработке')
                }
                className="flex-1 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-medium text-white/30 hover:text-white/50 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
              >
                Сброс пароля
              </button>
              <button
                onClick={() =>
                  prompt('Причина бана:') && alert('Забанен')
                }
                className="flex-1 py-1.5 rounded-lg bg-rose-500/[0.03] border border-rose-500/[0.08] text-[10px] font-medium text-rose-400/30 hover:text-rose-400/60 hover:bg-rose-500/10 transition-all active:scale-[0.98]"
              >
                Бан
              </button>
            </div>
          </div>

          <div className="h-6" />
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
