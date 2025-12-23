'use client'

import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  avatarUrl?: string | null
  fullName?: string | null
  email?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/**
 * Компонент аватара пользователя с заглушкой
 * - Показывает фото если есть
 * - Показывает инициалы если есть имя
 * - Показывает иконку если нет данных
 */
export function UserAvatar({ 
  avatarUrl, 
  fullName, 
  email, 
  size = 'md',
  className 
}: UserAvatarProps) {
  // Определяем размеры
  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-12 text-sm',
    lg: 'size-16 text-base',
    xl: 'size-24 text-xl',
  }

  // Получаем инициалы из имени или email
  const getInitials = () => {
    if (fullName) {
      const parts = fullName.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return fullName.slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return null
  }

  // Генерируем цвет на основе имени/email
  const getBackgroundColor = () => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ]
    const str = fullName || email || ''
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const initials = getInitials()

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-primary/10',
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl ? (
        // Показываем фото
        <img
          src={avatarUrl}
          alt={fullName || email || 'User avatar'}
          className="size-full object-cover"
        />
      ) : initials ? (
        // Показываем инициалы
        <div
          className={cn(
            'flex size-full items-center justify-center font-semibold text-white',
            getBackgroundColor()
          )}
        >
          {initials}
        </div>
      ) : (
        // Показываем иконку
        <div className="flex size-full items-center justify-center bg-muted">
          <User className="size-1/2 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

