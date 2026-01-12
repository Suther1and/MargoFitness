'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { updateUserProfile, uploadUserAvatar } from '@/lib/actions/user-profile'
import { Loader2, User, Mail, Phone, Pencil, LogOut, Check, X, Camera, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  isFirstTime?: boolean
  onSuccess?: (updatedProfile: Profile) => void
}

export function ProfileEditDialog({ 
  open, 
  onOpenChange, 
  profile,
  isFirstTime = false,
  onSuccess
}: ProfileEditDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const isTelegramAccount = !!profile.telegram_id
  const hasTelegramEmail = profile.email?.includes('@telegram.local')

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    email: profile.email?.includes('@telegram.local') ? '' : (profile.email || ''),
    phone: profile.phone || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length === 0) return ''
    if (cleaned.length <= 1) return `+${cleaned}`
    if (cleaned.length <= 4) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`
    if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`
    if (cleaned.length <= 9) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors({ ...errors, avatar: 'Неподдерживаемый формат. Используй JPG, PNG или WEBP' })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Файл слишком большой. Максимум 5MB' })
        return
      }

      setSelectedFile(file)
      setErrors({ ...errors, avatar: '' })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setErrors({})

    if (isTelegramAccount && isFirstTime && !formData.email.trim()) {
      setErrors({ email: 'Email обязателен для Telegram аккаунтов' })
      setLoading(false)
      return
    }

    try {
      if (selectedFile) {
        setUploadingAvatar(true)
        const avatarFormData = new FormData()
        avatarFormData.append('avatar', selectedFile)

        const avatarResult = await uploadUserAvatar(avatarFormData)
        setUploadingAvatar(false)
        
        if (!avatarResult.success) {
          setErrors({ avatar: avatarResult.error || 'Ошибка загрузки аватара' })
          setLoading(false)
          return
        }
      }

      const result = await updateUserProfile({
        full_name: formData.full_name || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone || undefined,
      })

      if (result.success) {
        if (onSuccess && result.data) {
          onSuccess(result.data as Profile)
        }
        router.refresh()
        await new Promise(resolve => setTimeout(resolve, 100))
        setAvatarPreview(null)
        setSelectedFile(null)
        onOpenChange(false)
      } else {
        setErrors({ form: result.error || 'Ошибка при сохранении' })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ form: 'Произошла ошибка при сохранении' })
    } finally {
      setLoading(false)
      setUploadingAvatar(false)
    }
  }

  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          gradient: 'from-yellow-300/40 to-yellow-500/40',
          shadow: 'shadow-yellow-500/20',
          icon: 'text-yellow-500',
          hoverBorder: 'hover:border-yellow-400/30',
          accentColor: '#eab308',
          buttonBg: 'bg-yellow-500 hover:bg-yellow-400 text-black',
        }
      case 'pro':
        return {
          text: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          gradient: 'from-purple-400/40 to-purple-600/40',
          shadow: 'shadow-purple-500/20',
          icon: 'text-purple-500',
          hoverBorder: 'hover:border-purple-500/30',
          accentColor: '#a855f7',
          buttonBg: 'bg-purple-500 hover:bg-purple-400 text-white',
        }
      case 'basic':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          gradient: 'from-orange-400/40 to-orange-600/40',
          shadow: 'shadow-orange-500/20',
          icon: 'text-orange-500',
          hoverBorder: 'hover:border-orange-500/30',
          accentColor: '#f97316',
          buttonBg: 'bg-orange-500 hover:bg-orange-400 text-black',
        }
      default:
        return {
          text: 'text-white/60',
          bg: 'bg-white/5',
          border: 'border-white/10',
          gradient: 'from-white/20 to-white/10',
          shadow: 'shadow-white/5',
          icon: 'text-white/40',
          hoverBorder: 'hover:border-white/20',
          accentColor: '#ffffff',
          buttonBg: 'bg-white/10 hover:bg-white/20 text-white',
        }
    }
  }

  const styles = getTierStyles(profile.subscription_tier)
  const canClose = !(isTelegramAccount && isFirstTime && hasTelegramEmail)

  // Форматирование даты регистрации
  const registrationDate = profile.created_at ? new Date(profile.created_at) : null
  const formattedRegistrationDate = registrationDate ? (() => {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${months[registrationDate.getMonth()]} ${registrationDate.getFullYear()}`;
  })() : null

  return (
    <>
      <style jsx global>{`
        [data-slot="dialog-close"] {
          display: none !important;
        }
        
        .grain-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.015;
          pointer-events: none;
        }

        /* Custom scrollbar for mobile */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
      
      <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
        <DialogContent 
          className="w-[calc(100%-32px)] sm:max-w-[400px] h-fit max-h-[90vh] p-0 border-0 !bg-transparent !shadow-none focus:ring-0 focus:outline-none overflow-visible"
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            if (!canClose) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (!canClose) e.preventDefault()
          }}
        >
          <DialogTitle className="sr-only">
            {isFirstTime ? 'Добро пожаловать!' : 'Редактировать профиль'}
          </DialogTitle>
          
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "relative w-full h-full max-h-[90vh] rounded-[2.5rem] sm:rounded-[3rem] bg-[#0c0c12] border backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col",
              styles.border
            )}
          >
            {/* Background Layer with Grain */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 grain-overlay" />
              {/* Background decorative elements */}
              <div className={cn(
                "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20",
                styles.bg.replace('/10', '/30')
              )} />
              <div className={cn(
                "absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-10",
                styles.bg.replace('/10', '/30')
              )} />
            </div>

            {/* Scrollable Content Container */}
            <div className="relative z-10 p-6 sm:p-9 overflow-y-auto custom-scrollbar flex-1">
              {/* Header section */}
              <div className="relative flex flex-col items-center mb-6 sm:mb-8">
                {canClose && (
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 p-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 z-20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Avatar section */}
                <div className="mb-5 relative">
                  <div
                    className={cn(
                      "w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-full p-[3px] bg-gradient-to-br shadow-2xl ring-1 ring-white/5",
                      styles.gradient
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="w-full h-full rounded-full bg-[#09090b] p-1 overflow-hidden relative group"
                    >
                      {(avatarPreview || profile.avatar_url) ? (
                        <img 
                          src={avatarPreview || profile.avatar_url!} 
                          alt="Avatar" 
                          className="w-full h-full object-cover rounded-full transition-all duration-500 group-hover:blur-[2px]" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10 bg-white/[0.02] rounded-full">
                          <User className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 rounded-full">
                        {uploadingAvatar ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Edit icon badge (right) */}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-4 border-[#0c0c12] flex items-center justify-center shadow-lg z-10",
                    styles.buttonBg
                  )}>
                    <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-current" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="font-oswald text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight leading-none mb-2">
                    {isFirstTime ? 'Добро пожаловать' : 'Профиль'}
                  </h2>
                  <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold">
                    личного кабинета margofitness.pro
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields */}
                <div className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label htmlFor="full_name" className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">
                      Ваше имя
                    </label>
                    <div className={cn(
                      "relative group flex items-center rounded-2xl bg-white/[0.03] border transition-all duration-300",
                      styles.border,
                      "hover:bg-white/[0.05] focus-within:bg-white/[0.05] focus-within:border-white/20"
                    )}>
                      <div className="pl-5 text-white/10 group-focus-within:text-white/30 transition-colors shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="full_name"
                        type="text"
                        placeholder="Имя Фамилия"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full bg-transparent py-3.5 px-4 text-[16px] sm:text-sm text-white placeholder:text-white/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 flex justify-between">
                      <span>Электронная почта</span>
                      {isTelegramAccount && isFirstTime && <span className="text-red-500">* обязательна</span>}
                    </label>
                    <div className={cn(
                      "relative group flex items-center rounded-2xl bg-white/[0.03] border transition-all duration-300",
                      styles.border,
                      "hover:bg-white/[0.05] focus-within:bg-white/[0.05] focus-within:border-white/20"
                    )}>
                      <div className="pl-5 text-white/10 group-focus-within:text-white/30 transition-colors shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required={isTelegramAccount && isFirstTime}
                        className="w-full bg-transparent py-3.5 px-4 text-[16px] sm:text-sm text-white placeholder:text-white/10 focus:outline-none"
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">
                      Телефон
                    </label>
                    <div className={cn(
                      "relative group flex items-center rounded-2xl bg-white/[0.03] border transition-all duration-300",
                      styles.border,
                      "hover:bg-white/[0.05] focus-within:bg-white/[0.05] focus-within:border-white/20"
                    )}>
                      <div className="pl-5 text-white/10 group-focus-within:text-white/30 transition-colors shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={18}
                        className="w-full bg-transparent py-3.5 px-4 text-[16px] sm:text-sm text-white placeholder:text-white/10 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Hidden Avatar Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <AnimatePresence>
                  {errors.avatar && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-3"
                    >
                      {errors.avatar}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="space-y-6 pt-2">
                  <button
                    type="submit"
                    disabled={loading || uploadingAvatar}
                    className={cn(
                      "w-full h-[56px] sm:h-[60px] rounded-2xl font-oswald text-lg sm:text-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl",
                      styles.buttonBg
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Сохранить изменения</span>
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {!isFirstTime && (
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">danger zone</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                  )}

                  {!isFirstTime && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href="/auth/logout"
                        className="h-12 w-full rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/60 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-[0.98]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Выйти</span>
                      </a>
                      
                      <button
                        type="button"
                        className="h-12 w-full rounded-xl bg-white/5 border border-white/10 text-white/40 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Сменить пароль</span>
                      </button>
                    </div>
                  )}
                  
                  {isTelegramAccount && isFirstTime && hasTelegramEmail && (
                    <p className="text-[10px] text-center text-white/20 uppercase tracking-widest leading-relaxed">
                      Пожалуйста, укажите почту для доступа<br/>к полному функционалу системы
                    </p>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}
