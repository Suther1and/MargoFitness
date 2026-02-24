'use client'

import React, { useEffect, useState } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/user-avatar'
import { getUserFullDetails } from '@/lib/actions/admin-user-details'
import { updateUserProfile } from '@/lib/actions/admin-users'
import { 
  getUserAuthLogs, 
  getAdminNotes, 
  saveAdminNote, 
  deleteAdminNote 
} from '@/lib/actions/admin-user-extra'
import { InlineSelect, InlineNumberInput, InlineDateInput } from './inline-edit-cell'
import { 
  ShoppingBag, 
  Trophy, 
  BookOpen, 
  Dumbbell, 
  Calendar, 
  CreditCard, 
  History,
  User as UserIcon,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Clock,
  TrendingUp,
  Plus,
  Minus,
  Tag,
  Zap,
  Flame,
  Info,
  ArrowUpCircle,
  RefreshCw,
  Shield,
  StickyNote,
  Trash2,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserDetailsSheetProps {
  userId: string | null
  onClose: () => void
}

export function UserDetailsSheet({ userId, onClose }: UserDetailsSheetProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLogs, setAuthLogs] = useState<any[]>([])
  const [adminNotes, setAdminNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isLogsExpanded, setIsLogsExpanded] = useState(false)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (userId) {
      fetchDetails()
      fetchExtraData()
    }
  }, [userId])

  const fetchDetails = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const result = await getUserFullDetails(userId)
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExtraData = async () => {
    if (!userId) return
    setIsLogsLoading(true)
    try {
      const [logsRes, notesRes] = await Promise.all([
        getUserAuthLogs(userId),
        getAdminNotes(userId)
      ])
      if (logsRes.success) setAuthLogs(logsRes.data || [])
      if (notesRes.success) setAdminNotes(notesRes.data || [])
    } catch (error) {
      console.error('Error fetching extra data:', error)
    } finally {
      setIsLogsLoading(false)
    }
  }

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
    } catch (error) {
      console.error('Error saving note:', error)
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
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleUpdate = async (field: string, value: any) => {
    if (!userId) return
    const updateData: any = {}
    updateData[field] = value

    // Логика из user-table-row.tsx
    if (field === 'subscription_expires_at' && value !== null) updateData['subscription_status'] = 'active'
    if (field === 'subscription_expires_at' && value === null) {
      updateData['subscription_status'] = 'inactive'
      updateData['subscription_tier'] = 'free'
    }
    if (field === 'subscription_tier' && value === 'free') {
      updateData['subscription_expires_at'] = null
      updateData['subscription_status'] = 'inactive'
    }

    try {
      const result = await updateUserProfile(userId, updateData)
      if (result.success) {
        await fetchDetails()
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (!userId) return null

  const user = data?.profile
  const stats = data?.stats
  const purchases = data?.purchases || []
  const intensives = data?.intensives || []
  const bonusTransactions = data?.bonusTransactions || []

  const tierOptions = [
    { value: 'free', label: 'FREE', className: 'text-gray-400 font-bold' },
    { value: 'basic', label: 'BASIC', className: 'text-orange-400 font-bold' },
    { value: 'pro', label: 'PRO', className: 'text-purple-400 font-bold' },
    { value: 'elite', label: 'ELITE', className: 'text-yellow-400 font-bold' },
  ]

  const roleOptions = [
    { value: 'user', label: 'Пользователь', className: 'text-white/70' },
    { value: 'admin', label: 'Админ', className: 'text-purple-400 font-bold' },
  ]

  const levelOptions = [
    { value: '1', label: '🥉 Bronze', className: 'text-amber-600' },
    { value: '2', label: '🥈 Silver', className: 'text-gray-300' },
    { value: '3', label: '🥇 Gold', className: 'text-yellow-400 font-bold' },
    { value: '4', label: '💎 Platinum', className: 'text-purple-400 font-bold' },
  ]

  return (
    <Sheet open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        className="w-full sm:max-w-2xl bg-[#0f0f13] border-white/5 p-0 overflow-hidden flex flex-col"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-radix-portal]') || target?.closest('.fixed.inset-0.z-\\[9998\\]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-radix-portal]') || target?.closest('.fixed.inset-0.z-\\[9998\\]')) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Карточка пользователя {user?.full_name || user?.email}</SheetTitle>
          <SheetDescription>Полная информация о профиле, покупках и активности пользователя</SheetDescription>
        </SheetHeader>
        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
          </div>
        ) : user ? (
          <>
            {/* Header Section - Fixed */}
            <div className="relative p-8 pb-6 bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/5 flex-shrink-0">
              <div className="flex items-start gap-6">
                <UserAvatar 
                  fullName={user.full_name}
                  avatarUrl={user.avatar_url}
                  email={user.email}
                  className="w-24 h-24 rounded-[2rem] ring-4 ring-white/5 shadow-2xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0 pt-2">
                  <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight truncate">
                    {user.full_name || 'Без имени'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <InlineSelect
                      value={user.subscription_tier}
                      options={tierOptions}
                      onSave={(val) => handleUpdate('subscription_tier', val)}
                      displayClassName={cn(
                        "ring-1",
                        user.subscription_tier === 'elite' ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30' :
                        user.subscription_tier === 'pro' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' :
                        user.subscription_tier === 'basic' ? 'bg-orange-500/10 text-orange-400 ring-orange-400/30' :
                        'bg-white/5 text-white/40 ring-white/10'
                      )}
                    />
                    <InlineDateInput
                      value={user.subscription_expires_at}
                      onSave={(val) => handleUpdate('subscription_expires_at', val)}
                      disabled={user.subscription_tier === 'free'}
                    />
                    <div className="flex items-center gap-4 ml-4 px-4 border-l border-white/10 shrink-0">
                      <div className="flex flex-col min-w-[45px]">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Возраст</span>
                        <span className="text-sm font-bold text-white">{user.age || '—'}</span>
                      </div>
                      <div className="flex flex-col min-w-[45px]">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Рост</span>
                        <span className="text-sm font-bold text-white">{user.height ? `${user.height} см` : '—'}</span>
                      </div>
                      <div className="flex flex-col min-w-[45px]">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Вес</span>
                        <span className="text-sm font-bold text-white">{user.weight ? `${user.weight} кг` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[
                  { label: 'Тренировки', value: stats?.workoutsCompleted || 0, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                  { label: 'Статьи', value: stats?.articlesRead || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Бонусы', value: user.bonus_balance || 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                  { label: 'Покупки', value: purchases.length, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center group hover:bg-white/[0.05] transition-all">
                    <div className={cn("p-2 rounded-xl mb-2", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <span className="text-lg font-bold text-white font-oswald leading-none">{stat.value}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Section - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                <div className="px-8 pt-4 flex-shrink-0">
                  <TabsList className="w-full bg-white/[0.03] border border-white/5 p-1 h-12 rounded-2xl">
                    <TabsTrigger value="overview" className="flex-1 gap-2 text-xs uppercase tracking-widest font-bold data-[state=active]:bg-white/5">
                      <UserIcon className="w-3.5 h-3.5" /> Общее
                    </TabsTrigger>
                    <TabsTrigger value="purchases" className="flex-1 gap-2 text-xs uppercase tracking-widest font-bold data-[state=active]:bg-white/5">
                      <CreditCard className="w-3.5 h-3.5" /> Покупки
                    </TabsTrigger>
                    <TabsTrigger value="intensives" className="flex-1 gap-2 text-xs uppercase tracking-widest font-bold data-[state=active]:bg-white/5">
                      <Zap className="w-3.5 h-3.5" /> Интенсивы
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1 gap-2 text-xs uppercase tracking-widest font-bold data-[state=active]:bg-white/5">
                      <TrendingUp className="w-3.5 h-3.5" /> Активность
                    </TabsTrigger>
                    <TabsTrigger value="bonuses" className="flex-1 gap-2 text-xs uppercase tracking-widest font-bold data-[state=active]:bg-white/5">
                      <History className="w-3.5 h-3.5" /> Бонусы
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <TabsContent value="overview" className="m-0 p-8 pt-6 space-y-6 pb-20">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Системная информация</h3>
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">ID пользователя</span>
                            <span className="text-[10px] font-mono text-white/60">{user.id}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">Дата регистрации</span>
                            <span className="text-xs text-white/80">{new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">Роль в системе</span>
                            <InlineSelect
                              value={user.role}
                              options={roleOptions}
                              onSave={(val) => handleUpdate('role', val)}
                              displayClassName={user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' : 'bg-white/5 text-white/60 ring-white/10'}
                            />
                          </div>
                          <div className="pt-2 border-t border-white/5 flex gap-2">
                            <button 
                              onClick={() => {
                                if (confirm('Вы уверены, что хотите сбросить пароль? Пользователю придет письмо.')) {
                                  // Здесь будет вызов экшена сброса пароля
                                  alert('Функционал в разработке');
                                }
                              }}
                              className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60 transition-all"
                            >
                              Сброс пароля
                            </button>
                            <button 
                              onClick={() => {
                                const reason = prompt('Введите причину блокировки:');
                                if (reason) {
                                  alert('Пользователь заблокирован (демо)');
                                }
                              }}
                              className="flex-1 py-2 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider text-rose-400/60 transition-all"
                            >
                              Бан
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Лояльность</h3>
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">Уровень кэшбэка</span>
                            <InlineSelect
                              value={user.cashback_level?.toString() || '1'}
                              options={levelOptions}
                              onSave={(val) => handleUpdate('cashback_level', parseInt(val))}
                              displayClassName={cn(
                                "ring-1",
                                user.cashback_level === 4 ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' :
                                user.cashback_level === 3 ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30' :
                                user.cashback_level === 2 ? 'bg-white/10 text-white/80 ring-white/20' :
                                'bg-amber-500/10 text-amber-600 ring-amber-500/30'
                              )}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">Баланс шагов</span>
                            <InlineNumberInput
                              value={user.bonus_balance || 0}
                              onSave={(val) => handleUpdate('bonus_balance', val)}
                              suffix="👟"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">Всего потрачено</span>
                            <span className="text-xs font-bold text-emerald-400">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>

                        {/* Блок последнего входа */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                          <h4 className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Последний вход</h4>
                          {authLogs && authLogs.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-white/40">Страна</span>
                                <div className="flex items-center gap-1.5">
                                  <Globe className="w-3 h-3 text-blue-400/60" />
                                  <span className="text-xs text-white/80 font-medium">
                                    {authLogs[0].country && authLogs[0].country !== 'Unknown' ? authLogs[0].country : 'Неизвестно'}
                                  </span>
                                </div>
                              </div>
                              {authLogs[0].city && authLogs[0].city !== 'Unknown' && (
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] text-white/40">Город</span>
                                  <span className="text-xs text-white/60">{authLogs[0].city}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-white/40">IP адрес</span>
                                <span className="text-[10px] font-mono text-white/40">{authLogs[0].ip_address}</span>
                              </div>
                              <div className="pt-1 flex justify-between items-center border-t border-white/5">
                                <span className="text-[10px] text-white/20 uppercase font-bold">Когда</span>
                                <span className="text-[10px] text-white/40">{new Date(authLogs[0].created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 text-center">
                              <span className="text-[10px] text-white/10 italic">Данные отсутствуют</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Связанные аккаунты</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Telegram', value: user.telegram_username ? `@${user.telegram_username}` : 'Не привязан', icon: Send, active: !!user.telegram_id },
                          { label: 'Yandex ID', value: user.yandex_id ? 'Привязан' : 'Не привязан', icon: ExternalLink, active: !!user.yandex_id },
                          { label: 'Профиль', value: user.profile_completed_at ? 'Заполнен' : 'Не заполнен', icon: UserIcon, active: !!user.profile_completed_at },
                        ].map((social, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", social.active ? "bg-white/10 text-white" : "bg-white/5 text-white/20")}>
                              <social.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-[10px] text-white/20 uppercase tracking-widest font-bold">{social.label}</span>
                              <span className={cn("block text-xs truncate", social.active ? "text-white/80" : "text-white/20")}>{social.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Секция заметок админа */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                        className="w-full flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <StickyNote className="w-3.5 h-3.5 text-orange-400" />
                          <h3 className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold group-hover:text-white/60 transition-colors">Заметки администратора</h3>
                          {adminNotes.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[9px] font-bold">
                              {adminNotes.length}
                            </span>
                          )}
                        </div>
                        {isNotesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-white/20" /> : <ChevronDown className="w-3.5 h-3.5 text-white/20" />}
                      </button>

                      {isNotesExpanded && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="relative group">
                            <textarea
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Напишите что-нибудь о пользователе..."
                              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/40 min-h-[100px] transition-all"
                            />
                            <button
                              onClick={handleSaveNote}
                              disabled={!newNote.trim() || isSavingNote}
                              className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-xs font-bold text-white transition-all active:scale-95"
                            >
                              {isSavingNote ? '...' : 'Сохранить'}
                            </button>
                          </div>

                          <div className="space-y-3">
                            {adminNotes.length > 0 ? (
                              adminNotes.map((note: any) => (
                                <div key={note.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 group/note">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                        <UserIcon className="w-3 h-3" />
                                      </div>
                                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                        {note.admin?.full_name || 'Админ'} • {new Date(note.created_at).toLocaleDateString('ru-RU')}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/10 hover:text-rose-400 transition-all opacity-0 group-hover/note:opacity-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                                    {note.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center text-white/10">
                                <span className="text-xs font-medium">Заметок пока нет</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Секция логов авторизации */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => {
                          if (!isLogsExpanded) fetchExtraData()
                          setIsLogsExpanded(!isLogsExpanded)
                        }}
                        className="w-full flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-blue-400" />
                          <h3 className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold group-hover:text-white/60 transition-colors">История входов</h3>
                          {isLogsLoading && <RefreshCw className="w-3 h-3 text-white/20 animate-spin" />}
                        </div>
                        {isLogsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-white/20" /> : <ChevronDown className="w-3.5 h-3.5 text-white/20" />}
                      </button>

                      {isLogsExpanded && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          {authLogs.length > 0 ? (
                            authLogs.map((log: any) => (
                              <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group/log hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="p-2.5 rounded-xl bg-white/5 text-white/40 group-hover/log:text-white/60 transition-colors">
                                    {log.device_type === 'mobile' ? <Smartphone className="w-4 h-4" /> : 
                                     log.device_type === 'tablet' ? <Tablet className="w-4 h-4" /> : 
                                     <Monitor className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-bold text-white">{log.ip_address}</span>
                                      {log.country && log.country !== 'Unknown' && (
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
                                          <Globe className="w-2.5 h-2.5" />
                                          {log.country} {log.city && log.city !== 'Unknown' ? `(${log.city})` : ''}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                      {new Date(log.created_at).toLocaleString('ru-RU')} • {log.browser} on {log.os}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-white/10">
                              <span className="text-sm font-medium">Логов пока нет</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="purchases" className="m-0 p-8 pt-6 space-y-4 pb-20">
                    {purchases.length > 0 ? (
                      <div className="space-y-4">
                        {purchases.map((p: any, idx: number) => {
                          const originalPrice = p.products?.price || p.amount;
                          const discount = originalPrice - p.actual_paid_amount;
                          const bonusUsed = p.bonus_amount_used || 0;
                          const isUpgrade = p.action === 'upgrade';
                          const isRenewal = p.action === 'renewal';
                          
                          // Расчет промокода
                          const promoCode = p.promo_code;
                          const promoPercent = p.promo_percent;

                          return (
                            <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 group hover:bg-white/[0.04] transition-all">
                              <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className={cn(
                                      "p-3 rounded-2xl bg-white/5 transition-colors",
                                      isUpgrade ? "text-purple-400 group-hover:bg-purple-500/10" : 
                                      isRenewal ? "text-blue-400 group-hover:bg-blue-500/10" :
                                      "text-emerald-400 group-hover:bg-emerald-500/10"
                                    )}>
                                      {isUpgrade ? <ArrowUpCircle className="w-6 h-6" /> : 
                                       isRenewal ? <RefreshCw className="w-6 h-6" /> :
                                       <ShoppingBag className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center flex-wrap gap-2">
                                        <span className="block text-base font-bold text-white truncate">
                                          {p.products?.name || p.product_id}
                                        </span>
                                        {isUpgrade && (
                                          <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider ring-1 ring-purple-500/20">
                                            Апгрейд
                                          </span>
                                        )}
                                        {isRenewal && (
                                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider ring-1 ring-blue-500/20">
                                            Продление
                                          </span>
                                        )}
                                        {!isUpgrade && !isRenewal && (
                                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-500/20">
                                            Покупка
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                          {new Date(p.created_at).toLocaleDateString('ru-RU')} • {p.payment_provider || 'ЮKassa'}
                                        </span>
                                        {p.payment_id && (
                                          <span className="text-[10px] text-white/20 font-mono">#{p.payment_id.slice(-8)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-xl font-bold text-emerald-400 font-oswald whitespace-nowrap">
                                      {p.actual_paid_amount?.toLocaleString('ru-RU')} ₽
                                    </div>
                                    {originalPrice > p.actual_paid_amount && (
                                      <div className="text-xs text-white/20 line-through decoration-rose-500/50 whitespace-nowrap">
                                        {originalPrice?.toLocaleString('ru-RU')} ₽
                                      </div>
                                    )}
                                  </div>
                              </div>

                              {/* Детальная информация о скидках и изменениях */}
                              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
                                <div className="flex flex-wrap gap-2">
                                  {promoCode && (
                                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl px-3 py-2 flex items-center gap-2">
                                      <Tag className="w-3.5 h-3.5 text-purple-400" />
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="text-[8px] text-purple-400/60 uppercase font-bold leading-none">Промокод</span>
                                          {p.promo_percent && (
                                            <span className="text-[8px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold leading-none">
                                              {p.promo_percent}%
                                            </span>
                                          )}
                                        </div>
                                        <span className="block text-xs text-purple-400 font-bold">
                                          {promoCode} {p.promo_discount_amount > 0 ? `(-${p.promo_discount_amount} ₽)` : ''}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {bonusUsed > 0 && (
                                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-3 py-2 flex items-center gap-2">
                                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="text-[8px] text-yellow-400/60 uppercase font-bold leading-none">Списано шагов</span>
                                          {p.bonus_percent_of_total > 0 && (
                                            <span className="text-[8px] px-1 py-0.5 rounded bg-yellow-400/10 text-yellow-400 font-bold leading-none">
                                              {p.bonus_percent_of_total}%
                                            </span>
                                          )}
                                        </div>
                                        <span className="block text-xs text-yellow-400 font-bold">
                                          -{bonusUsed} 👟
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {p.period_discount > 0 && (
                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl px-3 py-2 flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                                      <div>
                                        <span className="block text-[8px] text-blue-400/60 uppercase font-bold leading-none mb-0.5">Скидка за срок</span>
                                        <span className="block text-xs text-blue-400 font-bold">
                                          -{p.period_discount?.toLocaleString('ru-RU')} ₽
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {discount > 0 && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 flex items-center gap-2">
                                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                      <div>
                                        <span className="block text-[8px] text-emerald-400/60 uppercase font-bold leading-none mb-0.5">Общая экономия</span>
                                        <span className="block text-xs text-emerald-400 font-bold">
                                          {discount?.toLocaleString('ru-RU')} ₽
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Информация об апгрейде и изменении баланса */}
                                {isUpgrade && p.metadata?.converted_days > 0 && (
                                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-3 flex items-center gap-3">
                                    <ArrowUpCircle className="w-4 h-4 text-purple-400" />
                                    <span className="text-[10px] text-purple-400/80 font-medium">
                                      Конвертация остатка: +{p.metadata.converted_days} дн. к новой подписке
                                    </span>
                                  </div>
                                )}

                                {/* Информация о сроках */}
                                {(p.metadata?.previous_expiry || p.metadata?.new_expiry) && (
                                  <div className="bg-white/[0.02] rounded-2xl p-3 flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="w-4 h-4 text-white/20" />
                                      <span className="text-[11px] text-white/40 uppercase font-bold tracking-wider">Срок действия</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {p.metadata.previous_expiry && (
                                        <>
                                          <span className="text-xs text-white/40">{new Date(p.metadata.previous_expiry).toLocaleDateString('ru-RU')}</span>
                                          <div className="w-3 h-px bg-white/10" />
                                        </>
                                      )}
                                      <span className="text-xs text-emerald-400 font-bold">
                                        {new Date(p.metadata.new_expiry || p.created_at).toLocaleDateString('ru-RU')}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center text-white/10">
                        <ShoppingBag className="w-12 h-12 mb-2" />
                        <span className="text-sm font-medium">Покупок пока нет</span>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="intensives" className="m-0 p-8 pt-6 space-y-4 pb-20">
                    {intensives.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {intensives.map((i: any) => (
                          <div key={i.id} className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400">
                                <Zap className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="block text-base font-bold text-white mb-1">{i.products?.name}</span>
                                <span className="text-[10px] text-orange-400/60 uppercase tracking-widest font-bold">
                                  Куплено {new Date(i.created_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-lg font-bold text-white font-oswald">{i.actual_paid_amount} ₽</span>
                              <span className="text-[10px] text-white/40 uppercase font-bold">Доступ открыт</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="h-40 flex flex-col items-center justify-center text-white/10 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                          <Zap className="w-12 h-12 mb-2" />
                          <span className="text-sm font-medium">Интенсивов пока нет</span>
                        </div>
                        
                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                          <div className="flex items-center gap-3 mb-4">
                            <Flame className="w-5 h-5 text-blue-400" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Марафоны (Скоро)</h4>
                          </div>
                          <p className="text-xs text-white/40 leading-relaxed">
                            Раздел марафонов находится в разработке. Здесь будет отображаться история участия, текущий прогресс и результаты пользователя в сезонных марафонах.
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="m-0 p-8 pt-6 space-y-6 pb-20">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Dumbbell className="w-5 h-5 text-orange-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Тренировки</span>
                        </div>
                        <div className="text-3xl font-bold text-white font-oswald mb-1">{stats?.workoutsCompleted || 0}</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Выполнено всего</div>
                        
                        {stats?.workoutHistory?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            {stats.workoutHistory.slice(0, 3).map((w: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-[10px]">
                                <span className="text-white/60 truncate max-w-[100px]">{w.workout_sessions?.title}</span>
                                <span className="text-white/30">{new Date(w.completed_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Статьи</span>
                        </div>
                        <div className="text-3xl font-bold text-white font-oswald mb-1">{stats?.articlesRead || 0}</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Прочитано материалов</div>

                        {stats?.articleHistory?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            {stats.articleHistory.slice(0, 3).map((a: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-[10px]">
                                <span className="text-white/60 truncate max-w-[100px]">{a.articles?.title}</span>
                                <span className="text-white/30">{new Date(a.last_read_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Последние записи в дневнике</h3>
                      {data?.lastDiaryEntries?.length > 0 ? (
                        <div className="space-y-3">
                          {data.lastDiaryEntries.map((entry: any, i: number) => (
                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-white/20" />
                                <span className="text-xs text-white/80 font-medium">{new Date(entry.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}</span>
                              </div>
                              <div className="flex gap-4">
                                {entry.metrics?.weight && (
                                  <div className="text-right">
                                    <span className="block text-[10px] text-white/20 uppercase tracking-widest font-bold">Вес</span>
                                    <span className="text-xs text-white font-bold">{entry.metrics.weight} кг</span>
                                  </div>
                                )}
                                {entry.metrics?.steps && (
                                  <div className="text-right">
                                    <span className="block text-[10px] text-white/20 uppercase tracking-widest font-bold">Шаги</span>
                                    <span className="text-xs text-white font-bold">{entry.metrics.steps}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-2xl p-8 text-center">
                          <span className="text-xs text-white/20">Записей в дневнике не найдено</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="bonuses" className="m-0 p-8 pt-6 space-y-4 pb-20">
                    <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-3xl p-6 mb-6 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] text-yellow-400/60 uppercase tracking-widest font-bold mb-1">Активные бонусы</span>
                        <div className="text-4xl font-bold text-white font-oswald">{user.bonus_balance || 0} <span className="text-yellow-400">👟</span></div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">LTV</span>
                        <div className="text-xl font-bold text-emerald-400 font-oswald">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</div>
                      </div>
                    </div>

                    <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-4">История транзакций</h3>
                    {bonusTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {bonusTransactions.map((tx: any) => (
                          <div key={tx.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2.5 rounded-xl",
                                tx.amount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                              )}>
                                {tx.amount > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-white mb-0.5">{tx.description || 'Операция с бонусами'}</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                  {new Date(tx.created_at).toLocaleDateString('ru-RU')} • {tx.type}
                                </span>
                              </div>
                            </div>
                            <div className={cn("text-sm font-bold font-oswald", tx.amount > 0 ? "text-emerald-400" : "text-rose-400")}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center text-white/10">
                        <History className="w-12 h-12 mb-2" />
                        <span className="text-sm font-medium">Транзакций пока нет</span>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
