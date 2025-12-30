import { getProductById } from "@/lib/actions/products"
import { getCurrentProfile } from "@/lib/actions/profile"
import { redirect } from "next/navigation"
import { PaymentPageNewClient } from "./components/payment-page-new-client"
import { Inter, Oswald } from 'next/font/google'
import './components/mobile-optimizations.css'

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

        {/* Кнопка назад - парящая на мобильных */}
        <a 
          href="/dashboard"
          className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center gap-2 rounded-xl bg-white/[0.08] ring-1 ring-white/10 px-3 py-2 text-sm text-white/80 transition-all hover:bg-white/[0.12] backdrop-blur-xl active:scale-95"
          style={{ touchAction: 'manipulation' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          <span className="font-medium">Назад</span>
        </a>

        <div className="container mx-auto max-w-7xl px-4 md:px-8 pt-16 lg:pt-12 pb-8 md:pb-12 relative z-10">
          {/* Кнопка назад - desktop (на одном уровне с контентом) */}
          <div className="hidden lg:block mb-6">
            <a 
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-2.5 text-sm text-white/80 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              <span className="font-medium">Назад</span>
            </a>
          </div>

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
