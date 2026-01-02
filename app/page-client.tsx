'use client'

import { Inter, Oswald, Montserrat, Roboto } from 'next/font/google'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiTelegram, SiVk, SiInstagram, SiTiktok } from 'react-icons/si'
import { TrainerCertificatePopup } from '@/components/trainer-certificate-popup'
import { SignInPopup } from '@/components/signin-popup'
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal'
import { SubscriptionUpgradeModal } from '@/components/subscription-upgrade-modal'
import type { Product, Profile, SubscriptionTier } from '@/types/database'
import { TIER_LEVELS, isSubscriptionExpired } from '@/types/database'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-roboto' })

type Period = 30 | 90 | 180 | 365

interface PricingData {
  basic: { original: number; current: number }
  pro: { original: number; current: number }
  elite: { original: number; current: number }
}

// Базовые цены за месяц (без скидки)
const BASE_PRICES = {
  basic: 3990,
  pro: 4990,
  elite: 9990,
}

// Маппинг дней к месяцам
const DAYS_TO_MONTHS: Record<Period, number> = {
  30: 1,
  90: 3,
  180: 6,
  365: 12,
}

// Фиксированная цветовая схема
const colors = {
  background: '#0C0C11',
  backgroundGradient: 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)',
  primary: '#f97316',
  primaryLight: '#fb923c',
  secondary: '#ea580c',
  accent: '#fbbf24',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  navbarBg: 'rgba(255, 255, 255, 0.08)',
  blurColor1: 'rgba(249, 115, 22, 0.1)',
  blurColor2: 'rgba(168, 85, 247, 0.1)',
}

interface HomeNewPageProps {
  initialProfile?: Profile | null
}

