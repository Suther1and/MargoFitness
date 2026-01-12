'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { updateUserProfile, uploadUserAvatar, deleteUserAvatar } from '@/lib/actions/user-profile'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types/database'

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

  const handleAvatarUpload = async () => {
    if (!selectedFile) return

    setUploadingAvatar(true)
    const uploadFormData = new FormData()
    uploadFormData.append('avatar', selectedFile)

    const result = await uploadUserAvatar(uploadFormData)
    
    if (result.success) {
      setAvatarPreview(null)
      setSelectedFile(null)
      router.refresh()
    } else {
      setErrors({ ...errors, avatar: result.error || 'Ошибка загрузки' })
    }
    
    setUploadingAvatar(false)
  }

  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true)
    const result = await deleteUserAvatar()
    
    if (result.success) {
      router.refresh()
    } else {
      setErrors({ ...errors, avatar: result.error || 'Ошибка удаления' })
    }
    
    setUploadingAvatar(false)
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
        // Вызываем колбэк если он передан
        if (onSuccess && result.data) {
          onSuccess(result.data as Profile)
        }
        // Сначала обновляем страницу
        router.refresh()
        // Ждем немного чтобы страница обновилась
        await new Promise(resolve => setTimeout(resolve, 100))
        // Потом закрываем диалог и очищаем превью
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

  const handleSkip = () => {
    updateUserProfile({})
    onOpenChange(false)
  }

  const canClose = !(isTelegramAccount && isFirstTime && hasTelegramEmail)

  return (
    <>
      <style jsx global>{`
        /* Плавный рендеринг шрифтов */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Force hide Dialog default close button */
        [data-slot="dialog-close"] {
          display: none !important;
        }
      `}</style>
      
      <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
        <DialogContent 
          className="max-w-sm p-0 border-0 bg-transparent overflow-visible"
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
          
          {/* Card - Dashboard style glassmorphism */}
          <div className="relative w-full max-w-[455px] mx-auto mt-8 mb-8 p-6 sm:p-8 overflow-hidden rounded-3xl bg-[#1a1a24]/80 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              tabIndex={-1}
              style={{ position: 'absolute', top: '3px', right: '3px', zIndex: 20, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', willChange: 'transform, opacity', outline: 'none' }}
              className="transition-all hover:opacity-70 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white/80 pointer-events-none">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>

            {/* Background effects like dashboard */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

            {/* Inner card with gradient - dashboard style */}
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur relative">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl leading-tight tracking-tight font-semibold text-white">
                  {isFirstTime ? 'Добро пожаловать!' : 'Редактировать профиль'}
                </h1>
                <p className="mt-2 text-sm font-normal text-white/70">
                  {isFirstTime 
                    ? 'Заполни информацию о себе'
                    : 'Обнови информацию твоего профиля'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Аватар */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group/avatar">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      tabIndex={-1}
                      className="relative outline-none"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/20 transition-all group-hover/avatar:ring-2 group-hover/avatar:ring-purple-400/50 active:scale-95">
                        <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                          {(avatarPreview || profile.avatar_url) ? (
                            <img 
                              src={avatarPreview || profile.avatar_url!} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                              {(formData.full_name || formData.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Edit overlay on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        {uploadingAvatar ? (
                          <Loader2 className="size-5 animate-spin text-white" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            <path d="m15 5 4 4"></path>
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {errors.avatar && (
                    <p className="text-xs text-red-400 mt-2">{errors.avatar}</p>
                  )}
                </div>

                {/* Форма */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="block text-xs font-medium uppercase tracking-wider text-white/60">
                      Имя
                    </label>
                    <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-purple-500/50 focus-within:ring-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input
                        id="full_name"
                        type="text"
                        placeholder="Твоё имя"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="ml-3 flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-white/60">
                      Email {isTelegramAccount && isFirstTime && <span className="text-red-400">*</span>}
                    </label>
                    <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-purple-500/50 focus-within:ring-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                      <input
                        id="email"
                        type="email"
                        placeholder={hasTelegramEmail ? "Введи твой email" : "email@example.com"}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required={isTelegramAccount && isFirstTime}
                        className="ml-3 flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                    {isTelegramAccount && isFirstTime && hasTelegramEmail && (
                      <p className="text-xs text-white/50">
                        Укажи твой реальный email - он нужен для уведомлений и связи
                      </p>
                    )}
                    {errors.email && (
                      <p className="text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-white/60">
                      Телефон
                    </label>
                    <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-purple-500/50 focus-within:ring-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+7 (999) 999-99-99"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={18}
                        className="ml-3 flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {errors.form && (
                  <div className="rounded-xl p-3" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <p className="text-xs text-red-400">{errors.form}</p>
                  </div>
                )}

                {/* Кнопки */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading || uploadingAvatar}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-600/20 ring-1 ring-purple-400/50 px-4 py-2.5 transition-all hover:from-purple-500/30 hover:to-indigo-600/30 hover:ring-purple-400/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ touchAction: 'manipulation', willChange: 'transform' }}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-white">
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                        {loading || uploadingAvatar ? (
                          <svg className="animate-spin h-4 w-4 text-purple-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-200">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
                
                {isTelegramAccount && isFirstTime && hasTelegramEmail && (
                  <p className="text-xs text-center text-white/50 mt-3">
                    Пожалуйста, укажи email для продолжения
                  </p>
                )}
              </form>

              {/* Logout Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <a 
                  href="/auth/logout" 
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-500/10 ring-1 ring-red-400/30 px-4 py-2.5 transition-all hover:bg-red-500/15 hover:ring-red-400/40 active:scale-95" 
                  style={{ touchAction: 'manipulation' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span className="text-red-200/90 font-medium text-sm">Выход</span>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

