'use client'

import { InlineSelect, InlineNumberInput, InlineDateInput } from './inline-edit-cell'
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

    // Если мы устанавливаем дату истечения, автоматически ставим статус 'active'
    if (field === 'subscription_expires_at' && value !== null) {
      updateData['subscription_status'] = 'active'
    }
    
    // Если мы сбрасываем дату истечения, ставим статус 'inactive' и тариф 'free'
    if (field === 'subscription_expires_at' && value === null) {
      updateData['subscription_status'] = 'inactive'
      updateData['subscription_tier'] = 'free'
    }

    // Если мы меняем тариф на FREE, сбрасываем дату истечения и статус
    if (field === 'subscription_tier' && value === 'free') {
      updateData['subscription_expires_at'] = null
      updateData['subscription_status'] = 'inactive'
    }

    // Если мы меняем тариф на любой кроме FREE, и даты нет — можно поставить статус active
    if (field === 'subscription_tier' && value !== 'free' && !user.subscription_expires_at) {
      updateData['subscription_status'] = 'active'
    }

    try {
      const result = await updateUserProfile(user.id, updateData)
      
      if (result.success) {
        // Генерируем событие для обновления профиля в других вкладках/компонентах
        const updateEvent: any = { userId: user.id, field, value };
        
        // Если мы перешли на FREE, уведомляем о сбросе даты и статуса
        if (field === 'subscription_tier' && value === 'free') {
          updateEvent.subscription_expires_at = null;
          updateEvent.subscription_status = 'inactive';
        }

        // Если мы установили дату, уведомляем об изменении статуса
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
      // Если это ошибка fetch (таймаут), данные скорее всего сохранились
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
      <td className="p-4 w-[30%]">
        <div className="flex items-center gap-4 pl-4">
          <div className="relative flex-shrink-0">
            <UserAvatar 
              fullName={user.full_name}
              avatarUrl={user.avatar_url}
              email={user.email}
              className="w-11 h-11 rounded-2xl ring-2 ring-white/5 shadow-2xl"
            />
            <div className={cn(
              "absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-[#0C0C11] ring-1 ring-white/10",
              user.subscription_status === 'active' ? "bg-emerald-500" : "bg-white/20"
            )} />
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
      
      <td className="p-4 w-[15%] text-center">
        <div className="flex justify-center">
          <InlineSelect
            value={user.subscription_tier}
            options={tierOptions}
            onSave={(value) => handleUpdate('subscription_tier', value)}
            displayClassName={tierDisplayClass}
          />
        </div>
      </td>
      
      <td className="p-4 w-[20%] text-center">
        <div className="flex justify-center">
          <InlineDateInput
            value={user.subscription_expires_at}
            onSave={(value) => handleUpdate('subscription_expires_at', value)}
            disabled={user.subscription_tier === 'free'}
            disabledMessage="Для тарифа FREE срок не устанавливается"
          />
        </div>
      </td>
      
      <td className="p-4 w-[15%] text-center">
        <div className="flex justify-center">
          <InlineNumberInput
            value={user.bonus_balance || 0}
            onSave={(value) => handleUpdate('bonus_balance', value)}
            min={0}
            suffix="👟"
          />
        </div>
      </td>
      
      <td className="p-4 w-[10%] text-center">
        <div className="flex justify-center">
          <InlineSelect
            value={user.cashback_level?.toString() || '1'}
            options={levelOptions}
            onSave={(value) => handleUpdate('cashback_level', parseInt(value))}
            displayClassName={levelDisplayClass}
          />
        </div>
      </td>
      
      <td className="p-4 w-[10%] text-center">
        <div className="flex justify-center">
          <InlineSelect
            value={user.role}
            options={roleOptions}
            onSave={(value) => handleUpdate('role', value)}
            displayClassName={roleDisplayClass}
          />
        </div>
      </td>
    </tr>
  )
}
