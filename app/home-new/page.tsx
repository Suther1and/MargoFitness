'use client'

import { Inter, Oswald, Montserrat, Roboto } from 'next/font/google'
import { useState, useRef } from 'react'
import { SiTelegram, SiVk, SiInstagram, SiTiktok } from 'react-icons/si'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-roboto' })

type Period = 30 | 90 | 180 | 365

const pricingData = {
  30: { starter: 990, pro: 1990, elite: 2990, suffix: '/30 дней' },
  90: { starter: 2690, pro: 5390, elite: 8090, suffix: '/90 дней' },
  180: { starter: 4990, pro: 9990, elite: 14990, suffix: '/180 дней' },
  365: { starter: 8990, pro: 17990, elite: 26990, suffix: '/365 дней' }
}

// Фиксированная цветовая схема
const colors = {
  background: '#0a0a0f',
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

export default function HomeNewPage() {
  const [selectedDuration, setSelectedDuration] = useState<Period>(30)
  const priceStarterRef = useRef<HTMLSpanElement>(null)
  const priceProRef = useRef<HTMLSpanElement>(null)
  const priceEliteRef = useRef<HTMLSpanElement>(null)
  const periodRefs = useRef<HTMLSpanElement[]>([])

  const animateValue = (element: HTMLElement | null, value: number) => {
    if (!element) return
    
    element.style.transition = 'all 0.2s ease-in'
    element.style.opacity = '0'
    element.style.filter = 'blur(4px)'
    element.style.transform = 'translateY(5px)'
    
    setTimeout(() => {
      element.innerText = value.toString()
      element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      element.style.opacity = '1'
      element.style.filter = 'blur(0px)'
      element.style.transform = 'translateY(0)'
    }, 200)
  }

  const handlePeriodChange = (period: Period) => {
    const data = pricingData[period]
    
    animateValue(priceStarterRef.current, data.starter)
    animateValue(priceProRef.current, data.pro)
    animateValue(priceEliteRef.current, data.elite)
    
    periodRefs.current.forEach(el => {
      if (el) {
        el.style.transition = 'all 0.2s ease-in'
        el.style.opacity = '0'
        el.style.filter = 'blur(4px)'
        el.style.transform = 'translateY(5px)'
        setTimeout(() => {
          el.innerText = data.suffix
          el.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          el.style.opacity = '1'
          el.style.filter = 'blur(0px)'
          el.style.transform = 'translateY(0)'
        }, 200)
      }
    })
    
    setSelectedDuration(period)
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
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden; }
        .scrolling-wrapper { -webkit-overflow-scrolling: touch; }
        .scrolling-wrapper::-webkit-scrollbar { display: none; }
        
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
        
        /* Optimize touch interactions */
        button {
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
          position: relative;
        }
        
        /* Smooth rendering */
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        
        @media (max-width: 767px) {
          html, body { max-width: 100vw; overflow-x: hidden; }
          * { max-width: 100%; box-sizing: border-box; transition-duration: 0.2s !important; }
        }
        
        /* Mobile optimizations - aggressive performance boost */
        @media (max-width: 1023px) {
          /* Disable GPU-heavy effects */
          .absolute.rounded-full.blur-3xl { display: none !important; }
          .backdrop-blur-xl, .backdrop-blur-2xl { backdrop-filter: blur(4px) !important; }
          [class*="shadow-2xl"], [class*="shadow-xl"] { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15) !important; }
          
          /* Disable looping animations */
          .animate-color-shift { animation: none !important; }
          
          /* Disable hover effects on touch devices */
          @media (hover: none) {
            button:hover { 
              transform: none !important;
              scale: none !important;
            }
          }
        }
      `}</style>

      <div className={`min-h-screen antialiased flex flex-col items-center justify-center font-inter p-0 xl:pt-2 xl:pr-4 xl:pb-8 xl:pl-4 relative overflow-x-hidden ${inter.variable} ${oswald.variable} ${montserrat.variable} ${roboto.variable}`} style={{
        background: colors.backgroundGradient,
        color: colors.textPrimary
      }}>
        <main className="relative w-full xl:max-w-[96rem] xl:rounded-[3rem] overflow-x-hidden min-h-screen xl:min-h-[calc(100vh-4rem)]" style={{ background: colors.background }}>
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] blur-[120px] rounded-full" style={{ background: colors.blurColor1 }} />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] blur-[120px] rounded-full" style={{ background: colors.blurColor2 }} />
          </div>
          
          {/* Navigation */}
          <nav className="sticky top-0 z-50 px-4 md:px-4 xl:px-4 py-4">
            <div className="backdrop-blur-xl rounded-full shadow-2xl shadow-black/30" style={{
              background: colors.navbarBg,
              border: `1px solid ${colors.cardBorder}`
            }}>
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-4">
                  <a href="#" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <div className="flex text-white rounded-lg md:rounded-xl w-8 h-8 md:w-10 md:h-10 items-center justify-center shadow-lg" style={{
                      background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                      boxShadow: `0 4px 20px ${colors.primary}40`
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6.5 6.5 11 11"></path>
                        <path d="m21 21-1-1"></path>
                        <path d="m3 3 1 1"></path>
                        <path d="m18 22 4-4"></path>
                        <path d="m2 6 4-4"></path>
                        <path d="m3 10 7-7"></path>
                        <path d="m14 21 7-7"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="uppercase leading-none text-base md:text-lg font-semibold tracking-tight font-oswald" style={{ color: colors.textPrimary }}>MargoFitness</span>
                      <span className="text-[0.55rem] uppercase tracking-widest hidden sm:block" style={{ color: colors.textSecondary }}>Elite Performance</span>
                    </div>
                  </a>

                  <div className="hidden lg:flex items-center gap-1">
                    <a href="#" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-80" style={{ color: colors.textPrimary }}>Главная</a>
                    <a href="#" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-100" style={{ color: colors.textSecondary }}>Бесплатные материалы</a>
                    <a href="#" className="px-4 py-2 text-sm font-medium transition-all hover:opacity-100" style={{ color: colors.textSecondary }}>Тарифы</a>
                  </div>

                  <button className="uppercase hover:opacity-80 transition-all flex text-xs font-semibold tracking-wider rounded-full py-2 px-4 md:px-5 gap-2 items-center backdrop-blur flex-shrink-0 active:scale-95" style={{
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cardBorder}`,
                    background: `${colors.textPrimary}0D`,
                    touchAction: 'manipulation'
                  }}>
                    <span className="hidden sm:inline pointer-events-none">Войти</span>
                    <span className="sm:hidden pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="hidden sm:block pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </nav>
          
          <div className="relative w-full z-10">
              
              {/* 1. HERO SECTION */}
              <section className="w-full mx-auto px-4 pt-4 pb-10 md:px-8 md:pt-6 md:pb-16 relative overflow-x-hidden md:max-w-[90rem]">
                {/* Desktop Hero */}
                <div className="hidden md:flex flex-col gap-6 md:gap-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center">
                    <div className="lg:col-span-6 flex flex-col gap-4 md:gap-8 z-20">
                      <div className="flex gap-4 items-center">
                        <div className="h-px w-8 md:w-12" style={{ background: colors.secondary }}></div>
                        <span className="uppercase text-xs md:text-sm font-medium tracking-widest font-montserrat" style={{ color: colors.primary }}>Персональные тренировки онлайн</span>
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
                        Персональные программы тренировок от профессионального тренера. Новые тренировки каждую неделю, отслеживание прогресса и поддержка 24/7.
                      </p>

                      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <button className="px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-2xl shadow-lg w-full md:w-auto flex justify-center items-center active:scale-95" style={{
                          background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                          color: '#FFFFFF',
                          boxShadow: `0 10px 40px ${colors.primary}40`,
                          touchAction: 'manipulation'
                        }}>
                          <span className="flex items-center gap-2 uppercase text-sm font-semibold tracking-widest pointer-events-none">
                            Начать бесплатно
                            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                          </span>
                        </button>
                        <button className="px-8 py-4 rounded-xl hover:opacity-80 transition-all uppercase text-sm font-semibold tracking-widest w-full md:w-auto backdrop-blur-xl active:scale-95" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`,
                          color: colors.textPrimary,
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                          touchAction: 'manipulation'
                        }}>
                          <span className="pointer-events-none">Посмотреть тарифы</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-6 relative z-10 w-full">
                      <div className="absolute top-10 -right-10 w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] blur-[5rem] rounded-full pointer-events-none" style={{ background: colors.blurColor1 }}></div>
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[30rem] lg:h-[40rem] w-full" style={{ border: `1px solid ${colors.cardBorder}` }}>
                        <img src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=2070&auto=format&fit=crop" alt="Training" className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background}CC, transparent)` }}></div>
                        
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-xl" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                                background: `${colors.primary}33`,
                                border: `1px solid ${colors.primary}4D`
                              }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.primaryLight }}>
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

                {/* Mobile Hero - Overlay Glass */}
                <div className="md:hidden relative h-[85vh] mx-auto -mt-4 overflow-hidden max-w-full">
                  <img src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=2070&auto=format&fit=crop" alt="Training" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background} 0%, transparent 100%)` }}></div>
                  <div className="absolute bottom-8 left-4 right-4 backdrop-blur-2xl rounded-3xl p-6" style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="flex gap-3 items-center mb-3">
                      <div className="h-px w-8" style={{ background: colors.primary }}></div>
                      <span className="uppercase text-xs font-medium tracking-widest" style={{ color: colors.primary }}>
                        Персональные тренировки
                      </span>
                    </div>
                    <h1 className="text-4xl leading-[0.9] uppercase font-medium tracking-tight font-oswald mb-3" style={{ color: colors.textPrimary }}>
                      Преврати <br />
                      <span style={{ color: colors.primary }}>мечту в цель</span>
                    </h1>
                    <button className="w-full px-6 py-4 rounded-xl transition-all hover:shadow-xl shadow-lg active:scale-95" style={{ 
                      background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                      color: '#FFFFFF',
                      touchAction: 'manipulation'
                    }}>
                      <span className="flex items-center justify-center gap-2 uppercase text-sm font-semibold tracking-widest pointer-events-none">
                        Начать бесплатно
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </span>
                    </button>
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
                    { num: '01', title: 'Регистрация', desc: 'Создай аккаунт и получи доступ к бесплатным материалам' },
                    { num: '02', title: 'Выбор плана', desc: 'Выбери подходящую подписку в зависимости от твоих целей' },
                    { num: '03', title: 'Тренировки', desc: 'Следуй программам с видео-инструкциями и отслеживай прогресс' },
                    { num: '04', title: 'Результат', desc: 'Получай новые программы каждую неделю и достигай целей' }
                  ].map((step) => (
                    <div key={step.num} className="snap-center min-w-[85vw] md:min-w-0 p-6 md:p-8 rounded-3xl hover:bg-opacity-80 transition-all relative overflow-hidden min-h-[18rem] group backdrop-blur-xl" style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}>
                      <div className="absolute top-0 right-0 p-4 transition-all opacity-5">
                        <span className="text-7xl font-oswald font-bold group-hover:opacity-50 transition-opacity" style={{ color: colors.textPrimary }}>{step.num}</span>
                      </div>
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <h3 className="text-2xl font-montserrat uppercase mb-3" style={{ color: colors.textPrimary }}>{step.title}</h3>
                        <p className="text-base leading-relaxed font-roboto" style={{ color: colors.textSecondary }}>{step.desc}</p>
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
                      <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Тренер" className="w-full h-full object-cover object-top" />
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

                    <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6">
                      {[
                        { value: '5+', label: 'Лет опыта' },
                        { value: '500+', label: 'Учеников' },
                        { value: '100+', label: 'Программ' }
                      ].map((stat) => (
                        <div key={stat.label} className="backdrop-blur-xl p-4 rounded-2xl text-center hover:shadow-lg transition-all" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`
                        }}>
                          <div className="text-3xl md:text-4xl font-oswald font-medium" style={{ color: colors.textPrimary }}>{stat.value}</div>
                          <div className="text-[0.65rem] md:text-xs uppercase tracking-widest mt-1 font-montserrat" style={{ color: colors.textSecondary }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </section>

              {/* 4. PRICING */}
              <section className="py-10 md:py-16 relative overflow-x-hidden md:overflow-visible">
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
                            className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold uppercase tracking-widest transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1 leading-tight`}
                            style={{
                              background: selectedDuration === days ? `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})` : 'transparent',
                              color: selectedDuration === days ? '#FFFFFF' : colors.textSecondary,
                              boxShadow: selectedDuration === days ? `0 4px 16px ${colors.primary}4D` : 'none'
                            }}
                          >
                            <span className="text-xs md:text-sm">{days}</span>
                            <span className="text-xs md:text-sm">дней</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 py-2 pb-8 md:grid md:grid-cols-3 md:gap-5 scrolling-wrapper md:items-center px-[7.5vw] md:px-0">
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl backdrop-blur-xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-all md:min-h-[480px] flex-shrink-0" style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`
                    }}>
                      <h3 className="text-xl font-medium tracking-widest font-montserrat uppercase mb-2" style={{ color: colors.textPrimary }}>Basic</h3>
                      <p className="text-sm mb-6 font-roboto" style={{ color: colors.textSecondary }}>Для начинающих атлетов</p>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span ref={priceStarterRef} className="text-5xl font-semibold font-oswald transition-all duration-300" style={{ color: colors.textPrimary }}>{pricingData[30].starter}</span>
                          <span className="text-lg" style={{ color: colors.textSecondary }}>₽</span>
                          <span ref={(el) => { if (el) periodRefs.current[0] = el }} className="text-sm transition-all duration-300 ml-1" style={{ color: colors.textSecondary }}>{pricingData[30].suffix}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1 text-sm font-roboto" style={{ color: colors.textSecondary }}>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>2 тренировки в неделю</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Видео-инструкции</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Отслеживание прогресса</span>
                        </li>
                      </ul>
                      <button className="w-full rounded-xl px-6 py-4 text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-all active:scale-95" style={{
                        background: `${colors.textPrimary}1A`,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.cardBorder}`,
                        touchAction: 'manipulation'
                      }}>
                        <span className="pointer-events-none">Выбрать план</span>
                      </button>
                    </div>

                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl backdrop-blur-xl p-6 md:p-8 shadow-2xl z-10 flex flex-col relative hover:shadow-3xl transition-all md:min-h-[530px] flex-shrink-0" style={{
                      background: `${colors.primary}1A`,
                      border: `2px solid ${colors.primary}4D`
                    }}>
                      <div className="absolute top-6 right-6">
                        <span className="px-3 py-1.5 text-[0.65rem] font-bold uppercase text-white rounded-full shadow-lg" style={{
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                          boxShadow: `0 8px 24px ${colors.primary}4D`
                        }}>Популярный</span>
                      </div>
                      <h3 className="text-xl font-medium tracking-widest font-montserrat uppercase mb-2" style={{ color: colors.textPrimary }}>Premium</h3>
                      <p className="text-sm mb-6 font-roboto" style={{ color: colors.textSecondary }}>Оптимальное решение</p>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span ref={priceProRef} className="text-5xl font-semibold font-oswald transition-all duration-300" style={{ color: colors.textPrimary }}>{pricingData[30].pro}</span>
                          <span className="text-lg" style={{ color: colors.textSecondary }}>₽</span>
                          <span ref={(el) => { if (el) periodRefs.current[1] = el }} className="text-sm transition-all duration-300 ml-1" style={{ color: colors.textSecondary }}>{pricingData[30].suffix}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1 text-sm font-roboto" style={{ color: colors.textSecondary }}>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>3 тренировки в неделю</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Расширенные программы</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Бонусная система</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primaryLight }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Приоритетная поддержка</span>
                        </li>
                      </ul>
                      <button className="w-full rounded-xl text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-all shadow-lg active:scale-95" style={{
                        background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                        boxShadow: `0 8px 24px ${colors.primary}4D`,
                        touchAction: 'manipulation'
                      }}>
                        <span className="pointer-events-none">Начать бесплатно</span>
                      </button>
                    </div>

                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl backdrop-blur-xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-all md:min-h-[480px] flex-shrink-0" style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`
                    }}>
                      <h3 className="text-xl font-medium tracking-widest font-montserrat uppercase mb-2" style={{ color: colors.textPrimary }}>Elite</h3>
                      <p className="text-sm mb-6 font-roboto" style={{ color: colors.textSecondary }}>Максимум возможностей</p>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span ref={priceEliteRef} className="text-5xl font-semibold font-oswald transition-all duration-300" style={{ color: colors.textPrimary }}>{pricingData[30].elite}</span>
                          <span className="text-lg" style={{ color: colors.textSecondary }}>₽</span>
                          <span ref={(el) => { if (el) periodRefs.current[2] = el }} className="text-sm transition-all duration-300 ml-1" style={{ color: colors.textSecondary }}>{pricingData[30].suffix}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1 text-sm font-roboto" style={{ color: colors.textSecondary }}>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Всё из Premium</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Персональные рекомендации</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>VIP-поддержка 24/7</span>
                        </li>
                      </ul>
                      <button className="w-full rounded-xl px-6 py-4 text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-all active:scale-95" style={{
                        background: `${colors.textPrimary}1A`,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.cardBorder}`,
                        touchAction: 'manipulation'
                      }}>
                        <span className="pointer-events-none">Выбрать план</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. FEATURES SHOWCASE - iPhone Mockup Hidden on Mobile */}
              <section className="py-10 md:py-16 overflow-x-hidden relative">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
                  
                  {/* iPhone Mockup - Desktop Only */}
                  <div className="hidden lg:flex justify-start order-1 lg:order-1 items-start lg:ml-20">
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
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full ring-1" style={{
                                background: `linear-gradient(to bottom right, ${colors.primary}80, ${colors.secondary}80)`,
                                border: `1px solid ${colors.primary}4D`
                              }}></div>
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                            </div>

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
                                        <div className="text-lg font-bold font-montserrat uppercase tracking-tight" style={{ color: colors.textPrimary }}>PRO ATHLETE</div>
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
                                      <span className="text-4xl font-bold font-oswald" style={{ color: colors.textPrimary }}>5</span>
                                      <span className="text-base" style={{ color: colors.textSecondary }}>/ 6 тренировок</span>
                                    </div>
                                    <div className="text-[0.65rem] font-roboto" style={{ color: colors.textSecondary }}>Завершено на этой неделе</div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-[0.65rem] font-roboto" style={{ color: colors.textSecondary }}>
                                      <span>Недельный прогресс</span>
                                      <span className="font-semibold">83%</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.textPrimary}1A` }}>
                                      <div className="h-full w-[83%] rounded-full" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}></div>
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
                                      <span>До Silver осталось</span>
                                      <span className="font-semibold">750 шагов</span>
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
                        { icon: 'calendar', color: colors.primary, title: 'Еженедельно', desc: 'Новые программы каждый понедельник' },
                        { icon: 'users', color: colors.secondary, title: 'Для каждого', desc: 'Программы для любого уровня' },
                        { icon: 'video', color: colors.accent, title: 'Видео', desc: 'Подробные инструкции' },
                        { icon: 'tag', color: colors.primary, title: 'Бонусы', desc: 'Зарабатывай шаги' },
                        { icon: 'chart', color: colors.primaryLight, title: 'Прогресс', desc: 'Визуализация достижений' },
                        { icon: 'home', color: colors.accent, title: 'Где угодно', desc: 'Дома, в зале или на улице' }
                      ].map((feature, idx) => (
                        <div key={idx} className="backdrop-blur-xl rounded-2xl p-4 md:p-5 hover:shadow-lg transition-all flex flex-col gap-2 md:gap-3" style={{
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`,
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
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
                            {feature.icon === 'users' && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: feature.color }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
                            <p className="text-xs md:text-sm font-roboto" style={{ color: colors.textSecondary }}>{feature.desc}</p>
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
                  <div className="relative overflow-hidden xl:rounded-b-[3rem] py-8 md:py-12 px-4 sm:px-6 md:px-8" style={{
                    borderTop: `1px solid ${colors.cardBorder}`,
                    background: colors.background
                  }}>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                      <div className="absolute -bottom-32 -right-32 w-96 h-96 blur-[120px] rounded-full" style={{ background: `${colors.primary}0D` }} />
                      <div className="absolute -top-32 -left-32 w-96 h-96 blur-[120px] rounded-full" style={{ background: `${colors.secondary}0D` }} />
                    </div>

                    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] font-semibold tracking-tighter font-oswald mb-7 md:mb-8 uppercase text-center max-w-[1000px] w-full lg:w-auto px-4" style={{ color: colors.textPrimary }}>
                        Готова начать свой путь?
                      </h2>

                      <div className="relative w-full mb-6 flex justify-center max-w-[1000px]">
                        <div className="hidden lg:flex flex-col gap-2 text-sm font-inter absolute left-30 top-[calc(50%+10px)] -translate-y-1/2" style={{ color: colors.textSecondary }}>
                          <a href="#" className="hover:opacity-80 transition-colors w-fit">Главная</a>
                          <a href="#" className="hover:opacity-80 transition-colors w-fit">Тарифы</a>
                          <a href="#" className="hover:opacity-80 transition-colors w-fit">Бесплатное</a>
                          <a href="#" className="hover:opacity-80 transition-colors w-fit">О тренере</a>
                        </div>

                        <div className="flex flex-row items-center justify-center lg:gap-4 px-4 w-full lg:w-auto">
                          <button className="inline-flex items-center gap-2 text-sm font-semibold text-white tracking-tight rounded-xl px-6 sm:px-8 py-4 transition-all duration-200 font-inter shadow-lg justify-center whitespace-nowrap active:scale-95" style={{
                            background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                            boxShadow: `0 10px 40px ${colors.primary}40`,
                            touchAction: 'manipulation'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 pointer-events-none">
                              <path d="m6.5 6.5 11 11"></path>
                              <path d="m21 21-1-1"></path>
                              <path d="m3 3 1 1"></path>
                              <path d="m18 22 4-4"></path>
                              <path d="m2 6 4-4"></path>
                              <path d="m3 10 7-7"></path>
                              <path d="m14 21 7-7"></path>
                            </svg>
                            <span className="hidden sm:inline pointer-events-none">Начать тренировки</span>
                            <span className="sm:hidden text-xs pointer-events-none">Начать</span>
                          </button>
                          <div className="w-3 lg:hidden"></div>
                          <button className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight rounded-xl px-6 sm:px-8 py-4 transition-all duration-200 font-inter justify-center active:scale-95" style={{
                            background: colors.cardBg,
                            color: colors.textPrimary,
                            border: `1px solid ${colors.cardBorder}`,
                            touchAction: 'manipulation'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 pointer-events-none">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="text-xs sm:text-sm pointer-events-none">Войти</span>
                          </button>
                        </div>

                        <div className="hidden lg:flex flex-col gap-2 text-sm font-inter absolute right-20 top-1/2 -translate-y-1/2 items-end" style={{ color: colors.textSecondary }}>
                          <a href="#" className="hover:opacity-80 transition-colors w-fit whitespace-nowrap">Пользовательское соглашение</a>
                          <a href="#" className="hover:opacity-80 transition-colors w-fit whitespace-nowrap">Политика конфиденциальности</a>
                        </div>
                      </div>

                      <div className="flex items-center justify-center mb-4">
                        <a href="mailto:info@margofitness.ru" className="inline-flex items-center gap-2 text-sm md:text-base font-medium tracking-tight font-inter hover:opacity-80 transition-colors" style={{ color: colors.textSecondary }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          </svg>
                          <span>info@margofitness.ru</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-center lg:gap-2.5 mb-3 w-full lg:w-auto mx-auto px-4 lg:px-0">
                        <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight bg-white rounded-full px-4 py-2.5 hover:opacity-90 transition-colors duration-200 font-inter justify-center text-gray-900">
                          <SiTelegram className="w-4 h-4" />
                          <span>Telegram</span>
                        </a>
                        <div className="w-3 lg:hidden"></div>
                        <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:opacity-90 transition-colors duration-200 p-2.5">
                          <SiVk className="w-full h-full" />
                        </a>
                        <div className="w-3 lg:hidden"></div>
                        <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:opacity-90 transition-colors duration-200 p-2.5">
                          <SiInstagram className="w-full h-full" />
                        </a>
                        <div className="w-3 lg:hidden"></div>
                        <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:opacity-90 transition-colors duration-200 p-2.5">
                          <SiTiktok className="w-full h-full" />
                        </a>
                      </div>

                      <div className="text-center text-xs font-inter mb-4" style={{ color: colors.textSecondary }}>
                        © 2025 MargoFitness
                      </div>

                      <div className="lg:hidden flex flex-col items-center gap-2 pt-4 text-xs" style={{ borderTop: `1px solid ${colors.cardBorder}` }}>
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-inter" style={{ color: colors.textSecondary }}>
                          <a href="#" className="hover:opacity-80 transition-colors">Главная</a>
                          <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                          <a href="#" className="hover:opacity-80 transition-colors">Тарифы</a>
                          <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                          <a href="#" className="hover:opacity-80 transition-colors">Бесплатное</a>
                          <span style={{ color: `${colors.textSecondary}4D` }}>•</span>
                          <a href="#" className="hover:opacity-80 transition-colors">О тренере</a>
                        </div>
                        <div className="flex flex-col items-center gap-1 font-inter" style={{ color: colors.textSecondary }}>
                          <a href="#" className="hover:opacity-80 transition-colors text-center">Пользовательское соглашение</a>
                          <a href="#" className="hover:opacity-80 transition-colors text-center">Политика конфиденциальности</a>
                        </div>
                      </div>
                    </div>
                  </div>
              </footer>
          </div>
        </main>
        
      </div>
    </>
  )
}
