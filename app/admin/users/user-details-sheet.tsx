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
    
    // Оптимизация: Сначала обновляем локальное состояние, если это возможно, 
    // чтобы UI не дергался, но так как у нас сложная структура data, 
    // просто добавим индикацию загрузки или проверку.
    
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
        // Вместо полной перезагрузки всех данных через fetchDetails() и router.refresh(),
        // которые создают каскад запросов, мы можем обновить только нужные поля в локальном state
        setData((prev: any) => {
          if (!prev) return prev;
          const newProfile = { ...prev.profile, ...updateData };
          return { ...prev, profile: newProfile };
        });
        
        // router.refresh() нужен для обновления списка в таблице "под шторкой"
        // но мы вызываем его без await, чтобы не блокировать UI
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
            {/* Header Section - Compact & Professional */}
            <div className="relative p-5 pb-5 bg-white/[0.02] border-b border-white/5 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <UserAvatar 
                    fullName={user.full_name}
                    avatarUrl={user.avatar_url}
                    email={user.email}
                    className="w-20 h-20 rounded-2xl ring-1 ring-white/10 shadow-xl object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight truncate">
                      {user.full_name || 'Без имени'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <InlineSelect
                        value={user.role}
                        options={roleOptions}
                        onSave={(val) => handleUpdate('role', val)}
                        displayClassName={cn(
                          "h-7 px-2.5 rounded-lg border-0 ring-0 text-[10px] uppercase font-bold tracking-wider",
                          user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-white/40 text-[11px] bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      <Mail className="w-3 h-3 text-orange-400/60" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-white/40 text-[11px] bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        <Phone className="w-3 h-3 text-blue-400/60" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-white/40 text-[11px] bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      <Calendar className="w-3 h-3 text-emerald-400/60" />
                      <span>С {new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <InlineSelect
                      value={user.subscription_tier}
                      options={tierOptions}
                      onSave={(val) => handleUpdate('subscription_tier', val)}
                      displayClassName={cn(
                        "h-8 px-3 rounded-lg ring-0 border-0 text-[10px] font-bold uppercase tracking-widest",
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
                    <div className="flex items-center gap-3 ml-auto px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-white/20 uppercase font-bold">Возраст</span>
                        <span className="text-xs font-bold text-white">{user.age || '—'}</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-white/20 uppercase font-bold">Рост</span>
                        <span className="text-xs font-bold text-white">{user.height || '—'}</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-white/20 uppercase font-bold">Вес</span>
                        <span className="text-xs font-bold text-white">{user.weight || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {[
                  { label: 'Тренировки', value: stats?.workoutsCompleted || 0, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                  { label: 'Статьи', value: stats?.articlesRead || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Бонусы', value: user.bonus_balance || 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                  { label: 'Покупки', value: purchases.length, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-2 flex items-center gap-3 hover:bg-white/[0.05] transition-all">
                    <div className={cn("p-1.5 rounded-lg flex-shrink-0", stat.bg)}>
                      <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white font-oswald leading-none">{stat.value}</div>
                      <div className="text-[9px] text-white/30 uppercase font-bold truncate">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Section - Optimized */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                <div className="px-5 pt-3 flex-shrink-0">
                  <TabsList className="w-full bg-white/[0.03] border border-white/5 p-1 h-10 rounded-xl overflow-x-auto no-scrollbar flex-nowrap justify-start sm:justify-center">
                    <TabsTrigger value="overview" className="flex-1 min-w-[80px] gap-1.5 text-[9px] uppercase tracking-widest font-bold data-[state=active]:bg-white/5 data-[state=active]:text-orange-400 rounded-lg">
                      <UserIcon className="w-3 h-3" /> <span className="hidden xs:inline">Общее</span>
                    </TabsTrigger>
                    <TabsTrigger value="purchases" className="flex-1 min-w-[80px] gap-1.5 text-[9px] uppercase tracking-widest font-bold data-[state=active]:bg-white/5 data-[state=active]:text-emerald-400 rounded-lg">
                      <CreditCard className="w-3 h-3" /> <span className="hidden xs:inline">Покупки</span>
                    </TabsTrigger>
                    <TabsTrigger value="intensives" className="flex-1 min-w-[80px] gap-1.5 text-[9px] uppercase tracking-widest font-bold data-[state=active]:bg-white/5 data-[state=active]:text-purple-400 rounded-lg">
                      <Zap className="w-3 h-3" /> <span className="hidden xs:inline">Интенсивы</span>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1 min-w-[80px] gap-1.5 text-[9px] uppercase tracking-widest font-bold data-[state=active]:bg-white/5 data-[state=active]:text-blue-400 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> <span className="hidden xs:inline">Активность</span>
                    </TabsTrigger>
                    <TabsTrigger value="bonuses" className="flex-1 min-w-[80px] gap-1.5 text-[9px] uppercase tracking-widest font-bold data-[state=active]:bg-white/5 data-[state=active]:text-yellow-400 rounded-lg">
                      <History className="w-3 h-3" /> <span className="hidden xs:inline">Бонусы</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <TabsContent value="overview" className="m-0 p-5 pt-5 space-y-5 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Система */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
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
                            <button 
                              onClick={() => confirm('Сбросить пароль?') && alert('В разработке')}
                              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase text-white/60 transition-all"
                            >
                              Сброс пароля
                            </button>
                            <button 
                              onClick={() => prompt('Причина бана:') && alert('Забанен')}
                              className="flex-1 py-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-[9px] font-bold uppercase text-rose-400/60 transition-all"
                            >
                              Бан
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Лояльность */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
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
                            <InlineNumberInput
                              value={user.bonus_balance || 0}
                              onSave={(val) => handleUpdate('bonus_balance', val)}
                              suffix="👟"
                            />
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
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-3 bg-blue-500 rounded-full" />
                          <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Последний вход</h3>
                        </div>
                        {authLogs && authLogs.length > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                              {authLogs[0].device_type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-white truncate">{authLogs[0].ip_address}</div>
                              <div className="text-[9px] text-white/20 uppercase font-bold truncate">
                                {authLogs[0].city || 'Неизвестно'} • {new Date(authLogs[0].created_at).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-[10px] text-white/10 italic">Нет данных</div>
                        )}
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
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

                    {/* Секция заметок админа */}
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                        className="w-full flex items-center justify-between group px-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                            <StickyNote className="w-4 h-4" />
                          </div>
                          <h3 className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold group-hover:text-white/60 transition-colors">Заметки администратора</h3>
                          {adminNotes.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20">
                              {adminNotes.length}
                            </span>
                          )}
                        </div>
                        {isNotesExpanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                      </button>

                      {isNotesExpanded && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                            <textarea
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Напишите что-нибудь о пользователе..."
                              className="relative w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 min-h-[120px] transition-all"
                            />
                            <button
                              onClick={handleSaveNote}
                              disabled={!newNote.trim() || isSavingNote}
                              className="absolute bottom-4 right-4 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                            >
                              {isSavingNote ? '...' : 'Сохранить'}
                            </button>
                          </div>

                          <div className="space-y-4">
                            {adminNotes.length > 0 ? (
                              adminNotes.map((note: any) => (
                                <div key={note.id} className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-5 space-y-4 group/note hover:bg-white/[0.04] transition-all">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                        <UserIcon className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <span className="block text-[10px] text-white/60 font-bold uppercase tracking-widest mb-0.5">
                                          {note.admin?.full_name || 'Админ'}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                          {new Date(note.created_at).toLocaleDateString('ru-RU')} в {new Date(note.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="p-2 rounded-lg hover:bg-rose-500/10 text-white/5 hover:text-rose-400 transition-all opacity-0 group-hover/note:opacity-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap pl-11">
                                    {note.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
                                <StickyNote className="w-8 h-8 text-white/5 mx-auto mb-3" />
                                <span className="text-xs font-medium text-white/20">Заметок пока нет</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Секция логов авторизации */}
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => {
                          if (!isLogsExpanded) fetchExtraData()
                          setIsLogsExpanded(!isLogsExpanded)
                        }}
                        className="w-full flex items-center justify-between group px-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Shield className="w-4 h-4" />
                          </div>
                          <h3 className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold group-hover:text-white/60 transition-colors">История входов</h3>
                          {isLogsLoading && <RefreshCw className="w-3.5 h-3.5 text-white/20 animate-spin" />}
                        </div>
                        {isLogsExpanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                      </button>

                      {isLogsExpanded && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                          {authLogs.length > 0 ? (
                            authLogs.map((log: any) => (
                              <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between group/log hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-xl bg-white/5 text-white/20 group-hover/log:text-white/40 transition-colors flex items-center justify-center border border-white/5">
                                    {log.device_type === 'mobile' ? <Smartphone className="w-5 h-5" /> : 
                                     log.device_type === 'tablet' ? <Tablet className="w-5 h-5" /> : 
                                     <Monitor className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-1">
                                      <span className="text-sm font-bold text-white">{log.ip_address}</span>
                                      {log.country && log.country !== 'Unknown' && (
                                        <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[9px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/5">
                                          <Globe className="w-3 h-3 text-blue-400/60" />
                                          {log.country} {log.city && log.city !== 'Unknown' ? `(${log.city})` : ''}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                                      {log.browser} • {log.os}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs font-bold text-white/40 mb-0.5">
                                    {new Date(log.created_at).toLocaleDateString('ru-RU')}
                                  </span>
                                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                    {new Date(log.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
                              <Shield className="w-8 h-8 text-white/5 mx-auto mb-3" />
                              <span className="text-xs font-medium text-white/20">Логов пока нет</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="purchases" className="m-0 p-8 pt-8 space-y-6 pb-24">
                    {purchases.length > 0 ? (
                      <div className="space-y-6">
                        {purchases.map((p: any, idx: number) => {
                          const originalPrice = p.products?.price || p.amount;
                          const discount = originalPrice - p.actual_paid_amount;
                          const bonusUsed = p.bonus_amount_used || 0;
                          const isUpgrade = p.action === 'upgrade';
                          const isRenewal = p.action === 'renewal';
                          
                          const promoCode = p.promo_code;

                          return (
                            <div key={p.id} className="group relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 hover:bg-white/[0.04] transition-all duration-500">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                              
                              <div className="relative flex items-start justify-between mb-6">
                                  <div className="flex items-center gap-5">
                                    <div className={cn(
                                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                      isUpgrade ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20" : 
                                      isRenewal ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20" :
                                      "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                                    )}>
                                      {isUpgrade ? <ArrowUpCircle className="w-7 h-7" /> : 
                                       isRenewal ? <RefreshCw className="w-7 h-7" /> :
                                       <ShoppingBag className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center flex-wrap gap-3 mb-1.5">
                                        <span className="block text-lg font-bold text-white truncate font-oswald uppercase tracking-tight">
                                          {p.products?.name || p.product_id}
                                        </span>
                                        {isUpgrade && (
                                          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase tracking-[0.15em] border border-purple-500/20">
                                            Апгрейд
                                          </span>
                                        )}
                                        {isRenewal && (
                                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-[0.15em] border border-blue-500/20">
                                            Продление
                                          </span>
                                        )}
                                        {!isUpgrade && !isRenewal && (
                                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-[0.15em] border border-emerald-500/20">
                                            Покупка
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                          {new Date(p.created_at).toLocaleDateString('ru-RU')} • {p.payment_provider || 'ЮKassa'}
                                        </span>
                                        {p.payment_id && (
                                          <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-white/20">#{p.payment_id.slice(-8)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 pt-1">
                                    <div className="text-2xl font-bold text-emerald-400 font-oswald whitespace-nowrap">
                                      {p.actual_paid_amount?.toLocaleString('ru-RU')} ₽
                                    </div>
                                    {originalPrice > p.actual_paid_amount && (
                                      <div className="text-[11px] text-white/20 line-through decoration-rose-500/50 font-bold">
                                        {originalPrice?.toLocaleString('ru-RU')} ₽
                                      </div>
                                    )}
                                  </div>
                              </div>

                              {/* Детальная информация о скидках */}
                              <div className="relative grid grid-cols-1 gap-4 pt-6 border-t border-white/5">
                                <div className="flex flex-wrap gap-3">
                                  {promoCode && (
                                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                      <Tag className="w-4 h-4 text-purple-400" />
                                      <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[9px] text-purple-400/60 uppercase font-bold tracking-widest">Промокод</span>
                                          {p.promo_percent && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                                              {p.promo_percent}%
                                            </span>
                                          )}
                                        </div>
                                        <span className="block text-xs text-purple-400 font-bold uppercase tracking-wider">
                                          {promoCode} {p.promo_discount_amount > 0 ? `(-${p.promo_discount_amount} ₽)` : ''}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {bonusUsed > 0 && (
                                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                      <Trophy className="w-4 h-4 text-yellow-400" />
                                      <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[9px] text-yellow-400/60 uppercase font-bold tracking-widest">Списано шагов</span>
                                          {p.bonus_percent_of_total > 0 && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 font-bold">
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
                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                      <Clock className="w-4 h-4 text-blue-400" />
                                      <div>
                                        <span className="block text-[9px] text-blue-400/60 uppercase font-bold tracking-widest mb-0.5">Скидка за срок</span>
                                        <span className="block text-xs text-blue-400 font-bold">
                                          -{p.period_discount?.toLocaleString('ru-RU')} ₽
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {discount > 0 && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                                      <div>
                                        <span className="block text-[9px] text-emerald-400/60 uppercase font-bold tracking-widest mb-0.5">Общая экономия</span>
                                        <span className="block text-xs text-emerald-400 font-bold">
                                          {discount?.toLocaleString('ru-RU')} ₽
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {isUpgrade && p.metadata?.converted_days > 0 && (
                                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex items-center gap-4">
                                    <ArrowUpCircle className="w-5 h-5 text-purple-400" />
                                    <span className="text-xs text-purple-400/80 font-bold uppercase tracking-wider">
                                      Конвертация остатка: +{p.metadata.converted_days} дн. к новой подписке
                                    </span>
                                  </div>
                                )}

                                {(p.metadata?.previous_expiry || p.metadata?.new_expiry) && (
                                  <div className="bg-white/[0.03] rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="w-4 h-4 text-white/20" />
                                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">Срок действия</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {p.metadata.previous_expiry && (
                                        <>
                                          <span className="text-xs text-white/20 font-bold">{new Date(p.metadata.previous_expiry).toLocaleDateString('ru-RU')}</span>
                                          <div className="w-4 h-px bg-white/10" />
                                        </>
                                      )}
                                      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
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
                      <div className="h-64 flex flex-col items-center justify-center text-white/10 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                        <span className="text-sm font-bold uppercase tracking-widest">Покупок пока нет</span>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="intensives" className="m-0 p-8 pt-8 space-y-6 pb-24">
                    {intensives.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {intensives.map((i: any) => (
                          <div key={i.id} className="group relative bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] p-6 flex items-center justify-between hover:from-orange-500/15 transition-all duration-500">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Zap className="w-7 h-7" />
                              </div>
                              <div>
                                <span className="block text-lg font-bold text-white mb-1 font-oswald uppercase tracking-tight">{i.products?.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-orange-400/60 uppercase tracking-widest font-bold">
                                    Куплено {new Date(i.created_at).toLocaleDateString('ru-RU')}
                                  </span>
                                  <div className="w-1 h-1 rounded-full bg-orange-500/30" />
                                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Доступ открыт</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-2xl font-bold text-white font-oswald mb-1">{i.actual_paid_amount} ₽</span>
                              <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] text-white/40 font-bold uppercase tracking-widest">
                                ID: {i.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="h-64 flex flex-col items-center justify-center text-white/10 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                          <Zap className="w-16 h-16 mb-4 opacity-20" />
                          <span className="text-sm font-bold uppercase tracking-widest">Интенсивов пока нет</span>
                        </div>
                        
                        <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Flame className="w-24 h-24 text-blue-400" />
                          </div>
                          <div className="relative flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <Flame className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Марафоны (Скоро)</h4>
                          </div>
                          <p className="relative text-xs text-white/40 leading-relaxed max-w-[80%] font-medium">
                            Раздел марафонов находится в разработке. Здесь будет отображаться история участия, текущий прогресс и результаты пользователя в сезонных марафонах.
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="m-0 p-8 pt-8 space-y-8 pb-24">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="group bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] p-6 hover:bg-orange-500/[0.08] transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                              <Dumbbell className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">Тренировки</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-oswald">{stats?.workoutsCompleted || 0}</div>
                        </div>
                        
                        {stats?.workoutHistory?.length > 0 ? (
                          <div className="space-y-3">
                            {stats.workoutHistory.slice(0, 3).map((w: any, i: number) => (
                              <div key={i} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                <span className="text-[11px] text-white/70 font-bold truncate max-w-[120px] uppercase tracking-tight">{w.workout_sessions?.title}</span>
                                <span className="text-[10px] text-white/20 font-bold">{new Date(w.completed_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                            <span className="text-[10px] text-white/10 uppercase font-bold tracking-widest">Нет данных</span>
                          </div>
                        )}
                      </div>

                      <div className="group bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] p-6 hover:bg-blue-500/[0.08] transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">Статьи</span>
                          </div>
                          <div className="text-3xl font-bold text-white font-oswald">{stats?.articlesRead || 0}</div>
                        </div>

                        {stats?.articleHistory?.length > 0 ? (
                          <div className="space-y-3">
                            {stats.articleHistory.slice(0, 3).map((a: any, i: number) => (
                              <div key={i} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                <span className="text-[11px] text-white/70 font-bold truncate max-w-[120px] uppercase tracking-tight">{a.articles?.title}</span>
                                <span className="text-[10px] text-white/20 font-bold">{new Date(a.last_read_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                            <span className="text-[10px] text-white/10 uppercase font-bold tracking-widest">Нет данных</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 px-1">
                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                        <h3 className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold">Дневник (Последние записи)</h3>
                      </div>
                      {data?.lastDiaryEntries?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {data.lastDiaryEntries.map((entry: any, i: number) => (
                            <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="block text-sm font-bold text-white mb-0.5">{new Date(entry.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}</span>
                                  <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">{new Date(entry.date).getFullYear()} год</span>
                                </div>
                              </div>
                              <div className="flex gap-8">
                                {entry.metrics?.weight && (
                                  <div className="text-right">
                                    <span className="block text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold mb-1">Вес</span>
                                    <span className="text-base font-bold text-white font-oswald">{entry.metrics.weight} <span className="text-[10px] text-white/40">кг</span></span>
                                  </div>
                                )}
                                {entry.metrics?.steps && (
                                  <div className="text-right">
                                    <span className="block text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold mb-1">Шаги</span>
                                    <span className="text-base font-bold text-white font-oswald">{entry.metrics.steps.toLocaleString('ru-RU')} <span className="text-[10px] text-white/40">👟</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem] p-12 text-center">
                          <Calendar className="w-10 h-10 text-white/5 mx-auto mb-4" />
                          <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Записей в дневнике не найдено</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="bonuses" className="m-0 p-8 pt-8 space-y-6 pb-24">
                    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400/10 via-yellow-400/5 to-transparent border border-yellow-400/20 rounded-[3rem] p-8 mb-8 group">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                        <Trophy className="w-48 h-48 text-yellow-400" />
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] text-yellow-400/60 uppercase tracking-[0.3em] font-bold mb-3">Активные бонусы</span>
                          <div className="text-6xl font-bold text-white font-oswald flex items-baseline gap-3">
                            {user.bonus_balance || 0} 
                            <span className="text-2xl text-yellow-400">👟</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[11px] text-white/20 uppercase tracking-[0.3em] font-bold mb-3">Общий LTV</span>
                          <div className="text-3xl font-bold text-emerald-400 font-oswald">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-1 mb-6">
                      <div className="w-1 h-4 bg-yellow-400 rounded-full" />
                      <h3 className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold">История транзакций</h3>
                    </div>

                    {bonusTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {bonusTransactions.map((tx: any) => (
                          <div key={tx.id} className="group bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-5">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                                tx.amount > 0 ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20"
                              )}>
                                {tx.amount > 0 ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                              </div>
                              <div>
                                <span className="block text-sm font-bold text-white mb-1 uppercase tracking-tight">{tx.description || 'Операция с бонусами'}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                    {new Date(tx.created_at).toLocaleDateString('ru-RU')}
                                  </span>
                                  <div className="w-1 h-1 rounded-full bg-white/10" />
                                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{tx.type}</span>
                                </div>
                              </div>
                            </div>
                            <div className={cn("text-xl font-bold font-oswald", tx.amount > 0 ? "text-emerald-400" : "text-rose-400")}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-white/10 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                        <History className="w-16 h-16 mb-4 opacity-20" />
                        <span className="text-sm font-bold uppercase tracking-widest">Транзакций пока нет</span>
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