export default function HomeNewPage({ initialProfile = null }: HomeNewPageProps) {
  const [selectedDuration, setSelectedDuration] = useState<Period>(30)
  const [previousDuration, setPreviousDuration] = useState<Period>(30)
  const [certificateOpen, setCertificateOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialProfile)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeInitialTier, setUpgradeInitialTier] = useState<SubscriptionTier | undefined>(undefined)
  const [products, setProducts] = useState<Product[]>([])
  const [pricingData, setPricingData] = useState<PricingData>({
    basic: { original: BASE_PRICES.basic, current: BASE_PRICES.basic },
    pro: { original: BASE_PRICES.pro, current: BASE_PRICES.pro },
    elite: { original: BASE_PRICES.elite, current: BASE_PRICES.elite },
  })
  const priceBasicRef = useRef<HTMLSpanElement>(null)
  const priceProRef = useRef<HTMLSpanElement>(null)
  const priceEliteRef = useRef<HTMLSpanElement>(null)
  const priceBasicOriginalRef = useRef<HTMLSpanElement>(null)
  const priceProOriginalRef = useRef<HTMLSpanElement>(null)
  const priceEliteOriginalRef = useRef<HTMLSpanElement>(null)
  
  // Рефы для символов рубля и "/месяц"
  const currencyBasicRef = useRef<HTMLSpanElement>(null)
  const currencyProRef = useRef<HTMLSpanElement>(null)
  const currencyEliteRef = useRef<HTMLSpanElement>(null)
  const periodBasicRef = useRef<HTMLSpanElement>(null)
  const periodProRef = useRef<HTMLSpanElement>(null)
  const periodEliteRef = useRef<HTMLSpanElement>(null)
  
  const router = useRouter()

  // Загрузка продуктов
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products/by-duration?duration=all')
        const data = await response.json()
        setProducts(data)
        
        // Загружаем цены для дефолтного периода (30 дней = 1 месяц)
        updatePricing(30, data)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    
    loadProducts()
  }, [])

  // Обновление цен при изменении периода
  const updatePricing = (days: Period, allProducts: Product[]) => {
    const months = DAYS_TO_MONTHS[days]
    const productsForDuration = allProducts.filter(p => p.duration_months === months)
    
    const basicProduct = productsForDuration.find(p => p.tier_level === 1)
    const proProduct = productsForDuration.find(p => p.tier_level === 2)
    const eliteProduct = productsForDuration.find(p => p.tier_level === 3)
    
    const calculatePricePerMonth = (product?: Product, tierLevel?: number) => {
      if (!product) {
        const originalPricePerMonth = tierLevel === 1 ? BASE_PRICES.basic :
                                       tierLevel === 2 ? BASE_PRICES.pro :
                                       BASE_PRICES.elite
        return { original: originalPricePerMonth, current: originalPricePerMonth }
      }
      const duration = product.duration_months || 1
      const currentPricePerMonth = Math.round(product.price / duration)
      const originalPricePerMonth = product.tier_level === 1 ? BASE_PRICES.basic :
                                     product.tier_level === 2 ? BASE_PRICES.pro :
                                     BASE_PRICES.elite
      return { original: originalPricePerMonth, current: currentPricePerMonth }
    }
    
    const newPricing = {
      basic: calculatePricePerMonth(basicProduct, 1),
      pro: calculatePricePerMonth(proProduct, 2),
      elite: calculatePricePerMonth(eliteProduct, 3),
    }
    
    setPricingData(newPricing)
    
    // Обновляем отображение сразу
    setTimeout(() => {
      if (priceBasicRef.current) priceBasicRef.current.innerText = newPricing.basic.current.toLocaleString('ru-RU')
      if (priceProRef.current) priceProRef.current.innerText = newPricing.pro.current.toLocaleString('ru-RU')
      if (priceEliteRef.current) priceEliteRef.current.innerText = newPricing.elite.current.toLocaleString('ru-RU')
      
      if (days > 30) {
        if (priceBasicOriginalRef.current) priceBasicOriginalRef.current.innerText = newPricing.basic.original.toLocaleString('ru-RU')
        if (priceProOriginalRef.current) priceProOriginalRef.current.innerText = newPricing.pro.original.toLocaleString('ru-RU')
        if (priceEliteOriginalRef.current) priceEliteOriginalRef.current.innerText = newPricing.elite.original.toLocaleString('ru-RU')
      }
    }, 0)
  }

  // Отправляем событие об изменении состояния попапа
  useEffect(() => {
    const event = new CustomEvent('signInPopupStateChange', { detail: signInOpen })
    window.dispatchEvent(event)
  }, [signInOpen])

  // Обновление профиля при изменении авторизации (только если не передан initialProfile)
  useEffect(() => {
    if (initialProfile) {
      // Профиль уже загружен на сервере, только подписываемся на изменения
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
        if (!session) {
          setIsAuthenticated(false)
          setProfile(null)
        } else if (!profile) {
          // Если профиль был null, но появилась сессия - загружаем через API
          try {
            const response = await fetch('/api/profile')
            const result = await response.json()
            if (result.profile) {
              setProfile(result.profile)
              setIsAuthenticated(true)
            }
          } catch (err) {
            console.error('[HomePage] Error loading profile on auth change:', err)
          }
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [initialProfile, profile])

  // Обработчик действия "начать" - проверяет авторизацию
  const handleStartAction = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      setSignInOpen(true)
    }
  }

  // Функция для проверки активной подписки
  const isSubscriptionActive = (profile: Profile | null): boolean => {
    if (!profile) return false
    if (profile.subscription_status !== 'active') return false
    if (isSubscriptionExpired(profile.subscription_expires_at)) return false
    return true
  }

  // Функция для определения состояния кнопки тарифа
  const getTierButtonState = (tierLevel: 1 | 2 | 3) => {
    if (!isAuthenticated || !profile || !isSubscriptionActive(profile)) {
      return { type: 'purchase' as const, disabled: false }
    }

    const currentTierLevel = TIER_LEVELS[profile.subscription_tier]
    const targetTierLevel = tierLevel

    if (currentTierLevel === targetTierLevel) {
      return { type: 'renewal' as const, disabled: false }
    } else if (currentTierLevel > targetTierLevel) {
      return { type: 'lower' as const, disabled: true }
    } else {
      return { type: 'upgrade' as const, disabled: false }
    }
  }

  // Обработчик выбора тарифа
  const handleTierSelect = async (tierLevel: 1 | 2 | 3) => {
    if (!isAuthenticated) {
      // Сохраняем намерение выбрать тариф в localStorage
      const months = DAYS_TO_MONTHS[selectedDuration]
      localStorage.setItem('pending_tier_selection', JSON.stringify({
        tierLevel,
        duration: months,
        timestamp: Date.now()
      }))
      setSignInOpen(true)
      return
    }

    // Проверяем состояние подписки
    const hasActiveSubscription = profile && profile.subscription_status === 'active' && !isSubscriptionExpired(profile.subscription_expires_at)
    if (hasActiveSubscription) {
      const currentTierLevel = TIER_LEVELS[profile.subscription_tier]
      const targetTierLevel = tierLevel

      // Текущий тариф - открываем окно продления
      if (currentTierLevel === targetTierLevel) {
        setRenewalModalOpen(true)
        return
      }

      // Тариф ниже - ничего не делаем (кнопка неактивна)
      if (currentTierLevel > targetTierLevel) {
        return
      }

      // Тариф выше - открываем окно апгрейда
      // Если кликнули на Elite (tierLevel 3), сразу открываем апгрейд с Elite
      if (currentTierLevel < targetTierLevel) {
        // Определяем тариф для initialTier
        const tierMap: Record<number, SubscriptionTier> = {
          1: 'basic',
          2: 'pro',
          3: 'elite'
        }
        const targetTier = tierMap[tierLevel]
        
        // Устанавливаем initialTier и открываем модальное окно
        setUpgradeInitialTier(targetTier)
        setUpgradeModalOpen(true)
        return
      }
    }

    // Если нет активной подписки - обычная покупка
    try {
      const months = DAYS_TO_MONTHS[selectedDuration]
      const response = await fetch(`/api/products/by-duration?duration=${months}&tier=${tierLevel}`)
      const product = await response.json()
      
      if (product && product.id) {
        router.push(`/payment/${product.id}`)
      } else {
        console.error('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  const animateElement = (element: HTMLElement | null, newValue?: string) => {
    if (!element) return
    
    element.style.transition = 'all 0.2s ease-in'
    element.style.opacity = '0'
    element.style.filter = 'blur(4px)'
    element.style.transform = 'translateY(5px)'
    
    setTimeout(() => {
      if (newValue !== undefined) {
        element.innerText = newValue
      }
      element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      element.style.opacity = '1'
      element.style.filter = 'blur(0px)'
      element.style.transform = 'translateY(0)'
    }, 250)
  }

  const animateOriginalPriceAppearance = (element: HTMLElement | null, value: string) => {
    if (!element) return
    
    const container = element.parentElement
    if (!container) return
    
    // Показываем контейнер и элемент
    container.style.visibility = 'visible'
    container.style.height = 'auto'
    container.style.overflow = 'visible'
    element.style.display = 'inline'
    
    // Устанавливаем начальное состояние элемента
    element.innerText = value
    element.style.opacity = '0'
    element.style.filter = 'blur(8px)'
    element.style.transform = 'translateY(-15px)'
    
    // Анимируем появление с задержкой для синхронизации с основной ценой
    // 0.6s = 0.5s + 20%
    setTimeout(() => {
      element.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      element.style.opacity = '1'
      element.style.filter = 'blur(0px)'
      element.style.transform = 'translateY(0)'
    }, 250)
  }

  const hideOriginalPrice = (element: HTMLElement | null) => {
    if (!element) return
    
    const container = element.parentElement
    if (!container) return
    
    // Мгновенно скрываем
    container.style.visibility = 'hidden'
    container.style.height = '0'
    element.style.opacity = '0'
  }

  const handlePeriodChange = (period: Period) => {
    const wasSingleMonth = previousDuration === 30
    const isSingleMonth = period === 30
    
    // Если переходим на 30 дней, НЕМЕДЛЕННО скрываем перечеркнутые цены СИНХРОННО
    if (isSingleMonth && !wasSingleMonth) {
      // Скрываем все перечеркнутые цены напрямую через DOM
      [priceBasicOriginalRef, priceProOriginalRef, priceEliteOriginalRef].forEach(ref => {
        if (ref.current && ref.current.parentElement) {
          const container = ref.current.parentElement
          container.style.visibility = 'hidden'
          container.style.height = '0'
          container.style.overflow = 'hidden'
          ref.current.style.opacity = '0'
          ref.current.style.display = 'none'
        }
      })
    }
    
    setSelectedDuration(period)
    setPreviousDuration(period)
    
    // Сначала обновляем pricing
    const months = DAYS_TO_MONTHS[period]
    const productsForDuration = products.filter(p => p.duration_months === months)
    
    const basicProduct = productsForDuration.find(p => p.tier_level === 1)
    const proProduct = productsForDuration.find(p => p.tier_level === 2)
    const eliteProduct = productsForDuration.find(p => p.tier_level === 3)
    
    const calculatePricePerMonth = (product?: Product, tierLevel?: number) => {
      if (!product) {
        const originalPricePerMonth = tierLevel === 1 ? BASE_PRICES.basic :
                                       tierLevel === 2 ? BASE_PRICES.pro :
                                       BASE_PRICES.elite
        return { original: originalPricePerMonth, current: originalPricePerMonth }
      }
      const duration = product.duration_months || 1
      const currentPricePerMonth = Math.round(product.price / duration)
      const originalPricePerMonth = product.tier_level === 1 ? BASE_PRICES.basic :
                                     product.tier_level === 2 ? BASE_PRICES.pro :
                                     BASE_PRICES.elite
      return { original: originalPricePerMonth, current: currentPricePerMonth }
    }
    
    const newPricing = {
      basic: calculatePricePerMonth(basicProduct, 1),
      pro: calculatePricePerMonth(proProduct, 2),
      elite: calculatePricePerMonth(eliteProduct, 3),
    }
    
    setPricingData(newPricing)
    
    // Анимируем только основные цены, рубли и "/месяц"
    animateElement(priceBasicRef.current, newPricing.basic.current.toLocaleString('ru-RU'))
    animateElement(currencyBasicRef.current)
    animateElement(periodBasicRef.current)
    
    animateElement(priceProRef.current, newPricing.pro.current.toLocaleString('ru-RU'))
    animateElement(currencyProRef.current)
    animateElement(periodProRef.current)
    
    animateElement(priceEliteRef.current, newPricing.elite.current.toLocaleString('ru-RU'))
    animateElement(currencyEliteRef.current)
    animateElement(periodEliteRef.current)
    
    // Обработка перечеркнутых цен
    if (period > 30) {
      // Если переходим с 30 дней на другой период - анимируем появление
      if (wasSingleMonth) {
        animateOriginalPriceAppearance(
          priceBasicOriginalRef.current,
          newPricing.basic.original.toLocaleString('ru-RU')
        )
        animateOriginalPriceAppearance(
          priceProOriginalRef.current,
          newPricing.pro.original.toLocaleString('ru-RU')
        )
        animateOriginalPriceAppearance(
          priceEliteOriginalRef.current,
          newPricing.elite.original.toLocaleString('ru-RU')
        )
      } else {
        // Если переходим между периодами с перечеркнутой ценой - просто меняем текст
        if (priceBasicOriginalRef.current) {
          priceBasicOriginalRef.current.innerText = newPricing.basic.original.toLocaleString('ru-RU')
        }
        if (priceProOriginalRef.current) {
          priceProOriginalRef.current.innerText = newPricing.pro.original.toLocaleString('ru-RU')
        }
        if (priceEliteOriginalRef.current) {
          priceEliteOriginalRef.current.innerText = newPricing.elite.original.toLocaleString('ru-RU')
        }
      }
    }
    // Скрытие перечеркнутых цен при переходе на 30 дней происходит в начале функции
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <style jsx global>{`
        .font-oswald { font-family: ${oswald.style.fontFamily}; }
        .font-montserrat { font-family: ${montserrat.style.fontFamily}; }
        .font-roboto { font-family: ${roboto.style.fontFamily}; }
        .font-inter { font-family: ${inter.style.fontFamily}; }
        
        @keyframes colorShift {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .animate-color-shift {
          animation: colorShift 4s ease-in-out infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Mobile optimizations */
        @media (max-width: 1023px) {
          .animate-color-shift { animation: none !important; }
        }
      `}</style>

      <div className={`relative w-full ${inter.variable} ${oswald.variable} ${montserrat.variable} ${roboto.variable}`}>
              
              {/* 1. HERO SECTION */}
              <section className="w-full mx-auto px-4 pt-4 pb-10 md:px-8 md:pt-6 md:pb-16 relative overflow-x-hidden md:max-w-[90rem]">
                {/* Desktop Hero */}
                <div className="hidden md:flex flex-col gap-6 md:gap-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center">
                    <div className="lg:col-span-6 flex flex-col gap-4 md:gap-8 z-20">
                      <div className="flex gap-4 items-center">
                        <div className="h-px w-8 md:w-12" style={{ background: colors.secondary }}></div>
                        <span className="uppercase text-xs md:text-sm font-medium tracking-widest font-montserrat" style={{ color: colors.primary }}>Онлайн-тренировки для дома</span>
          </div>
          
                      <h1 className="text-5xl md:text-7xl lg:text-9xl leading-[0.95] uppercase font-medium tracking-tight font-oswald" style={{ color: colors.textPrimary }}>
                        Преврати <br />
                        <span className="animate-color-shift" style={{
                          backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight}, ${colors.secondary}, ${colors.primaryLight}, ${colors.primary})`,
                          backgroundSize: '200% auto',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        } as React.CSSProperties}>мечту</span> <br />
                        <span className="animate-color-shift" style={{
                          backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight}, ${colors.secondary}, ${colors.primaryLight}, ${colors.primary})`,
                          backgroundSize: '200% auto',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        } as React.CSSProperties}>в цель.</span>
          </h1>
          
                      <p className="text-base md:text-lg max-w-lg font-roboto leading-relaxed" style={{ color: colors.textSecondary }}>
                        Твой фитнес — твои правила. Достигай результатов легко в удобном формате с тренировками от профессионального тренера: продвинутый личный кабинет, дневник здоровья, бонусы и многое другое на нашей платформе.
                      </p>

                      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <button 
                          onClick={handleStartAction}
                          className="rounded-xl text-white transition-all hover:opacity-90 shadow-lg active:scale-95 w-full md:w-auto" 
                          style={{
                            background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                            boxShadow: `0 8px 24px ${colors.primary}4D`,
                            touchAction: 'manipulation'
                          }}
                        >
                          <div className="flex items-center justify-center gap-2.5 px-6 py-4 pointer-events-none">
                            <span className="uppercase text-sm font-semibold tracking-widest leading-none">Начать бесплатно</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-white">
                              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                              <polyline points="10 17 15 12 10 7"></polyline>
                              <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                          </div>
                        </button>
                        <a 
                          href="#pricing"
                          className="rounded-xl hover:opacity-80 transition-all w-full md:w-auto backdrop-blur-xl active:scale-95" 
                          style={{
                            background: colors.cardBg,
                            border: `1px solid ${colors.cardBorder}`,
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                            touchAction: 'manipulation'
                          }}
                        >
                          <div className="flex items-center justify-center px-6 py-4 pointer-events-none">
                            <span className="uppercase text-sm font-semibold tracking-widest leading-none" style={{ color: colors.textPrimary }}>Посмотреть тарифы</span>
                          </div>
                        </a>
                      </div>
                    </div>

                    <div className="lg:col-span-6 relative z-10 w-full">
                      <div className="absolute bottom-10 -left-10 w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] blur-[5rem] rounded-full pointer-events-none" style={{ background: colors.blurColor1 }}></div>
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[30rem] lg:h-[40rem] w-full" style={{ border: `1px solid ${colors.cardBorder}` }}>
                        <img 
                          src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=2070&auto=format&fit=crop" 
                          alt="Training" 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background}CC, transparent)` }}></div>
                        
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 rounded-2xl shadow-xl p-4 md:p-5" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }}>
                          
                          <div className="rounded-xl p-4 backdrop-blur relative z-10" style={{
                            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                            border: `1px solid ${colors.cardBorder}`
                          }}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                                  background: `${colors.primary}33`,
                                  border: `1px solid ${colors.primary}4D`
                                }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.primaryLight }}>
                                    <path d="m6.5 6.5 11 11"></path>
                                    <path d="m21 21-1-1"></path>
                                    <path d="m3 3 1 1"></path>
                                    <path d="m18 22 4-4"></path>
                                    <path d="m2 6 4-4"></path>
                                    <path d="m3 10 7-7"></path>
                                    <path d="m14 21 7-7"></path>
                                  </svg>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>Активная тренировка</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs uppercase" style={{ color: colors.textSecondary }}>
                                <span>Прогресс недели</span>
                                <span className="font-bold">83%</span>
                              </div>
                              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: `${colors.textPrimary}1A` }}>
                                <div className="h-full w-[83%] rounded-full" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
          </div>

                {/* Mobile Hero - Overlay Glass */}
                <div className="md:hidden relative h-[85vh] mx-auto -mt-4 overflow-hidden max-w-full">
                  <img 
                    src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=2070&auto=format&fit=crop" 
                    alt="Training" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background} 0%, transparent 100%)` }}></div>
                  <div className="absolute bottom-8 left-4 right-4 rounded-3xl p-5" style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
                    
                    <div className="rounded-2xl p-5 backdrop-blur relative z-10" style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                      border: `1px solid ${colors.cardBorder}`
                    }}>
                      <div className="flex gap-3 items-center mb-3">
                        <div className="h-px w-8" style={{ background: colors.primary }}></div>
                        <span className="uppercase text-xs font-medium tracking-widest" style={{ color: colors.primary }}>
                          Тренировки для дома
                        </span>
            </div>
                      <h1 className="text-4xl leading-[0.9] uppercase font-medium tracking-tight font-oswald mb-4" style={{ color: colors.textPrimary }}>
                        Преврати <br />
                        <span style={{ color: colors.primary }}>мечту в цель</span>
                      </h1>
                      <button 
                        onClick={handleStartAction}
                        className="w-full rounded-xl text-white transition-all hover:opacity-90 shadow-lg active:scale-95" 
                        style={{
                          background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                          boxShadow: `0 8px 24px ${colors.primary}4D`,
                          touchAction: 'manipulation'
                        }}
                      >
                        <div className="flex items-center justify-center gap-2.5 px-6 py-4 pointer-events-none">
                          <span className="uppercase text-sm font-semibold tracking-widest leading-none">Начать бесплатно</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-white">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                          </svg>
            </div>
                      </button>
            </div>
          </div>
        </div>
      </section>

              {/* 2. HOW IT WORKS */}
              <section className="py-10 md:py-16 overflow-x-hidden">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="mb-8 md:mb-12 max-w-2xl">
                  <span className="text-xs font-semibold uppercase tracking-widest mb-2 block font-montserrat" style={{ color: colors.primary }}>Как это работает</span>
                  <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-montserrat uppercase" style={{ color: colors.textPrimary }}>Путь к результату</h2>
          </div>

                </div>
                <div className="flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 gap-4 pb-8 md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-8 scrolling-wrapper">
                  {[
                    { num: '01', title: 'Регистрация', desc: 'Создай аккаунт и получи доступ к бесплатным материалам и личному кабинету', color: 'orange-500', action: 'signup' },
                    { num: '02', title: 'Выбор плана', desc: 'Выбери подходящую подписку в зависимости от твоих целей и начни тренироваться', color: 'purple-500', action: 'pricing' },
                    { num: '03', title: 'Тренировки', desc: 'Открой доступ к видео-тренировкам из личного кабинета', color: 'blue-500', action: 'signup' },
                    { num: '04', title: 'Результат', desc: 'Выполняй новые тренировки каждую неделю и достигай результата', color: 'emerald-500', action: 'signup' }
                  ].map((step, idx) => (
                    <div 
                      key={step.num} 
                      onClick={() => {
                        if (step.action === 'signup') {
                          handleStartAction()
                        } else if (step.action === 'pricing') {
                          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      className="snap-center min-w-[85vw] md:min-w-0 rounded-3xl p-5 md:p-6 transition-all relative overflow-hidden min-h-[18rem] group md:hover:ring-white/20 md:hover:shadow-xl cursor-pointer active:scale-[0.98] select-none" 
                      style={{
                        background: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                      }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" style={{
                        background: `linear-gradient(to bottom right, ${
                          idx === 0 ? 'rgba(249, 115, 22, 0.1)' :
                          idx === 1 ? 'rgba(168, 85, 247, 0.1)' :
                          idx === 2 ? 'rgba(59, 130, 246, 0.1)' :
                          'rgba(16, 185, 129, 0.1)'
                        }, transparent, transparent)`
                      }} />
                      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl pointer-events-none" style={{
                        background: idx === 0 ? 'rgba(249, 115, 22, 0.1)' :
                                   idx === 1 ? 'rgba(168, 85, 247, 0.1)' :
                                   idx === 2 ? 'rgba(59, 130, 246, 0.1)' :
                                   'rgba(16, 185, 129, 0.1)'
                      }} />

                      <div className="rounded-2xl p-5 md:p-6 backdrop-blur relative z-10 h-full flex flex-col justify-end" style={{
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                        border: `1px solid ${colors.cardBorder}`
                      }}>
                        <div className="absolute top-4 right-4 transition-all opacity-10 group-hover:opacity-20">
                          <span className="text-6xl font-oswald font-bold" style={{ color: colors.textPrimary }}>{step.num}</span>
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-2xl font-montserrat uppercase mb-3" style={{ color: colors.textPrimary }}>{step.title}</h3>
                          <p className="text-base leading-relaxed font-roboto" style={{ color: colors.textSecondary }}>{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. ABOUT TRAINER */}
              <section className="py-10 md:py-16 overflow-x-hidden">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
                  <div className="order-1 relative w-full">
                    <div className="relative h-[22rem] md:h-[40rem] rounded-3xl overflow-hidden shadow-2xl" style={{ border: `1px solid ${colors.cardBorder}` }}>
                      <img 
                        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" 
                        alt="Тренер" 
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background}E6 0%, ${colors.background}33 50%, transparent 100%)` }}></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                        <div className="inline-block px-3 py-1.5 mb-3 rounded-full text-white text-[0.7rem] uppercase tracking-widest font-bold font-montserrat shadow-lg" style={{
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                          boxShadow: `0 8px 24px ${colors.primary}4D`
                        }}>Сертифицированный тренер</div>
                        <h3 className="font-montserrat text-3xl md:text-4xl uppercase tracking-tight" style={{ color: colors.textPrimary }}>Маргарита</h3>
                      </div>
                    </div>
                  </div>

                  <div className="order-2 flex flex-col gap-4 md:gap-6">
                    <div className="flex gap-4 items-center">
                      <div className="h-px w-12" style={{ background: colors.primary }}></div>
                      <span className="uppercase text-sm font-medium tracking-widest" style={{ color: colors.primary }}>О тренере</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-oswald font-medium uppercase leading-[0.95]" style={{ color: colors.textPrimary }}>
                      Тренировки это<br />не мотивация,<br />это система
                    </h2>
                    <div className="space-y-4 text-base md:text-lg leading-relaxed font-roboto" style={{ color: colors.textSecondary }}>
                      <p>"Я помогаю людям достигать своих целей через персональные программы и системный подход. Каждая тренировка адаптирована под ваш уровень подготовки."</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 auto-rows-fr">
                      {[
                        { value: '15+', label: 'Лет опыта', color: 'orange', clickable: false, icon: null },
                        { value: '500+', label: 'Учеников', color: 'purple', clickable: false, icon: null },
                        { value: null, label: 'Сертификат', color: 'blue', clickable: true, icon: 'trophy' }
                      ].map((stat, idx) => (
                        <div 
                          key={stat.label} 
                          className={`rounded-2xl p-4 text-center hover:shadow-lg transition-all relative overflow-hidden md:hover:ring-white/20 flex flex-col ${stat.clickable ? 'cursor-pointer' : ''}`}
                          style={{
                            background: colors.cardBg,
                            border: `1px solid ${colors.cardBorder}`
                          }}
                          onClick={stat.clickable ? () => setCertificateOpen(true) : undefined}
                        >
                          <div className="absolute inset-0 pointer-events-none" style={{
                            background: `linear-gradient(to bottom right, ${
                              idx === 0 ? 'rgba(249, 115, 22, 0.05)' :
                              idx === 1 ? 'rgba(168, 85, 247, 0.05)' :
                              'rgba(59, 130, 246, 0.05)'
                            }, transparent)`
                          }} />
                          
                          <div className="rounded-xl p-2 md:p-3 backdrop-blur relative z-10 flex flex-col flex-1 justify-center" style={{
                            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                            border: `1px solid ${colors.cardBorder}`
                          }}>
                            {stat.icon === 'trophy' ? (
                              <div className="flex items-center justify-center mb-0.5 md:mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-10 md:h-10" style={{ color: colors.textPrimary }}>
                                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                  <path d="M4 22h16"></path>
                                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                </svg>
                              </div>
                            ) : (
                              <div className="text-2xl md:text-4xl font-oswald font-medium" style={{ color: colors.textPrimary }}>{stat.value}</div>
                            )}
                            <div className="text-[0.6rem] md:text-xs uppercase tracking-wide md:tracking-widest mt-0.5 md:mt-1 font-montserrat leading-tight" style={{ color: colors.textSecondary }}>
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
          </div>
        </div>
      </section>

              {/* 4. PRICING */}
              <section id="pricing" className="py-10 md:py-16 relative overflow-x-hidden md:overflow-visible">
                <div className="relative z-10 w-full mx-auto md:max-w-[90rem] md:px-8">
                  <div className="max-w-3xl text-center mb-10 mx-auto px-4 md:px-8">
                    <span className="text-sm font-medium uppercase tracking-widest font-montserrat" style={{ color: colors.primary }}>Прозрачное ценообразование</span>
                    <h2 className="text-4xl sm:text-5xl tracking-tight mt-4 font-montserrat font-normal uppercase" style={{ color: colors.textPrimary }}>Выбери свой период</h2>
                    <p className="mt-4 text-lg font-roboto" style={{ color: colors.textSecondary }}>Чем длиннее период, тем выгоднее цена</p>

                    <div className="flex justify-center mt-8">
                      <div className="grid grid-cols-4 w-full max-w-sm md:max-w-xl p-1.5 rounded-2xl gap-2 backdrop-blur-xl" style={{
                        background: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`
                      }}>
                        {([30, 90, 180, 365] as Period[]).map((days) => (
                          <button 
                            key={days}
                            onClick={() => handlePeriodChange(days)}
                            className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold uppercase tracking-widest transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1 leading-tight relative`}
                            style={{
                              background: selectedDuration === days ? `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})` : 'transparent',
                              color: selectedDuration === days ? '#FFFFFF' : colors.textSecondary,
                              boxShadow: selectedDuration === days ? `0 4px 16px ${colors.primary}4D` : 'none'
                            }}
                          >
                            {days > 30 && (
                              <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                -{days === 90 ? '5' : days === 180 ? '10' : '15'}%
                              </span>
                            )}
                            <span className="text-xs md:text-sm">{days}</span>
                            <span className="text-xs md:text-sm">дней</span>
                          </button>
                        ))}
                      </div>
                    </div>
          </div>

                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 py-2 pb-8 md:grid md:grid-cols-3 md:gap-5 scrolling-wrapper md:items-center px-[7.5vw] md:px-0">
                    {/* Basic */}
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl p-5 md:p-6 flex flex-col transition-all md:min-h-[480px] flex-shrink-0 relative overflow-hidden md:hover:ring-white/20 md:hover:shadow-xl" style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`
                    }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                      {/* Внутренняя подложка - только текст */}
                      <div className="rounded-2xl p-5 md:p-6 backdrop-blur relative z-10 flex-1 mb-4" style={{
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                        border: `1px solid ${colors.cardBorder}`
                      }}>
                        <h3 className="text-xl font-medium tracking-widest font-montserrat uppercase mb-1" style={{ color: colors.textPrimary }}>Basic</h3>
                        <p className="text-sm mb-4 font-roboto" style={{ color: colors.textSecondary }}>Быстрый старт</p>
                        <div className="mb-6" style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          <div className="flex items-baseline gap-2 mb-1" style={{ visibility: selectedDuration > 30 ? 'visible' : 'hidden', height: selectedDuration > 30 ? 'auto' : '0' }}>
                            <span ref={priceBasicOriginalRef} className="text-2xl font-semibold font-oswald line-through" style={{ color: colors.textSecondary }}>{pricingData.basic.original.toLocaleString('ru-RU')}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span ref={priceBasicRef} className="text-5xl font-semibold font-oswald" style={{ color: colors.textPrimary }}>{pricingData.basic.current.toLocaleString('ru-RU')}</span>
                            <span ref={currencyBasicRef} className="text-lg" style={{ color: colors.textSecondary }}>₽</span>
                            <span ref={periodBasicRef} className="text-sm ml-1" style={{ color: colors.textSecondary }}>/месяц</span>
                          </div>
                        </div>
                        <ul className="space-y-3 text-sm font-roboto" style={{ color: colors.textSecondary }}>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>2 тренировки в неделю</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Отслеживание прогресса</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Доступ к платным материалам</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="hidden md:inline">Telegram сообщество (доступ до 2000 участников)</span>
                            <span className="md:hidden">Telegram сообщество (до 2000 участников)</span>
                          </li>
                </ul>
                      </div>

                      {/* Кнопка снаружи */}
                      {(() => {
                        // Debug: логируем состояние профиля при каждом рендере - ВСЕГДА
                        console.log('[Pricing Basic] 🔍 Render check - ALWAYS:', {
                          timestamp: new Date().toISOString(),
                          hasProfile: !!profile,
                          isAuthenticated,
                          profileTier: profile?.subscription_tier || 'null',
                          profileStatus: profile?.subscription_status || 'null',
                          expiresAt: profile?.subscription_expires_at || 'null',
                          isExpired: profile?.subscription_expires_at ? isSubscriptionExpired(profile.subscription_expires_at) : 'no_expires_at'
                        })
                        
                        const hasActiveSubscription = profile && profile.subscription_status === 'active' && !isSubscriptionExpired(profile.subscription_expires_at)
                        const currentTierLevel = hasActiveSubscription ? TIER_LEVELS[profile.subscription_tier] : null
                        const targetTierLevel = 1
                        
                        let buttonText = 'Выбрать тариф'
                        let isDisabled = false
                        
                        if (hasActiveSubscription && currentTierLevel !== null) {
                          if (currentTierLevel === targetTierLevel) {
                            buttonText = 'Продлить тариф'
                          } else if (currentTierLevel > targetTierLevel) {
                            buttonText = 'Твой тариф лучше!'
                            isDisabled = true
                          }
                        }
                        
                        return (
                          <button 
                            onClick={() => handleTierSelect(1)}
                            disabled={isDisabled}
                            className="w-full rounded-xl transition-all hover:opacity-90 active:scale-95 relative z-10 mt-auto disabled:opacity-50 disabled:cursor-not-allowed" 
                            style={{
                              background: isDisabled 
                                ? `rgba(255, 255, 255, 0.03)`
                                : `linear-gradient(to right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.06))`,
                              border: `1px solid ${colors.cardBorder}`,
                              touchAction: 'manipulation'
                            }}
                          >
                            <div className="flex items-center justify-center p-4 pointer-events-none">
                              <span className="uppercase text-sm font-semibold tracking-widest" style={{ color: colors.textPrimary }}>
                                {buttonText}
                              </span>
                            </div>
                          </button>
                        )
                      })()}
                    </div>

                    {/* Premium */}
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl p-5 md:p-6 shadow-2xl z-10 flex flex-col relative md:hover:shadow-3xl transition-all md:min-h-[530px] flex-shrink-0 overflow-hidden" style={{
                      background: `${colors.primary}1A`,
                      border: `2px solid ${colors.primary}4D`
                    }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute top-6 right-6 z-20">
                        <span className="px-3 py-1.5 text-[0.65rem] font-bold uppercase text-white rounded-full shadow-lg" style={{
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                          boxShadow: `0 8px 24px ${colors.primary}4D`
                        }}>Популярный</span>
                      </div>

                      {/* Внутренняя подложка - только текст */}
                      <div className="rounded-2xl p-5 md:p-6 backdrop-blur relative z-10 flex-1 mb-4" style={{
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
                        border: `1px solid ${colors.primary}33`
                      }}>
                        <h3 className="text-xl font-medium tracking-widest font-montserrat uppercase mb-1" style={{ color: colors.textPrimary }}>PRO</h3>
                        <p className="text-sm mb-4 font-roboto" style={{ color: colors.textSecondary }}>Оптимальное решение</p>
                        <div className="mb-6" style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          <div className="flex items-baseline gap-2 mb-1" style={{ visibility: selectedDuration > 30 ? 'visible' : 'hidden', height: selectedDuration > 30 ? 'auto' : '0' }}>
                            <span ref={priceProOriginalRef} className="text-2xl font-semibold font-oswald line-through" style={{ color: colors.textSecondary }}>{pricingData.pro.original.toLocaleString('ru-RU')}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span ref={priceProRef} className="text-5xl font-semibold font-oswald" style={{ color: colors.textPrimary }}>{pricingData.pro.current.toLocaleString('ru-RU')}</span>
                            <span ref={currencyProRef} className="text-lg" style={{ color: colors.textSecondary }}>₽</span>
                            <span ref={periodProRef} className="text-sm ml-1" style={{ color: colors.textSecondary }}>/месяц</span>
                          </div>
              </div>
                        <ul className="space-y-3 text-sm font-roboto" style={{ color: colors.textSecondary }}>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Всё из Basic</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>2 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', color: colors.primaryLight, verticalAlign: 'middle', margin: '0 2px' }}>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg> 3 тренировки в неделю</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Дневник здоровья</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Доступ в Telegram сообщество навсегда</span>
                          </li>
                </ul>
                      </div>

                      {/* Кнопка снаружи */}
                      {(() => {
                        const hasActiveSubscription = profile && profile.subscription_status === 'active' && !isSubscriptionExpired(profile.subscription_expires_at)
                        const currentTierLevel = hasActiveSubscription ? TIER_LEVELS[profile.subscription_tier] : null
                        const targetTierLevel = 2
                        
                        let buttonText = 'Выбрать тариф'
                        let isDisabled = false
                        
                        if (hasActiveSubscription && currentTierLevel !== null) {
                          if (currentTierLevel === targetTierLevel) {
                            buttonText = 'Продлить тариф'
                          } else if (currentTierLevel > targetTierLevel) {
                            buttonText = 'Твой тариф лучше!'
                            isDisabled = true
                          } else if (currentTierLevel < targetTierLevel) {
                            buttonText = 'Сделать апгрейд до PRO'
                          }
                        }
                        
                        return (
                          <button 
                            onClick={() => handleTierSelect(2)}
                            disabled={isDisabled}
                            className="w-full rounded-xl text-white transition-all hover:opacity-90 shadow-lg active:scale-95 relative z-10 mt-auto disabled:opacity-50 disabled:cursor-not-allowed" 
                            style={{
                              background: isDisabled 
                                ? `rgba(255, 255, 255, 0.1)`
                                : `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                              boxShadow: isDisabled ? 'none' : `0 8px 24px ${colors.primary}4D`,
                              touchAction: 'manipulation'
                            }}
                          >
                            <div className="flex items-center justify-center p-4 pointer-events-none">
                              <span className="uppercase text-sm font-semibold tracking-widest">
                                {buttonText}
                              </span>
                            </div>
                          </button>
                        )
                      })()}
                    </div>

                    {/* Elite */}
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl p-5 md:p-6 flex flex-col transition-all md:min-h-[480px] flex-shrink-0 relative overflow-hidden md:hover:ring-white/20 md:hover:shadow-xl" style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`
                    }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                      {/* Внутренняя подложка - только текст */}
                      <div className="rounded-2xl p-5 md:p-6 backdrop-blur relative z-10 flex-1 mb-4" style={{
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                        border: `1px solid ${colors.cardBorder}`
                      }}>
                        <h3 className="text-xl font-medium tracking-widest font-montserrat uppercase mb-1" style={{ color: colors.textPrimary }}>Elite</h3>
                        <p className="text-sm mb-4 font-roboto" style={{ color: colors.textSecondary }}>Индивидуальное ведение</p>
                        <div className="mb-6" style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          <div className="flex items-baseline gap-2 mb-1" style={{ visibility: selectedDuration > 30 ? 'visible' : 'hidden', height: selectedDuration > 30 ? 'auto' : '0' }}>
                            <span ref={priceEliteOriginalRef} className="text-2xl font-semibold font-oswald line-through" style={{ color: colors.textSecondary }}>{pricingData.elite.original.toLocaleString('ru-RU')}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span ref={priceEliteRef} className="text-5xl font-semibold font-oswald" style={{ color: colors.textPrimary }}>{pricingData.elite.current.toLocaleString('ru-RU')}</span>
                            <span ref={currencyEliteRef} className="text-lg" style={{ color: colors.textSecondary }}>₽</span>
                            <span ref={periodEliteRef} className="text-sm ml-1" style={{ color: colors.textSecondary }}>/месяц</span>
                          </div>
                        </div>
                        <ul className="space-y-3 text-sm font-roboto" style={{ color: colors.textSecondary }}>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Всё из PRO</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Личное ведение с Марго</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Индивидуальный план питания</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Коррекция техники по видео</span>
                          </li>
                          <li className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.textPrimary }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Прямая связь в Telegram</span>
                          </li>
                </ul>
          </div>

                      {/* Кнопка снаружи */}
                      {(() => {
                        const hasActiveSubscription = profile && profile.subscription_status === 'active' && !isSubscriptionExpired(profile.subscription_expires_at)
                        const currentTierLevel = hasActiveSubscription ? TIER_LEVELS[profile.subscription_tier] : null
                        const targetTierLevel = 3
                        
                        let buttonText = 'Выбрать тариф'
                        let isDisabled = false
                        
                        if (hasActiveSubscription && currentTierLevel !== null) {
                          if (currentTierLevel === targetTierLevel) {
                            buttonText = 'Продлить тариф'
                          } else if (currentTierLevel > targetTierLevel) {
                            buttonText = 'Твой тариф лучше!'
                            isDisabled = true
                          } else if (currentTierLevel < targetTierLevel) {
                            buttonText = 'Сделать апгрейд до Elite'
                          }
                        }
                        
                        return (
                          <button 
                            onClick={() => handleTierSelect(3)}
                            disabled={isDisabled}
                            className="w-full rounded-xl transition-all hover:opacity-90 active:scale-95 relative z-10 mt-auto disabled:opacity-50 disabled:cursor-not-allowed" 
                            style={{
                              background: isDisabled 
                                ? `rgba(255, 255, 255, 0.03)`
                                : `linear-gradient(to right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.06))`,
                              border: `1px solid ${colors.cardBorder}`,
                              touchAction: 'manipulation'
                            }}
                          >
                            <div className="flex items-center justify-center p-4 pointer-events-none">
                              <span className="uppercase text-sm font-semibold tracking-widest" style={{ color: colors.textPrimary }}>
                                {buttonText}
                              </span>
                            </div>
                          </button>
                        )
                      })()}
                    </div>
          </div>
        </div>
      </section>

              {/* 5. FEATURES SHOWCASE - iPhone Mockup Hidden on Mobile */}
              <section className="py-10 md:py-16 overflow-x-hidden relative">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-end relative z-10">
                  
                  {/* iPhone Mockup - Desktop Only */}
                  <div className="hidden lg:flex justify-start order-1 lg:order-1 items-end lg:ml-32 lg:mt-12">
                    <div className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px] relative">
                      <div className="relative">
                        <div className="relative rounded-[3rem] p-2 shadow-2xl" style={{
                          background: `linear-gradient(to bottom, #262626, #1a1a1a)`,
                          border: `1px solid ${colors.cardBorder}`
                        }}>
                          <div className="absolute -left-0.5 top-20 w-0.5 h-8 bg-neutral-700 rounded-l-sm"></div>
                          <div className="absolute -left-0.5 top-32 w-0.5 h-12 bg-neutral-700 rounded-l-sm"></div>
                          <div className="absolute -right-0.5 top-28 w-0.5 h-16 bg-neutral-700 rounded-r-sm"></div>
                          
                          <div className="relative w-full rounded-[2.6rem] overflow-hidden" style={{height: '690px', background: colors.background}}>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20"></div>

                            <div className="absolute top-4 left-5 right-5 flex items-center justify-between text-[0.7rem] font-semibold z-10" style={{ color: colors.textPrimary }}>
                              <span>9:41</span>
                              <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                  <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                  <line x1="12" y1="20" x2="12.01" y2="20"></line>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="13" viewBox="0 0 27 13" fill="none">
                                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.35" fill="none"/>
                                  <rect x="2" y="2" width="18" height="8" rx="1" fill="currentColor"/>
                                  <path d="M24 4C24 3.44772 24.4477 3 25 3H25.5C26.0523 3 26.5 3.44772 26.5 4V8C26.5 8.55228 26.0523 9 25.5 9H25C24.4477 9 24 8.55228 24 8V4Z" fill="currentColor" fillOpacity="0.4"/>
                                </svg>
                              </div>
                            </div>

                            <div className="relative w-full h-full pt-14 px-3 pb-6 overflow-hidden">
                              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                              
                              <div className="space-y-3.5">
                                <div className="relative backdrop-blur-xl rounded-2xl p-3.5 overflow-hidden" style={{
                                  background: colors.cardBg,
                                  border: `1px solid ${colors.cardBorder}`
                                }}>
                                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl pointer-events-none" style={{ background: colors.blurColor1 }} />
                                  <div className="relative flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.primaryLight }}>
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                      </svg>
                                      <span className="text-[0.7rem] font-medium" style={{ color: colors.textSecondary }}>Моя подписка</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] ring-1" style={{
                                      background: `${colors.primary}26`,
                                      color: colors.primaryLight,
                                      border: `1px solid ${colors.primary}4D`
                                    }}>
                                      <span className="h-1 w-1 rounded-full" style={{ background: colors.primary }}></span>
                                      Active
                                    </span>
                                  </div>
                                  <div className="rounded-xl p-3 mb-3" style={{
                                    background: `${colors.textPrimary}0A`,
                                    border: `1px solid ${colors.cardBorder}`
                                  }}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <div className="text-lg font-bold font-montserrat uppercase tracking-tight" style={{ color: colors.textPrimary }}>ELITE</div>
                                        <div className="text-[0.65rem] mt-0.5 font-roboto" style={{ color: colors.textSecondary }}>Elite программа</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>23</div>
                                        <div className="text-[0.6rem]" style={{ color: colors.textSecondary }}>дней</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-2" style={{ borderTop: `1px solid ${colors.cardBorder}` }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.primaryLight }}>
                                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                      </svg>
                                      <span className="text-[0.65rem] font-roboto" style={{ color: colors.textSecondary }}>Истекает 19 января 2026</span>
                                    </div>
                                  </div>
                                  <button className="w-full rounded-xl px-3 py-2.5 text-[0.75rem] font-semibold flex items-center justify-center gap-1.5 hover:opacity-80 transition-all" style={{
                                    background: `${colors.primary}26`,
                                    color: colors.primaryLight,
                                    border: `1px solid ${colors.primary}4D`
                                  }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                      <path d="M3 3v5h5"></path>
                                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                                      <path d="M16 16h5v5"></path>
                                    </svg>
                                    Продлить
                                  </button>
                                </div>

                                <div className="relative backdrop-blur-xl rounded-2xl p-3.5 overflow-hidden" style={{
                                  background: colors.cardBg,
                                  border: `1px solid ${colors.cardBorder}`
                                }}>
                                  <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full blur-2xl pointer-events-none" style={{ background: colors.blurColor2 }} />
                                  <div className="relative flex items-center gap-1.5 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.secondary }}>
                                      <path d="m6.5 6.5 11 11"></path>
                                      <path d="m21 21-1-1"></path>
                                      <path d="m3 3 1 1"></path>
                                    </svg>
                                    <span className="text-[0.7rem] font-medium" style={{ color: colors.textSecondary }}>Статистика недели</span>
                                  </div>
                                  <div className="rounded-xl p-3 mb-2.5" style={{
                                    background: `${colors.textPrimary}0A`,
                                    border: `1px solid ${colors.cardBorder}`
                                  }}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="text-4xl font-bold font-oswald" style={{ color: colors.textPrimary }}>2</span>
                                      <span className="text-base" style={{ color: colors.textSecondary }}>/ 3 тренировок</span>
                                    </div>
                                    <div className="text-[0.65rem] font-roboto" style={{ color: colors.textSecondary }}>Завершено на этой неделе</div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-[0.65rem] font-roboto" style={{ color: colors.textSecondary }}>
                                      <span>Недельный прогресс</span>
                                      <span className="font-semibold">67%</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.textPrimary}1A` }}>
                                      <div className="h-full w-[67%] rounded-full" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="relative backdrop-blur-xl rounded-2xl p-3.5 overflow-hidden" style={{
                                  background: `${colors.accent}33`,
                                  border: `1px solid ${colors.accent}4D`
                                }}>
                                  <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full blur-2xl pointer-events-none" style={{ background: `${colors.accent}40` }} />
                                  <div className="relative flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.accent }}>
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                      </svg>
                                      <span className="text-[0.7rem] font-medium" style={{ color: colors.textPrimary }}>Бонусная программа</span>
                                    </div>
                                    <span className="text-[0.65rem] px-2 py-1 rounded-full ring-1 font-medium" style={{
                                      color: colors.textPrimary,
                                      background: `${colors.accent}33`,
                                      border: `1px solid ${colors.accent}66`
                                    }}>Gold 🔥</span>
                                  </div>
                                  <div className="rounded-xl p-3" style={{
                                    background: `${colors.accent}40`,
                                    border: `1px solid ${colors.textPrimary}33`
                                  }}>
                                    <div className="flex items-baseline gap-2 mb-1.5">
                                      <span className="text-4xl font-bold font-oswald" style={{ color: colors.textPrimary }}>1 250</span>
                                      <span className="text-base" style={{ color: colors.textSecondary }}>шагов</span>
                                    </div>
                                    <div className="text-[0.65rem] mb-3 font-roboto" style={{ color: colors.textSecondary }}>Твой текущий баланс</div>
                                    <div className="flex justify-between text-[0.65rem] mb-2 font-roboto" style={{ color: colors.textSecondary }}>
                                      <span>До Platinum осталось</span>
                                      <span className="font-semibold">98 750 шагов</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.textPrimary}33` }}>
                                      <div className="h-full w-[62%] rounded-full" style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})` }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute -inset-8 blur-3xl -z-10" style={{ background: `linear-gradient(to bottom right, ${colors.blurColor1}, ${colors.blurColor2}, transparent)` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="flex flex-col gap-6 order-2 lg:order-2 lg:col-span-1 col-span-1">
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest font-montserrat" style={{ color: colors.primary }}>Возможности платформы</span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-montserrat font-medium uppercase leading-tight" style={{ color: colors.textPrimary }}>
                        Всё для твоих<br className="hidden md:block" />результатов
          </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 auto-rows-fr">
                      {[
                        { icon: 'calendar', color: '#f97316', blurColor: 'rgba(249, 115, 22, 0.1)', title: 'Еженедельно', desc: 'Новые программы каждый понедельник', mobileDesc: null, clickable: false },
                        { icon: 'telegram', color: '#a855f7', blurColor: 'rgba(168, 85, 247, 0.1)', title: 'Telegram сообщество', desc: 'Присоединяйся к комьюнити (доступ для всех до 1000 участников)', mobileDesc: 'Доступ для всех до 1000 участников', clickable: true },
                        { icon: 'video', color: '#3b82f6', blurColor: 'rgba(59, 130, 246, 0.1)', title: 'Видео', desc: 'Подробные видео упражнений с инструкциями в личном кабинете', mobileDesc: 'Упражнения с правильной техникой в личном кабинете', clickable: false },
                        { icon: 'tag', color: '#10b981', blurColor: 'rgba(16, 185, 129, 0.1)', title: 'Бонусы', desc: 'Продвинутая бонусная и реферальная система', mobileDesc: null, clickable: false },
                        { icon: 'chart', color: '#ec4899', blurColor: 'rgba(236, 72, 153, 0.1)', title: 'Прогресс', desc: 'Доступ к продвинутому кабинету и Дневнику здоровья', mobileDesc: 'Платформа нового поколения', clickable: false },
                        { icon: 'home', color: '#6366f1', blurColor: 'rgba(99, 102, 241, 0.1)', title: 'Где угодно', desc: 'Тренируйся дома с минимумом оборудования', mobileDesc: null, clickable: false }
                      ].map((feature, idx) => (
                        <div 
                          key={idx} 
                          className={`rounded-2xl p-4 transition-all flex flex-col gap-2 md:gap-3 relative overflow-hidden md:hover:ring-white/15 md:hover:shadow-lg select-none ${feature.clickable ? 'cursor-pointer' : ''}`}
                          style={{
                            background: colors.cardBg,
                            border: `1px solid ${colors.cardBorder}`
                          }}
                          onClick={feature.clickable ? () => window.open('https://t.me/margofitness', '_blank') : undefined}
                        >
                          <div className="absolute inset-0 pointer-events-none" style={{
                            background: `linear-gradient(to bottom right, ${feature.blurColor}, transparent, transparent)`
                          }} />
                          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl pointer-events-none" style={{
                            background: feature.blurColor
                          }} />

                          <div className="rounded-xl p-3 backdrop-blur relative z-10 flex flex-col gap-2 md:gap-3 flex-1" style={{
                            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
                            border: `1px solid ${colors.cardBorder}`
                          }}>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                              background: `${feature.color}1A`,
                              border: `1px solid ${feature.color}33`
                            }}>
                              {feature.icon === 'calendar' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                              )}
                              {feature.icon === 'telegram' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                  <path d="m22 2-7 20-4-9-9-4Z"></path>
                                  <path d="M22 2 11 13"></path>
                                </svg>
                              )}
                              {feature.icon === 'video' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                              )}
                              {feature.icon === 'tag' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                              )}
                              {feature.icon === 'chart' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                  <line x1="18" y1="20" x2="18" y2="10"></line>
                                  <line x1="12" y1="20" x2="12" y2="4"></line>
                                  <line x1="6" y1="20" x2="6" y2="14"></line>
                                </svg>
                              )}
                              {feature.icon === 'home' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm md:text-base font-bold font-montserrat uppercase mb-1" style={{ color: colors.textPrimary }}>{feature.title}</h4>
                              {feature.mobileDesc ? (
                                <>
                                  <p className="hidden md:block text-xs md:text-sm font-roboto" style={{ color: colors.textSecondary }}>{feature.desc}</p>
                                  <p className="md:hidden text-xs font-roboto" style={{ color: colors.textSecondary }}>{feature.mobileDesc}</p>
                                </>
                              ) : (
                                <p className="text-xs md:text-sm font-roboto" style={{ color: colors.textSecondary }}>{feature.desc}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
        </div>
      </section>

              {/* 6. FOOTER */}
              <footer className="mt-auto overflow-x-hidden">
                  <div className="relative overflow-hidden py-8 md:py-10 px-4 sm:px-6 md:px-8" style={{
                    borderTop: `1px solid ${colors.cardBorder}`,
                    background: colors.background
                  }}>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                      <div className="absolute -bottom-32 -right-32 w-96 h-96 blur-[120px] rounded-full" style={{ background: `${colors.primary}0D` }} />
                      <div className="absolute -top-32 -left-32 w-96 h-96 blur-[120px] rounded-full" style={{ background: `${colors.secondary}0D` }} />
                    </div>

                    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
                      {/* Навигация */}
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-5 text-sm md:text-base font-roboto" style={{ color: colors.textSecondary }}>
                        <a href="#" className="transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Главная</a>
                        <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                        <a href="#pricing" className="transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Тарифы</a>
                        <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                        <a href="/free-content" className="transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Бесплатное</a>
                        <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                        <a href="#" className="transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>О тренере</a>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-center mb-4">
                        <a href="mailto:info@margofitness.ru" className="inline-flex items-center gap-2.5 text-sm md:text-base font-medium tracking-tight font-roboto transition-all px-4 py-2.5 rounded-xl" style={{ 
                          color: colors.textSecondary,
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.primary;
                          e.currentTarget.style.color = colors.primary;
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.cardBorder;
                          e.currentTarget.style.color = colors.textSecondary;
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          </svg>
                          <span>info@margofitness.ru</span>
                        </a>
                      </div>

                      {/* Иконки соцсетей */}
                      <div className="flex items-center justify-center gap-3 mb-5">
                        <a href="#" className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.cardBorder}>
                          <SiTelegram className="w-5 h-5" style={{ color: colors.textSecondary }} />
                        </a>
                        <a href="#" className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.cardBorder}>
                          <SiVk className="w-5 h-5" style={{ color: colors.textSecondary }} />
                        </a>
                        <a href="#" className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.cardBorder}>
                          <SiInstagram className="w-5 h-5" style={{ color: colors.textSecondary }} />
                        </a>
                        <a href="#" className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.cardBorder}>
                          <SiTiktok className="w-5 h-5" style={{ color: colors.textSecondary }} />
                        </a>
                      </div>

                      {/* Разделитель */}
                      <div className="w-full max-w-md mb-4" style={{
                        height: '1px',
                        background: `linear-gradient(to right, transparent, ${colors.cardBorder}, transparent)`
                      }}></div>

                      {/* Юридические ссылки */}
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-3 text-xs md:text-sm font-roboto" style={{ color: colors.textSecondary }}>
                        <a href="#" className="transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Пользовательское соглашение</a>
                        <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                        <a href="#" className="transition-colors" style={{ color: colors.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Политика конфиденциальности</a>
                      </div>

                      {/* Copyright */}
                      <div className="text-center text-xs font-roboto" style={{ color: `${colors.textSecondary}99` }}>
                        © 2025 MargoFitness
                      </div>
                    </div>
                  </div>
              </footer>
    </div>
      
      <TrainerCertificatePopup 
        open={certificateOpen} 
        onOpenChange={setCertificateOpen} 
      />
      <SignInPopup 
        isOpen={signInOpen} 
        onClose={() => setSignInOpen(false)} 
      />

      {profile && profile.subscription_status === 'active' && !isSubscriptionExpired(profile.subscription_expires_at) && (
        <>
          <SubscriptionRenewalModal
            open={renewalModalOpen}
            onOpenChange={setRenewalModalOpen}
            currentTier={profile.subscription_tier}
            currentExpires={profile.subscription_expires_at}
            userId={profile.id}
          />

          <SubscriptionUpgradeModal
            open={upgradeModalOpen}
            onOpenChange={(open) => {
              setUpgradeModalOpen(open)
              if (!open) {
                setUpgradeInitialTier(undefined)
              }
            }}
            currentTier={profile.subscription_tier}
            userId={profile.id}
            onOpenRenewal={() => setRenewalModalOpen(true)}
            initialTier={upgradeInitialTier}
          />
        </>
      )}
    </>
  )
}
