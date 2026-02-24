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
  Zap,
  Shield,
  StickyNote,
  Trash2,
  Monitor,
  Smartphone,
  ChevronDown,
  ShieldCheck,
  Scale,
  Ruler,
  UserCircle,
  ArrowUpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserDetailsSheetProps {
  userId: string | null
  onClose: () => void
}

function UserDetailsContent({ userId, onClose }: UserDetailsSheetProps) {
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

  const levelOptions = [
    { value: '1', label: '🥉 Bronze', className: 'text-amber-600' },
    { value: '2', label: '🥈 Silver', className: 'text-gray-300' },
    { value: '3', label: '🥇 Gold', className: 'text-yellow-400 font-bold' },
    { value: '4', label: '💎 Platinum', className: 'text-purple-400 font-bold' },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0f0f13]">
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
          {/* Header Section */}
          <div className="p-5 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="relative group">
                <div className="relative">
                  <UserAvatar 
                    fullName={user.full_name}
                    avatarUrl={user.avatar_url}
                    email={user.email}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] ring-4 ring-white/5 shadow-2xl transition-transform group-hover:scale-[1.02] duration-500"
                  />
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <button 
                  onClick={() => handleUpdate('role', user.role === 'admin' ? 'user' : 'admin')}
                  className={cn(
                    "absolute -bottom-2 -right-2 p-3 rounded-2xl border shadow-2xl transition-all active:scale-90 hover:scale-110 z-10",
                    user.role === 'admin' 
                      ? "bg-purple-500 border-purple-400 text-white" 
                      : "bg-[#1a1a24] border-white/10 text-white/40 hover:text-white"
                  )}
                  title={user.role === 'admin' ? "Снять админа" : "Сделать админом"}
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-w-0 w-full text-center sm:text-left pt-2">
                <div className="space-y-1.5 mb-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white font-oswald uppercase tracking-tight truncate leading-none">
                    {user.full_name || 'Без имени'}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <span className={cn(
                      "text-[10px] uppercase font-black tracking-[0.2em] px-2.5 py-1 rounded-lg border",
                      user.role === 'admin' 
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                        : "bg-white/5 border-white/10 text-white/30"
                    )}>
                      {user.role === 'admin' ? 'Администратор' : 'Клиент'}
                    </span>
                    <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">
                      ID: {user.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] transition-all">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-none mb-1">Email</span>
                      <span className="text-sm font-medium text-white/70 truncate" suppressHydrationWarning>{user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] transition-all">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-none mb-1">Телефон</span>
                      <span className="text-sm font-medium text-white/70 truncate" suppressHydrationWarning>{user.phone || 'Не указан'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription & Physical Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 flex flex-wrap items-center gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                  <Shield className="w-32 h-32 rotate-12" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1">Подписка</span>
                  <div className="flex items-center gap-3">
                    <InlineSelect
                      value={user.subscription_tier}
                      options={tierOptions}
                      onSave={(val) => handleUpdate('subscription_tier', val)}
                      displayClassName={cn(
                        "h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border-0 ring-0 transition-all",
                        user.subscription_tier === 'elite' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' :
                        user.subscription_tier === 'pro' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' :
                        user.subscription_tier === 'basic' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' :
                        'bg-white/10 text-white/60'
                      )}
                    />
                    <InlineDateInput
                      value={user.subscription_expires_at}
                      onSave={(val) => handleUpdate('subscription_expires_at', val)}
                      disabled={user.subscription_tier === 'free'}
                    />
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-4 border-l border-white/5 pl-6">
                  <div className="text-right">
                    <span className="text-[10px] text-white/20 uppercase font-black tracking-widest block mb-1">LTV</span>
                    <span className="text-xl font-bold text-emerald-400 font-oswald leading-none">
                      {user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-5 grid grid-cols-3 gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                {[
                  { label: 'Возраст', value: user.age, icon: UserCircle, color: 'text-blue-400' },
                  { label: 'Рост', value: user.height, icon: Ruler, color: 'text-emerald-400' },
                  { label: 'Вес', value: user.weight, icon: Scale, color: 'text-orange-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <stat.icon className={cn("w-4 h-4 mb-2 opacity-20", stat.color)} />
                    <div className="text-lg font-bold text-white font-oswald leading-none mb-1">{stat.value || '—'}</div>
                    <div className="text-[9px] text-white/20 uppercase font-black tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Тренировки', value: stats?.workoutsCompleted || 0, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                { label: 'Статьи', value: stats?.articlesRead || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Бонусы', value: user.bonus_balance || 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                { label: 'Покупки', value: purchases.length, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-5 flex flex-col items-center text-center group hover:bg-white/[0.06] transition-all relative overflow-hidden">
                  <div className={cn("p-3 rounded-2xl mb-4 transition-transform group-hover:scale-110 relative z-10", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div className="text-2xl font-bold text-white font-oswald leading-none mb-2 relative z-10">{stat.value}</div>
                  <div className="text-[10px] text-white/30 uppercase font-black tracking-widest relative z-10">{stat.label}</div>
                  <div className={cn("absolute -bottom-4 -right-4 w-16 h-16 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity", stat.color)}>
                    <stat.icon className="w-full h-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-5 sm:px-8 sticky top-0 z-20 bg-[#0f0f13]/90 backdrop-blur-xl py-4 border-y border-white/5">
              <TabsList className="w-full bg-white/5 p-1.5 h-14 rounded-[1.25rem] gap-1">
                {[
                  { value: 'overview', icon: UserIcon, label: 'Общее', color: 'data-[state=active]:text-orange-400' },
                  { value: 'purchases', icon: CreditCard, label: 'Покупки', color: 'data-[state=active]:text-emerald-400' },
                  { value: 'intensives', icon: Zap, label: 'Интенсивы', color: 'data-[state=active]:text-purple-400' },
                  { value: 'activity', icon: TrendingUp, label: 'Активность', color: 'data-[state=active]:text-blue-400' },
                  { value: 'bonuses', icon: History, label: 'Бонусы', color: 'data-[state=active]:text-yellow-400' },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={cn(
                      "flex-1 gap-2 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all h-full data-[state=active]:bg-white/10",
                      tab.color
                    )}
                  >
                    <tab.icon className="w-4 h-4" /> 
                    <span className="hidden md:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-5 sm:p-8 pb-32">
              <TabsContent value="overview" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Info */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                      <h3 className="text-[12px] text-white/40 uppercase font-black tracking-[0.3em]">Система</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">ID</span>
                        <span className="font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded-xl text-[11px] border border-white/5">
                          {user.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">Регистрация</span>
                        <div className="flex items-center gap-2 text-white/70 font-bold">
                          <Calendar className="w-4 h-4 text-orange-400/40" />
                          {new Date(user.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button onClick={() => confirm('Сбросить пароль?') && alert('В разработке')} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-white/60 transition-all active:scale-95 border border-white/5">Сброс пароля</button>
                      <button onClick={() => prompt('Причина бана:') && alert('Забанен')} className="flex-1 py-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 text-[11px] font-black uppercase tracking-widest text-rose-400/60 transition-all active:scale-95 border border-rose-500/10">Бан</button>
                    </div>
                  </div>

                  {/* Loyalty Info */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      <h3 className="text-[12px] text-white/40 uppercase font-black tracking-[0.3em]">Лояльность</h3>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">Кэшбэк</span>
                        <InlineSelect
                          value={user.cashback_level?.toString() || '1'}
                          options={levelOptions}
                          onSave={(val) => handleUpdate('cashback_level', parseInt(val))}
                          displayClassName={cn(
                            "h-10 px-5 rounded-xl border-0 ring-0 text-[11px] font-black uppercase tracking-widest transition-all",
                            user.cashback_level === 4 ? 'bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/5' :
                            user.cashback_level === 3 ? 'bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/5' :
                            'bg-white/5 text-white/40'
                          )}
                        />
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">Шаги</span>
                        <InlineNumberInput value={user.bonus_balance || 0} onSave={(val) => handleUpdate('bonus_balance', val)} suffix="👟" />
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">Общий LTV</span>
                        <span className="font-bold text-emerald-400 text-2xl font-oswald">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity & Social */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      <h3 className="text-[12px] text-white/40 uppercase font-black tracking-[0.3em]">Последний вход</h3>
                    </div>
                    {authLogs && authLogs.length > 0 ? (
                      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-blue-500/[0.03] border border-blue-500/10">
                        <div className="p-5 rounded-[1.5rem] bg-blue-500/10 text-blue-400 shadow-xl shadow-blue-500/10">
                          {authLogs[0].device_type === 'mobile' ? <Smartphone className="w-8 h-8" /> : <Monitor className="w-8 h-8" />}
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white mb-1.5 font-oswald tracking-wide">{authLogs[0].ip_address}</div>
                          <div className="text-[11px] text-white/30 uppercase font-black tracking-[0.15em] flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            {authLogs[0].city || 'Неизвестно'} • {new Date(authLogs[0].created_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-xs text-white/10 italic font-black tracking-[0.3em] uppercase bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">Нет данных</div>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                      <h3 className="text-[12px] text-white/40 uppercase font-black tracking-[0.3em]">Связанные аккаунты</h3>
                    </div>
                    <div className="flex gap-4">
                      {[
                        { icon: Send, active: !!user.telegram_id, color: 'text-blue-400', label: 'Telegram' },
                        { icon: ExternalLink, active: !!user.yandex_id, color: 'text-rose-400', label: 'Yandex' },
                        { icon: UserIcon, active: !!user.profile_completed_at, color: 'text-emerald-400', label: 'Профиль' },
                      ].map((social, i) => (
                        <div key={i} className={cn(
                          "flex-1 aspect-square rounded-[2rem] flex flex-col items-center justify-center border-2 transition-all gap-3",
                          social.active 
                            ? "bg-white/[0.03] border-white/10 " + social.color 
                            : "bg-white/[0.01] border-white/5 text-white/5"
                        )}>
                          <social.icon className="w-8 h-8" />
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", social.active ? "text-white/40" : "text-white/5")}>
                            {social.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-4">
                  <div className="group">
                    <button onClick={() => setIsNotesExpanded(!isNotesExpanded)} className="w-full flex items-center justify-between p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 group-hover:bg-white/[0.06] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                          <StickyNote className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] text-white/60 uppercase font-black tracking-[0.2em]">Заметки администратора</span>
                      </div>
                      <ChevronDown className={cn("w-6 h-6 text-white/20 transition-transform duration-500", isNotesExpanded && "rotate-180")} />
                    </button>
                    {isNotesExpanded && (
                      <div className="mt-4 p-8 bg-white/[0.01] rounded-[2.5rem] border border-white/5 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="relative">
                          <textarea 
                            value={newNote} 
                            onChange={(e) => setNewNote(e.target.value)} 
                            placeholder="Напишите важное примечание о пользователе..." 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-base text-white min-h-[160px] focus:outline-none focus:border-orange-500/40 transition-all placeholder:text-white/10" 
                          />
                          <button 
                            onClick={handleSaveNote} 
                            disabled={!newNote.trim() || isSavingNote} 
                            className="absolute bottom-6 right-6 px-8 py-3.5 rounded-2xl bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-orange-500/40 active:scale-95 transition-all disabled:opacity-50"
                          >
                            Сохранить
                          </button>
                        </div>
                        <div className="space-y-4">
                          {adminNotes.map((note: any) => (
                            <div key={note.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4 group/note hover:bg-white/[0.04] transition-all">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                                    {note.admin?.full_name?.charAt(0) || 'A'}
                                  </div>
                                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                                    {note.admin?.full_name || 'Админ'} • {new Date(note.created_at).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                                <button onClick={() => handleDeleteNote(note.id)} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-white/5 hover:text-rose-400 opacity-0 group-hover/note:opacity-100 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-white/70 leading-relaxed font-medium px-2">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <button onClick={() => { if (!isLogsExpanded) fetchExtraData(); setIsLogsExpanded(!isLogsExpanded); }} className="w-full flex items-center justify-between p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 group-hover:bg-white/[0.06] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                          <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] text-white/60 uppercase font-black tracking-[0.2em]">История входов</span>
                      </div>
                      <ChevronDown className={cn("w-6 h-6 text-white/20 transition-transform duration-500", isLogsExpanded && "rotate-180")} />
                    </button>
                    {isLogsExpanded && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        {authLogs.map((log: any) => (
                          <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex justify-between items-center hover:bg-white/[0.04] transition-all group/log">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/log:text-blue-400 transition-colors">
                                {log.device_type === 'mobile' ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white font-oswald tracking-wide">{log.ip_address}</div>
                                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">{log.browser} • {log.os}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">{new Date(log.created_at).toLocaleDateString('ru-RU')}</div>
                              <div className="text-[10px] text-white/20 font-medium">{new Date(log.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="purchases" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {purchases.length > 0 ? (
                  purchases.map((p: any) => (
                    <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 hover:bg-white/[0.04] transition-all group">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110",
                            p.action === 'upgrade' ? "bg-purple-500/10 text-purple-400 shadow-purple-500/10" : "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10"
                          )}>
                            {p.action === 'upgrade' ? <ArrowUpCircle className="w-8 h-8" /> : <ShoppingBag className="w-8 h-8" />}
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white font-oswald uppercase tracking-tight leading-none mb-2">{p.products?.name || p.product_id}</div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[11px] text-white/30 uppercase font-black tracking-widest">{new Date(p.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="text-[11px] text-white/30 uppercase font-black tracking-widest">{p.payment_provider || 'ЮKassa'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0">
                          <div className="text-4xl font-bold text-emerald-400 font-oswald leading-none mb-2">{p.actual_paid_amount?.toLocaleString('ru-RU')} ₽</div>
                          {p.products?.price > p.actual_paid_amount && (
                            <div className="text-sm text-white/20 line-through font-bold tracking-wider">{p.products.price.toLocaleString('ru-RU')} ₽</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-8 border-t border-white/5">
                        {p.promo_code && (
                          <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5" /> Промо: {p.promo_code}
                          </div>
                        )}
                        {p.bonus_amount_used > 0 && (
                          <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5" /> Бонусы: -{p.bonus_amount_used} 👟
                          </div>
                        )}
                        {p.actual_paid_amount < (p.products?.price || p.amount) && (
                          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5" /> Экономия: {(p.products?.price || p.amount) - p.actual_paid_amount} ₽
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                    <ShoppingBag className="w-16 h-16 text-white/5 mx-auto mb-6" />
                    <span className="text-[14px] text-white/20 uppercase font-black tracking-[0.3em]">История покупок пуста</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="intensives" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {intensives.length > 0 ? (
                  intensives.map((i: any) => (
                    <div key={i.id} className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-8 hover:from-orange-500/15 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-orange-500/20 text-orange-400 shadow-2xl shadow-orange-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                          <Zap className="w-10 h-10" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white font-oswald uppercase tracking-tight mb-2">{i.products?.name}</div>
                          <div className="text-[11px] text-orange-400/60 uppercase font-black tracking-[0.2em]">Куплено {new Date(i.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}</div>
                        </div>
                      </div>
                      <div className="text-center sm:text-right w-full sm:w-auto">
                        <div className="text-4xl font-bold text-white font-oswald mb-2">{i.actual_paid_amount} ₽</div>
                        <div className="px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 inline-block">Доступ открыт</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                    <Zap className="w-16 h-16 text-white/5 mx-auto mb-6" />
                    <span className="text-[14px] text-white/20 uppercase font-black tracking-[0.3em]">Интенсивов пока нет</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-orange-500/[0.03] border border-orange-500/10 rounded-[2.5rem] p-8 group hover:bg-orange-500/[0.06] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <span className="text-[12px] text-white/40 uppercase font-black tracking-[0.2em]">Тренировки</span>
                    </div>
                    <div className="text-6xl font-bold text-white font-oswald relative z-10">{stats?.workoutsCompleted || 0}</div>
                    <Dumbbell className="absolute -bottom-6 -right-6 w-32 h-32 text-orange-500/5 rotate-12 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="bg-blue-500/[0.03] border border-blue-500/10 rounded-[2.5rem] p-8 group hover:bg-blue-500/[0.06] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[12px] text-white/40 uppercase font-black tracking-[0.2em]">Статьи</span>
                    </div>
                    <div className="text-6xl font-bold text-white font-oswald relative z-10">{stats?.articlesRead || 0}</div>
                    <BookOpen className="absolute -bottom-6 -right-6 w-32 h-32 text-blue-500/5 -rotate-12 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                    <h3 className="text-[12px] text-white/40 uppercase font-black tracking-[0.3em]">Дневник активности</h3>
                  </div>
                  {data?.lastDiaryEntries?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {data.lastDiaryEntries.map((entry: any, i: number) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.04] transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 text-white/20 flex items-center justify-center group-hover:text-orange-400 transition-colors">
                              <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                              <span className="text-2xl font-bold text-white font-oswald tracking-wide">{new Date(entry.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}</span>
                              <div className="text-[11px] text-white/20 uppercase font-black tracking-[0.2em] mt-1">{new Date(entry.date).getFullYear()} год</div>
                            </div>
                          </div>
                          <div className="flex gap-12">
                            {entry.metrics?.weight && (
                              <div className="text-center sm:text-right">
                                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Вес</div>
                                <div className="text-2xl font-bold text-white font-oswald">{entry.metrics.weight} <span className="text-sm text-white/30 ml-1">кг</span></div>
                              </div>
                            )}
                            {entry.metrics?.steps && (
                              <div className="text-center sm:text-right">
                                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Шаги</div>
                                <div className="text-2xl font-bold text-white font-oswald">{entry.metrics.steps.toLocaleString('ru-RU')}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                      <span className="text-[12px] text-white/20 uppercase font-black tracking-[0.3em]">Записей в дневнике пока нет</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bonuses" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-yellow-400/10 via-yellow-400/[0.02] to-transparent border border-yellow-400/20 rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl shadow-yellow-400/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Trophy className="w-48 h-48 rotate-12" />
                  </div>
                  
                  <div className="text-center md:text-left relative z-10">
                    <div className="text-[12px] text-yellow-400/60 uppercase font-black tracking-[0.4em] mb-4">Активные бонусы</div>
                    <div className="text-7xl font-bold text-white font-oswald flex items-baseline justify-center md:justify-start gap-4">
                      {user.bonus_balance || 0} 
                      <span className="text-4xl text-yellow-400 animate-pulse">👟</span>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-10 w-full md:w-auto">
                    <div className="text-[12px] text-white/20 uppercase font-black tracking-[0.4em] mb-4">Общий LTV</div>
                    <div className="text-5xl font-bold text-emerald-400 font-oswald">{user.total_spent_for_cashback?.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-1.5 h-6 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    <h3 className="text-[12px] text-white/40 uppercase font-black tracking-[0.3em]">История транзакций</h3>
                  </div>
                  {bonusTransactions.map((tx: any) => (
                    <div key={tx.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-transform group-hover:scale-110",
                          tx.amount > 0 ? "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5" : "bg-rose-500/10 text-rose-400 shadow-rose-500/5"
                        )}>
                          {tx.amount > 0 ? <Plus className="w-8 h-8" /> : <Minus className="w-8 h-8" />}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white uppercase tracking-tight mb-1.5 font-oswald">{tx.description || 'Операция'}</div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">{new Date(tx.created_at).toLocaleDateString('ru-RU')}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">{tx.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className={cn("text-3xl font-bold font-oswald", tx.amount > 0 ? "text-emerald-400" : "text-rose-400")}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                  ))}
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
        side="right"
        className="w-full sm:max-w-3xl bg-[#0f0f13] border-white/5 p-0 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"
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
        <UserDetailsContent userId={userId} onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
