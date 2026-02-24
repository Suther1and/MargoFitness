'use client'

import { InlineSelect, InlineNumberInput, InlineDateInput } from './inline-edit-cell'
import { updateUserProfile } from '@/lib/actions/admin-users'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import { UserDetailsSheet } from './user-details-sheet'

interface UserTableRowProps {
  user: any
}

export function UserTableRow({ user }: UserTableRowProps) {
  const router = useRouter()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleRowClick = useCallback((e: React.MouseEvent) => {
    // Не открываем шторку, если кликнули по интерактивным элементам
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="menuitem"]') || target.closest('[data-radix-portal]')) {
      return;
    }
    setIsDetailsOpen(true)
  }, [])

  const handleSheetClose = useCallback(() => {
    setIsDetailsOpen(false)
  }, [])

  const handleUpdate = async (field: string, value: any) => {
    const updateData: any = {}
    updateData[field] = value

    if (field === 'subscription_expires_at' && value !== null) {
      updateData['subscription_status'] = 'active'
    }
    
    if (field === 'subscription_expires_at' && value === null) {
      updateData['subscription_status'] = 'inactive'
      updateData['subscription_tier'] = 'free'
    }

    if (field === 'subscription_tier' && value === 'free') {
      updateData['subscription_expires_at'] = null
      updateData['subscription_status'] = 'inactive'
    }

    if (field === 'subscription_tier' && value !== 'free' && !user.subscription_expires_at) {
      updateData['subscription_status'] = 'active'
    }

    try {
      const result = await updateUserProfile(user.id, updateData)
      
      if (result.success) {
        const updateEvent: any = { userId: user.id, field, value };
        
        if (field === 'subscription_tier' && value === 'free') {
          updateEvent.subscription_expires_at = null;
          updateEvent.subscription_status = 'inactive';
        }

        if (field === 'subscription_expires_at' && value !== null) {
          updateEvent.subscription_status = 'active';
        }

        window.dispatchEvent(new CustomEvent('subscription-updated', { 
          detail: updateEvent 
        }))
        
        router.refresh()
      } else {
        console.error('Error updating user:', result.error)
        alert(`Ошибка: ${result.error}`)
      }
    } catch (err: any) {
      console.error('Network or server error:', err)
      if (err.message?.includes('fetch failed')) {
        router.refresh()
      } else {
        alert(`Произошла ошибка при связи с сервером. Пожалуйста, обновите страницу.`)
      }
    }
  }

  const roleOptions = [
    { value: 'user', label: 'Пользователь', className: 'text-white/70' },
    { value: 'admin', label: 'Админ', className: 'text-purple-400 font-bold' },
  ]

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

  const roleDisplayClass = user.role === 'admin' 
    ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' 
    : 'bg-white/5 text-white/60 ring-white/10'

  const tierDisplayClass = 
    user.subscription_tier === 'elite' ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30' :
    user.subscription_tier === 'pro' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' :
    user.subscription_tier === 'basic' ? 'bg-orange-500/10 text-orange-400 ring-orange-400/30' :
    'bg-white/5 text-white/40 ring-white/10'

  const levelDisplayClass =
    user.cashback_level === 4 ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' :
    user.cashback_level === 3 ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30' :
    user.cashback_level === 2 ? 'bg-white/10 text-white/80 ring-white/20' :
    'bg-amber-500/10 text-amber-600 ring-amber-500/30'

  return (
    <>
      <tr 
        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
        onClick={handleRowClick}
      >
        <td className="p-4 w-[25%]">
          <div className="flex items-center gap-4 pl-4">
            <div className="relative flex-shrink-0">
              <UserAvatar 
                fullName={user.full_name}
                avatarUrl={user.avatar_url}
                email={user.email}
                className="w-11 h-11 rounded-2xl ring-2 ring-white/5 shadow-2xl"
              />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-bold text-white truncate max-w-[200px] tracking-tight">
                {user.full_name || 'Без имени'}
              </span>
              <span className="text-[11px] text-white/30 truncate max-w-[200px] font-medium">
                {user.email}
              </span>
            </div>
          </div>
        </td>
        
        <td className="p-4 w-[15%] text-center text-xs text-white/40 font-medium">
          {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '—'}
        </td>
        
        <td className="p-4 w-[15%] text-center" onClick={(e) => e.stopPropagation()}>
          <div className="justify-center flex">
            <InlineSelect
              value={user.subscription_tier}
              options={tierOptions}
              onSave={(value) => handleUpdate('subscription_tier', value)}
              displayClassName={tierDisplayClass}
            />
          </div>
        </td>
        
        <td className="p-4 w-[15%] text-center" onClick={(e) => e.stopPropagation()}>
          <div className="justify-center flex">
            <InlineDateInput
              value={user.subscription_expires_at}
              onSave={(value) => handleUpdate('subscription_expires_at', value)}
              disabled={user.subscription_tier === 'free'}
              disabledMessage="Для тарифа FREE срок не устанавливается"
            />
          </div>
        </td>
        
        <td className="p-4 w-[10%] text-center" onClick={(e) => e.stopPropagation()}>
          <div className="justify-center flex">
            <InlineNumberInput
              value={user.bonus_balance || 0}
              onSave={(value) => handleUpdate('bonus_balance', value)}
              min={0}
              suffix="👟"
            />
          </div>
        </td>
        
        <td className="p-4 w-[10%] text-center" onClick={(e) => e.stopPropagation()}>
          <div className="justify-center flex">
            <InlineSelect
              value={user.cashback_level?.toString() || '1'}
              options={levelOptions}
              onSave={(value) => handleUpdate('cashback_level', parseInt(value))}
              displayClassName={levelDisplayClass}
            />
          </div>
        </td>
        
        <td className="p-4 w-[10%] text-center" onClick={(e) => e.stopPropagation()}>
          <div className="justify-center flex">
            <InlineSelect
              value={user.role}
              options={roleOptions}
              onSave={(value) => handleUpdate('role', value)}
              displayClassName={roleDisplayClass}
            />
          </div>
        </td>
      </tr>
      <UserDetailsSheet 
        userId={isDetailsOpen ? user.id : null} 
        onClose={handleSheetClose} 
      />
    </>
  )
}
