import { getOneTimePacks } from "@/lib/actions/products"
import { getCurrentProfile } from "@/lib/actions/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getTierDisplayName } from "@/lib/access-control"
import { PricingClient } from "./pricing-client"

export default async function PricingPage() {
  const packs = await getOneTimePacks()
  const profile = await getCurrentProfile()

  return (
    <div className="container mx-auto space-y-16 py-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Тарифы и цены</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Выберите подходящий план подписки или купите отдельные программы тренировок
        </p>
        {profile && (
          <p className="text-sm text-muted-foreground">
            Ваш текущий тариф: <strong>{getTierDisplayName(profile.subscription_tier)}</strong>
          </p>
        )}
      </div>

      {/* Подписки с переключателем периодов */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Подписки</h2>
          <p className="mt-2 text-muted-foreground">
            Полный доступ к библиотеке тренировок по уровням
          </p>
        </div>

        <PricingClient profile={profile} />
      </section>

      {/* One-Time Packs */}
      {packs.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Программы тренировок</h2>
            <p className="mt-2 text-muted-foreground">
              Купите один раз — владейте навсегда
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <Card key={pack.id}>
                <CardHeader>
                  <CardTitle>{pack.name}</CardTitle>
                  <CardDescription>
                    {pack.description || 'Специальная программа тренировок'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{pack.price} ₽</span>
                    <span className="text-sm text-muted-foreground">один раз</span>
                  </div>
                  
                  {profile ? (
                    <Button className="w-full">
                      Купить программу
                    </Button>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full">
                        Зарегистрироваться
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* FAQ или дополнительная информация */}
      <section className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Информация о платежах</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Принимаем российские карты МИР, Visa, Mastercard</p>
            <p>• Автоматическое продление подписки (можно отключить)</p>
            <p>• Подписку можно отменить в любой момент</p>
            <p>• Купленные программы остаются с вами навсегда</p>
            <p>• Безопасные платежи через ЮKassa</p>
            <p>• Чем длиннее период, тем больше скидка</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

