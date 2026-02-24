'use client'

import { InlineSelect, InlineNumberInput, InlineDateInput } from './inline-edit-cell'
import { CancelSubscriptionButton } from './cancel-subscription-button'
import { updateUserProfile } from '@/lib/actions/admin-users'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'

interface UserTableRowProps {
  user: any
}

export function UserTableRow({ user }: UserTableRowProps) {
  const router = useRouter()

  const handleUpdate = async (field: string, value: any) => {
    const updateData: any = {}
    updateData[field] = value

    const result = await updateUserProfile(user.id, updateData)
    
    if (result.success) {
      // Генерируем событие для обновления профиля в других вкладках/компонентах
      const updateEvent = { userId: user.id, field, value };
      window.dispatchEvent(new CustomEvent('subscription-updated', { 
        detail: updateEvent 
      }))
      
      router.refresh()
    } else {
      console.error('Error updating user:', result.error)
      alert(`Ошибка: ${result.error}`)
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

  const statusOptions = [
    { value: 'active', label: 'Активна', className: 'text-emerald-400 font-bold' },
    { value: 'inactive', label: 'Неактивна', className: 'text-gray-400' },
    { value: 'canceled', label: 'Отменена', className: 'text-rose-400 font-bold' },
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

  const statusDisplayClass = 
    user.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' :
    user.subscription_status === 'canceled' ? 'bg-rose-500/10 text-rose-400 ring-rose-500/30' :
    'bg-white/5 text-white/40 ring-white/10'

  const levelDisplayClass =
    user.cashback_level === 4 ? 'bg-purple-500/10 text-purple-400 ring-purple-500/30' :
    user.cashback_level === 3 ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30' :
    user.cashback_level === 2 ? 'bg-white/10 text-white/80 ring-white/20' :
    'bg-amber-500/10 text-amber-600 ring-amber-500/30'

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            fullName={user.full_name}
            avatarUrl={user.avatar_url}
            email={user.email}
            className="w-10 h-10 rounded-xl ring-1 ring-white/10"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate max-w-[200px]">
              {user.full_name || 'Без имени'}
            </span>
            <span className="text-xs text-white/40 truncate max-w-[200px]">
              {user.email}
            </span>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <InlineSelect
          value={user.subscription_tier}
          options={tierOptions}
          onSave={(value) => handleUpdate('subscription_tier', value)}
          displayClassName={tierDisplayClass}
        />
      </td>
      
      <td className="p-4">
        <InlineSelect
          value={user.subscription_status}
          options={statusOptions}
          onSave={(value) => handleUpdate('subscription_status', value)}
          displayClassName={statusDisplayClass}
        />
      </td>
      
      <td className="p-4">
        <InlineDateInput
          value={user.subscription_expires_at}
          onSave={(value) => handleUpdate('subscription_expires_at', value)}
        />
      </td>
      
      <td className="p-4">
        <InlineNumberInput
          value={user.bonus_balance || 0}
          onSave={(value) => handleUpdate('bonus_balance', value)}
          min={0}
          suffix="👟"
        />
      </td>
      
      <td className="p-4">
        <InlineSelect
          value={user.cashback_level?.toString() || '1'}
          options={levelOptions}
          onSave={(value) => handleUpdate('cashback_level', parseInt(value))}
          displayClassName={levelDisplayClass}
        />
      </td>
      
      <td className="p-4">
        <InlineSelect
          value={user.role}
          options={roleOptions}
          onSave={(value) => handleUpdate('role', value)}
          displayClassName={roleDisplayClass}
        />
      </td>
      
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CancelSubscriptionButton 
            userId={user.id}
            userEmail={user.email || ''}
            hasActiveSubscription={user.subscription_status === 'active'}
          />
        </div>
      </td>
    </tr>
  )
}
