'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserAvatar } from '@/components/user-avatar'
import { updateUserProfile, uploadUserAvatar, deleteUserAvatar } from '@/lib/actions/user-profile'
import { Upload, X, Loader2, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types/database'

interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  isFirstTime?: boolean
}

export function ProfileEditDialog({ 
  open, 
  onOpenChange, 
  profile,
  isFirstTime = false 
}: ProfileEditDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Проверяем, является ли это Telegram аккаунтом
  const isTelegramAccount = !!profile.telegram_id
  
  // Проверяем есть ли настоящий email (не технический)
  const hasTelegramEmail = profile.email?.includes('@telegram.local')
  const hasRealEmail = !hasTelegramEmail

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    email: hasRealEmail ? profile.email || '' : '',
    phone: profile.phone || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Форматирование телефона
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '')
    
    // Применяем маску +7 (999) 999-99-99
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
      // Проверка типа файла
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors({ ...errors, avatar: 'Неподдерживаемый формат. Используйте JPG, PNG или WEBP' })
        return
      }
      
      // Проверка размера (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Файл слишком большой. Максимум 5MB' })
        return
      }

      setSelectedFile(file)
      setErrors({ ...errors, avatar: '' })
      
      // Создаем preview
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
    const formData = new FormData()
    formData.append('avatar', selectedFile)

    const result = await uploadUserAvatar(formData)
    
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

    // Валидация для Telegram пользователей при первом входе
    if (isTelegramAccount && isFirstTime && !formData.email.trim()) {
      setErrors({ email: 'Email обязателен для Telegram аккаунтов' })
      setLoading(false)
      return
    }

    try {
      // Если есть выбранный файл, сначала загружаем его
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
        
        setAvatarPreview(null)
        setSelectedFile(null)
      }

      // Обновляем остальные данные профиля
      const result = await updateUserProfile({
        full_name: formData.full_name || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone || undefined,
      })

      if (result.success) {
        router.refresh()
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
    // Даже при пропуске отмечаем профиль как завершенный
    updateUserProfile({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isFirstTime ? 'Добро пожаловать!' : 'Редактировать профиль'}
          </DialogTitle>
          <DialogDescription>
            {isFirstTime 
              ? 'Заполните информацию о себе. Все поля необязательны и могут быть заполнены позже.'
              : 'Обновите информацию вашего профиля'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Аватар */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <UserAvatar
                avatarUrl={avatarPreview || profile.avatar_url}
                fullName={formData.full_name}
                email={formData.email}
                size="xl"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex gap-2">
              {selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Загрузить фото
                    </>
                  )}
                </Button>
              )}
              
              {(profile.avatar_url || selectedFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedFile) {
                      setSelectedFile(null)
                      setAvatarPreview(null)
                    } else {
                      handleDeleteAvatar()
                    }
                  }}
                  disabled={uploadingAvatar}
                >
                  <X className="mr-2 size-4" />
                  Удалить
                </Button>
              )}
            </div>

            {errors.avatar && (
              <p className="text-sm text-destructive">{errors.avatar}</p>
            )}
          </div>

          {/* Форма */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Имя</Label>
              <Input
                id="full_name"
                placeholder="Ваше имя"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email {isTelegramAccount && isFirstTime && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required={isTelegramAccount && isFirstTime}
              />
              {isTelegramAccount && isFirstTime && (
                <p className="text-xs text-muted-foreground">
                  Укажите ваш email - он нужен для входа и уведомлений
                </p>
              )}
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 999-99-99"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={18}
              />
            </div>
          </div>

          {errors.form && (
            <p className="text-sm text-destructive">{errors.form}</p>
          )}

          {/* Кнопки */}
          <div className="flex gap-3">
            {isFirstTime && !isTelegramAccount && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1"
              >
                Пропустить
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading || uploadingAvatar}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

