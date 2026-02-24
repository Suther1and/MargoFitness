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
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (userId && isMounted) {
      fetchDetails()
      fetchExtraData()
    }
  }, [userId, isMounted])

  const fetchDetails = async () => {
    if (!userId || !isMounted) return
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
    if (!userId || !isMounted) return
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
    if (!userId || !newNote.trim() || isSavingNote || !isMounted) return
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
    if (!userId || !isMounted) return
    
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
        setData((prev: any) => {
          if (!prev) return prev;
          const newProfile = { ...prev.profile, ...updateData };
          return { ...prev, profile: newProfile };
        });
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (!userId || !isMounted) return null

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
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Header Section - Compact & Unified */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <UserAvatar 
                  fullName={user.full_name}
                  avatarUrl={user.avatar_url}
                  email={user.email}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-1 ring-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight truncate">
                      {user.full_name || 'Без имени'}
                    </h2>
                    <InlineSelect
                      value={user.role}
                      options={roleOptions}
                      onSave={(val) => handleUpdate('role', val)}
                      displayClassName={cn(
                        "h-7 px-2.5 rounded-lg border-0 ring-0 text-[10px] uppercase font-bold tracking-wider",
                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-white/40'
                      )}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/40">
                      <Mail className="w-3 h-3" /> {user.email}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/40">
                      <Calendar className="w-3 h-3" /> С {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub & Physical Stats - Single Row */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <InlineSelect
                  value={user.subscription_tier}
                  options={tierOptions}
                  onSave={(val) => handleUpdate('subscription_tier', val)}
                  displayClassName={cn(
                    "h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                    user.subscription_tier === 'elite' ? 'bg-yellow-400/10 text-yellow-400' :
                    user.subscription_tier === 'pro' ? 'bg-purple-500/10 text-purple-400' :
                    user.subscription_tier === 'basic' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-white/5 text-white/40'
                  )}
                />
                <InlineDateInput
                  value={user.subscription_expires_at}
                  onSave={(val) => handleUpdate('subscription_expires_at', val)}
                  disabled={user.subscription_tier === 'free'}
                />
                <div className="flex items-center gap-4 ml-auto">
                  <div className="text-center">
                    <div className="text-[8px] text-white/20 uppercase font-bold">Возраст</div>
                    <div className="text-xs font-bold text-white">{user.age || '—'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-white/20 uppercase font-bold">Рост</div>
                    <div className="text-xs font-bold text-white">{user.height || '—'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-white/20 uppercase font-bold">Вес</div>
                    <div className="text-xs font-bold text-white">{user.weight || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid - 4 Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Тренировки', value: stats?.workoutsCompleted || 0, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                  { label: 'Статьи', value: stats?.articlesRead || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Бонусы', value: user.bonus_balance || 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                  { label: 'Покупки', value: purchases.length, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                      <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-oswald leading-none">{stat.value}</div>
                      <div className="text-[9px] text-white/30 uppercase font-bold">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs & Content - Fully Scrollable with Parent */}
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-4 sm:px-6 sticky top-0 z-10 bg-[#0f0f13]/80 backdrop-blur-md py-2 border-y border-white/5">
                <TabsList className="w-full bg-white/5 p-1 h-10 rounded-lg">
                  <TabsTrigger value="overview" className="flex-1 gap-1.5 text-[10px] uppercase font-bold data-[state=active]:bg-white/10 data-[state=active]:text-orange-400">
                    <UserIcon className="w-3 h-3" /> <span className="hidden xs:inline">Общее</span>
                  </TabsTrigger>
                  <TabsTrigger value="purchases" className="flex-1 gap-1.5 text-[10px] uppercase font-bold data-[state=active]:bg-white/10 data-[state=active]:text-emerald-400">
                    <CreditCard className="w-3 h-3" /> <span className="hidden xs:inline">Покупки</span>
                  </TabsTrigger>
                  <TabsTrigger value="intensives" className="flex-1 gap-1.5 text-[10px] uppercase font-bold data-[state=active]:bg-white/10 data-[state=active]:text-purple-400">
                    <Zap className="w-3 h-3" /> <span className="hidden xs:inline">Интенсивы</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1 gap-1.5 text-[10px] uppercase font-bold data-[state=active]:bg-white/10 data-[state=active]:text-blue-400">
                    <TrendingUp className="w-3 h-3" /> <span className="hidden xs:inline">Активность</span>
                  </TabsTrigger>
                  <TabsTrigger value="bonuses" className="flex-1 gap-1.5 text-[10px] uppercase font-bold data-[state=active]:bg-white/10 data-[state=active]:text-yellow-400">
                    <History className="w-3 h-3" /> <span className="hidden xs:inline">Бонусы</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Система */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-orange-500 rounded-full" />
                        <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Система</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/30">ID</span>
                          <span className="font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded text-[9px]">{user.id.slice(0, 8)}...{user.id.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/30">Регистрация</span>
                          <span className="text-white/70 font-bold">{new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex gap-2">
                          <button onClick={() => confirm('Сбросить пароль?') && alert('В разработке')} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase text-white/60 transition-all">Сброс пароля</button>
                          <button onClick={() => prompt('Причина бана:') && alert('Забанен')} className="flex-1 py-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-[9px] font-bold uppercase text-rose-400/60 transition-all">Бан</button>
                        </div>
                      </div>
                    </div>

                    {/* Лояльность */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-purple-500 rounded-full" />
                        <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Лояльность</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/30">Кэшбэк</span>
                          <InlineSelect
                            value={user.cashback_level?.toString() || '1'}
                            options={levelOptions}
                            onSave={(val) => handleUpdate('cashback_level', parseInt(val))}
                            displayClassName={cn(
                              "h-6 px-2 rounded-md border-0 ring-0 text-[9px]",
                              user.cashback_level === 4 ? 'bg-purple-500/10 text-purple-400' :
                              user.cashback_level === 3 ? 'bg-yellow-400/10 text-yellow-400' :
                              'bg-white/5 text-white/40'
                            )}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/30">Шаги</span>
                          <InlineNumberInput value={user.bonus_balance || 0} onSave={(val) => handleUpdate('bonus_balance', val)} suffix="👟" />
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/30">LTV</span>
                          <span className="font-bold text-emerald-400">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Активность & Аккаунты */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-3 bg-blue-500 rounded-full" />
                        <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Последний вход</h3>
                      </div>
                      {authLogs && authLogs.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                            {authLogs[0].device_type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-white">{authLogs[0].ip_address}</div>
                            <div className="text-[9px] text-white/20 uppercase font-bold">
                              {authLogs[0].city || 'Неизвестно'} • {new Date(authLogs[0].created_at).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-[10px] text-white/10 italic">Нет данных</div>
                      )}
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                        <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Аккаунты</h3>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { icon: Send, active: !!user.telegram_id, color: 'text-blue-400' },
                          { icon: ExternalLink, active: !!user.yandex_id, color: 'text-rose-400' },
                          { icon: UserIcon, active: !!user.profile_completed_at, color: 'text-emerald-400' },
                        ].map((social, i) => (
                          <div key={i} className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                            social.active ? "bg-white/5 border-white/10 " + social.color : "bg-white/[0.01] border-white/5 text-white/10"
                          )}>
                            <social.icon className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Заметки & История входов - Collapsible */}
                  <div className="space-y-4">
                    <button onClick={() => setIsNotesExpanded(!isNotesExpanded)} className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Заметки администратора</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", isNotesExpanded && "rotate-180")} />
                    </button>
                    {isNotesExpanded && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Напишите заметку..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white min-h-[100px] focus:outline-none focus:border-orange-500/40" />
                          <button onClick={handleSaveNote} disabled={!newNote.trim() || isSavingNote} className="absolute bottom-3 right-3 px-4 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest">Сохранить</button>
                        </div>
                        <div className="space-y-3">
                          {adminNotes.map((note: any) => (
                            <div key={note.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 group/note">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-white/40 font-bold uppercase">{note.admin?.full_name || 'Админ'} • {new Date(note.created_at).toLocaleDateString('ru-RU')}</span>
                                <button onClick={() => handleDeleteNote(note.id)} className="text-white/10 hover:text-rose-400 opacity-0 group-hover/note:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                              <p className="text-xs text-white/70 leading-relaxed">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => { if (!isLogsExpanded) fetchExtraData(); setIsLogsExpanded(!isLogsExpanded); }} className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">История входов</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", isLogsExpanded && "rotate-180")} />
                    </button>
                    {isLogsExpanded && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {authLogs.map((log: any) => (
                          <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="text-white/20">{log.device_type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}</div>
                              <div>
                                <div className="text-[11px] font-bold text-white">{log.ip_address}</div>
                                <div className="text-[9px] text-white/20 uppercase font-bold">{log.browser} • {log.os}</div>
                              </div>
                            </div>
                            <div className="text-right text-[9px] text-white/40 font-bold uppercase">{new Date(log.created_at).toLocaleString('ru-RU')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="purchases" className="m-0 space-y-4">
                  {purchases.length > 0 ? (
                    purchases.map((p: any) => (
                      <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl bg-white/5", p.action === 'upgrade' ? "text-purple-400" : "text-emerald-400")}>
                              {p.action === 'upgrade' ? <ArrowUpCircle className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white font-oswald uppercase tracking-tight">{p.products?.name || p.product_id}</div>
                              <div className="text-[9px] text-white/30 uppercase font-bold">{new Date(p.created_at).toLocaleDateString('ru-RU')} • {p.payment_provider || 'ЮKassa'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400 font-oswald">{p.actual_paid_amount?.toLocaleString('ru-RU')} ₽</div>
                            {p.products?.price > p.actual_paid_amount && <div className="text-[10px] text-white/20 line-through font-bold">{p.products.price.toLocaleString('ru-RU')} ₽</div>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                          {p.promo_code && <div className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-bold uppercase tracking-widest">Промо: {p.promo_code}</div>}
                          {p.bonus_amount_used > 0 && <div className="px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[9px] text-yellow-400 font-bold uppercase tracking-widest">Бонусы: -{p.bonus_amount_used} 👟</div>}
                          {p.actual_paid_amount < (p.products?.price || p.amount) && <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Экономия: {(p.products?.price || p.amount) - p.actual_paid_amount} ₽</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                      <ShoppingBag className="w-8 h-8 text-white/5 mx-auto mb-2" />
                      <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Покупок пока нет</span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="intensives" className="m-0 space-y-4">
                  {intensives.length > 0 ? (
                    intensives.map((i: any) => (
                      <div key={i.id} className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400"><Zap className="w-5 h-5" /></div>
                          <div>
                            <div className="text-sm font-bold text-white font-oswald uppercase tracking-tight">{i.products?.name}</div>
                            <div className="text-[9px] text-orange-400/60 uppercase font-bold tracking-widest">Куплено {new Date(i.created_at).toLocaleDateString('ru-RU')}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white font-oswald">{i.actual_paid_amount} ₽</div>
                          <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Доступ открыт</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                      <Zap className="w-8 h-8 text-white/5 mx-auto mb-2" />
                      <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Интенсивов пока нет</span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="m-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Тренировки</span>
                      </div>
                      <div className="text-2xl font-bold text-white font-oswald">{stats?.workoutsCompleted || 0}</div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Статьи</span>
                      </div>
                      <div className="text-2xl font-bold text-white font-oswald">{stats?.articlesRead || 0}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-orange-500 rounded-full" />
                      <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Дневник</h3>
                    </div>
                    {data?.lastDiaryEntries?.length > 0 ? (
                      data.lastDiaryEntries.map((entry: any, i: number) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-white/20" />
                            <span className="text-xs font-bold text-white">{new Date(entry.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}</span>
                          </div>
                          <div className="flex gap-4">
                            {entry.metrics?.weight && <div className="text-right"><div className="text-[8px] text-white/20 uppercase font-bold">Вес</div><div className="text-xs font-bold text-white">{entry.metrics.weight} кг</div></div>}
                            {entry.metrics?.steps && <div className="text-right"><div className="text-[8px] text-white/20 uppercase font-bold">Шаги</div><div className="text-xs font-bold text-white">{entry.metrics.steps.toLocaleString('ru-RU')}</div></div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-xl"><span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Нет записей</span></div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="bonuses" className="m-0 space-y-4">
                  <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-2xl p-6 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-yellow-400/60 uppercase font-bold tracking-widest mb-1">Активные бонусы</div>
                      <div className="text-4xl font-bold text-white font-oswald">{user.bonus_balance || 0} <span className="text-xl text-yellow-400">👟</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-1">Общий LTV</div>
                      <div className="text-2xl font-bold text-emerald-400 font-oswald">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {bonusTransactions.map((tx: any) => (
                      <div key={tx.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tx.amount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                            {tx.amount > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white uppercase tracking-tight">{tx.description || 'Операция'}</div>
                            <div className="text-[9px] text-white/20 uppercase font-bold">{new Date(tx.created_at).toLocaleDateString('ru-RU')} • {tx.type}</div>
                          </div>
                        </div>
                        <div className={cn("text-lg font-bold font-oswald", tx.amount > 0 ? "text-emerald-400" : "text-rose-400")}>{tx.amount > 0 ? '+' : ''}{tx.amount}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
