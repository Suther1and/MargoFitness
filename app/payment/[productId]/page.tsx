import { getProductById } from "@/lib/actions/products"
import { getCurrentProfile } from "@/lib/actions/profile"
import { redirect } from "next/navigation"
import { PaymentPageNewClient } from "./components/payment-page-new-client"
import { Inter, Oswald } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })

interface PaymentPageProps {
  params: Promise<{
    productId: string
  }>
  searchParams: Promise<{
    action?: string
  }>
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  // Unwrap params Promise (Next.js 15+)
  const { productId } = await params
  const { action } = await searchParams
  
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/')
  }

  const product = await getProductById(productId)

  if (!product) {
    redirect('/')
  }

  // Рассчитать детали
  const duration = product.duration_months || 1
  const pricePerMonth = Math.round(product.price / duration)

  return (
    <div className={`min-h-screen antialiased font-inter ${inter.variable} ${oswald.variable}`} style={{ background: 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)' }}>
      <main className="relative w-full min-h-screen">
        {/* Декоративные фоновые блобы - скрыты на мобильных */}
        <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 md:px-8 pt-4 lg:pt-12 pb-8 md:pb-12 relative z-10">
          {/* Новый клиентский компонент с улучшенным дизайном */}
          <PaymentPageNewClient
            product={product}
            profile={profile}
            pricePerMonth={pricePerMonth}
            action={action as 'renewal' | 'upgrade' | undefined}
          />
        </div>
      </main>
    </div>
  )
}
