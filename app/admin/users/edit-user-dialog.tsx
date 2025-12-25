'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateUserProfile } from '@/lib/actions/admin-users'
import type { Profile } from '@/types/database'

interface EditUserDialogProps {
  user: Profile
  trigger?: React.ReactNode
}

export function EditUserDialog({ user, trigger }: EditUserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState<'user' | 'admin'>(user.role)
  const [tier, setTier] = useState<'free' | 'basic' | 'pro' | 'elite'>(user.subscription_tier)
  const [status, setStatus] = useState<'active' | 'inactive' | 'canceled'>(user.subscription_status)
  const [expiresAt, setExpiresAt] = useState(user.subscription_expires_at || '')
  const [bonusBalance, setBonusBalance] = useState<number>((user as any).bonus_balance || 0)
  const [cashbackLevel, setCashbackLevel] = useState<number>((user as any).cashback_level || 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await updateUserProfile(user.id, {
      role,
      subscription_tier: tier,
      subscription_status: status,
      subscription_expires_at: expiresAt || null,
      bonus_balance: bonusBalance,
      cashback_level: cashbackLevel,
    })

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Ошибка обновления')
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Редактировать</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user.email || ''} disabled className="bg-gray-50" />
          </div>

          <div>
            <Label>Роль</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {role === 'admin' ? 'Администратор' : 'Пользователь'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setRole('user')}>
                  Пользователь
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('admin')}>
                  Администратор
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Label>Тариф</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start capitalize">
                  {tier}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setTier('free')}>Free</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTier('basic')}>Basic</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTier('pro')}>Pro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTier('elite')}>Elite</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Label>Статус</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {status === 'active' ? 'Активна' : status === 'inactive' ? 'Неактивна' : 'Отменена'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setStatus('active')}>
                  Активна
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus('inactive')}>
                  Неактивна
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus('canceled')}>
                  Отменена
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Label>Действует до</Label>
            <Input
              type="datetime-local"
              value={expiresAt ? new Date(expiresAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Бонусная система</h3>
            
            <div className="space-y-3">
              <div>
                <Label>Баланс шагов</Label>
                <Input
                  type="number"
                  min="0"
                  value={bonusBalance}
                  onChange={(e) => setBonusBalance(Number(e.target.value))}
                />
              </div>

              <div>
                <Label>Уровень кешбека</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {cashbackLevel === 4 ? '💎 Platinum (10%)' :
                       cashbackLevel === 3 ? '🥇 Gold (7%)' :
                       cashbackLevel === 2 ? '🥈 Silver (5%)' : '🥉 Bronze (3%)'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setCashbackLevel(1)}>
                      🥉 Bronze (3%)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCashbackLevel(2)}>
                      🥈 Silver (5%)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCashbackLevel(3)}>
                      🥇 Gold (7%)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCashbackLevel(4)}>
                      💎 Platinum (10%)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

