import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getPromoCodes } from '@/lib/actions/promo-codes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreatePromoDialog } from './create-promo-dialog'
import { PromoCodesList } from './promo-codes-list'
import { Tag } from 'lucide-react'

export const metadata = {
  title: 'Промокоды | Админка',
  description: 'Управление промокодами',
}

export default async function PromoCodesPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const result = await getPromoCodes()
  const promoCodes = result.data || []

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="size-8" />
            Промокоды
          </h1>
          <p className="text-muted-foreground mt-2">
            Создание и управление промокодами для скидок
          </p>
        </div>
        <CreatePromoDialog />
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего промокодов</CardDescription>
            <CardTitle className="text-3xl">{promoCodes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Активные</CardDescription>
            <CardTitle className="text-3xl">
              {promoCodes.filter(p => p.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего использований</CardDescription>
            <CardTitle className="text-3xl">
              {promoCodes.reduce((sum, p) => sum + p.usage_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Истекших</CardDescription>
            <CardTitle className="text-3xl">
              {promoCodes.filter(p => 
                p.expires_at && new Date(p.expires_at) < new Date()
              ).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Список промокодов */}
      <PromoCodesList promoCodes={promoCodes} />
    </div>
  )
}


