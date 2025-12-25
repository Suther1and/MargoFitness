'use client'

import { InlineSelect, InlineNumberInput, InlineDateInput } from './inline-edit-cell'
import { CancelSubscriptionButton } from './cancel-subscription-button'
import { updateUserProfile } from '@/lib/actions/admin-users'
import { useRouter } from 'next/navigation'

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
      router.refresh()
    } else {
      console.error('Error updating user:', result.error)
      alert(`Ошибка: ${result.error}`)
    }
  }

  const roleOptions = [
    { value: 'user', label: 'Пользователь', className: 'bg-gray-100 text-gray-800' },
    { value: 'admin', label: 'Админ', className: 'bg-purple-100 text-purple-800' },
  ]

  const tierOptions = [
    { value: 'free', label: 'FREE', className: 'bg-gray-100 text-gray-800 uppercase' },
    { value: 'basic', label: 'BASIC', className: 'bg-green-100 text-green-800 uppercase' },
    { value: 'pro', label: 'PRO', className: 'bg-blue-100 text-blue-800 uppercase' },
    { value: 'elite', label: 'ELITE', className: 'bg-yellow-100 text-yellow-800 uppercase' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Активна', className: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Неактивна', className: 'bg-gray-100 text-gray-800' },
    { value: 'canceled', label: 'Отменена', className: 'bg-red-100 text-red-800' },
  ]

  const levelOptions = [
    { value: '1', label: '🥉 Bronze', className: 'bg-amber-100 text-amber-800' },
    { value: '2', label: '🥈 Silver', className: 'bg-gray-200 text-gray-800' },
    { value: '3', label: '🥇 Gold', className: 'bg-yellow-100 text-yellow-800' },
    { value: '4', label: '💎 Platinum', className: 'bg-purple-100 text-purple-800' },
  ]

  const roleDisplayClass = user.role === 'admin' 
    ? 'bg-purple-100 text-purple-800' 
    : 'bg-gray-100 text-gray-800'

  const tierDisplayClass = 
    user.subscription_tier === 'elite' ? 'bg-yellow-100 text-yellow-800 uppercase' :
    user.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800 uppercase' :
    user.subscription_tier === 'basic' ? 'bg-green-100 text-green-800 uppercase' :
    'bg-gray-100 text-gray-800 uppercase'

  const statusDisplayClass = 
    user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
    user.subscription_status === 'canceled' ? 'bg-red-100 text-red-800' :
    'bg-gray-100 text-gray-800'

  const levelDisplayClass =
    user.cashback_level === 4 ? 'bg-purple-100 text-purple-800' :
    user.cashback_level === 3 ? 'bg-yellow-100 text-yellow-800' :
    user.cashback_level === 2 ? 'bg-gray-200 text-gray-800' :
    'bg-amber-100 text-amber-800'

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2 text-sm">{user.email}</td>
      
      <td className="p-2">
        <InlineSelect
          value={user.subscription_tier}
          options={tierOptions}
          onSave={(value) => handleUpdate('subscription_tier', value)}
          displayClassName={tierDisplayClass}
        />
      </td>
      
      <td className="p-2">
        <InlineSelect
          value={user.subscription_status}
          options={statusOptions}
          onSave={(value) => handleUpdate('subscription_status', value)}
          displayClassName={statusDisplayClass}
        />
      </td>
      
      <td className="p-2">
        <InlineDateInput
          value={user.subscription_expires_at}
          onSave={(value) => handleUpdate('subscription_expires_at', value)}
        />
      </td>
      
      <td className="p-2">
        <InlineNumberInput
          value={user.bonus_balance || 0}
          onSave={(value) => handleUpdate('bonus_balance', value)}
          min={0}
          suffix="шагов"
        />
      </td>
      
      <td className="p-2">
        <InlineSelect
          value={user.cashback_level?.toString() || '1'}
          options={levelOptions}
          onSave={(value) => handleUpdate('cashback_level', parseInt(value))}
          displayClassName={levelDisplayClass}
        />
      </td>
      
      <td className="p-2">
        <InlineSelect
          value={user.role}
          options={roleOptions}
          onSave={(value) => handleUpdate('role', value)}
          displayClassName={roleDisplayClass}
        />
      </td>
      
      <td className="p-2 text-right">
        <CancelSubscriptionButton 
          userId={user.id}
          userEmail={user.email || ''}
          hasActiveSubscription={user.subscription_status === 'active'}
        />
      </td>
    </tr>
  )
}

