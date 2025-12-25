import { getProductById } from "@/lib/actions/products"
import { getCurrentProfile } from "@/lib/actions/profile"
import { redirect } from "next/navigation"
import { Crown, Zap, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentPageClient } from "./payment-page-client"

interface PaymentPageProps {
  params: Promise<{
    productId: string
  }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  // Unwrap params Promise (Next.js 15+)
  const { productId } = await params
  
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/auth/login?redirect=/pricing')
  }

  const product = await getProductById(productId)

  if (!product) {
    redirect('/pricing')
  }

  // Рассчитать детали
  const duration = product.duration_months || 1
  const pricePerMonth = Math.round(product.price / duration)
  const hasDiscount = (product.discount_percentage || 0) > 0
  const originalPrice = hasDiscount 
    ? Math.round(product.price / (1 - (product.discount_percentage || 0) / 100))
    : product.price
  const savings = originalPrice - product.price

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-10">
      {/* Кнопка назад */}
      <Link href="/pricing">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Назад к тарифам
        </Button>
      </Link>

      {/* Заголовок */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Оформление подписки</h1>
        <p className="text-muted-foreground">
          Вы выбрали тариф {product.name}
        </p>
      </div>

      {/* Клиентский компонент с калькулятором */}
      <PaymentPageClient
        product={product}
        profile={profile}
        tierLevel={product.tier_level || 1}
        pricePerMonth={pricePerMonth}
      />

      {/* Безопасность */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div className="space-y-1">
              <p className="font-medium">Безопасные платежи</p>
              <p className="text-sm text-muted-foreground">
                Все платежи обрабатываются через защищенное соединение. Мы не храним данные вашей карты.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
