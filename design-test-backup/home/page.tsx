'use client'

import { Inter, Oswald, Space_Grotesk } from 'next/font/google'
import { useState, useRef, useEffect } from 'react'
import { SiTelegram, SiVk, SiInstagram, SiTiktok } from 'react-icons/si'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

type Period = 30 | 90 | 180 | 365

const pricingData = {
  30: { starter: 990, pro: 1990, elite: 2990, suffix: '/30 дней' },
  90: { starter: 2690, pro: 5390, elite: 8090, suffix: '/90 дней' },
  180: { starter: 4990, pro: 9990, elite: 14990, suffix: '/180 дней' },
  365: { starter: 8990, pro: 17990, elite: 26990, suffix: '/365 дней' }
}

export default function HomeDesignPage() {
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
        .font-space { font-family: ${spaceGrotesk.style.fontFamily}; }
        .font-inter { font-family: ${inter.style.fontFamily}; }
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden; }
        .scrolling-wrapper { -webkit-overflow-scrolling: touch; }
        .scrolling-wrapper::-webkit-scrollbar { display: none; }
        
        @keyframes colorShift {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .animate-color-shift {
          background: linear-gradient(
            to right,
            #f97316 0%,
            #fb923c 25%,
            #fbbf24 50%,
            #fb923c 75%,
            #f97316 100%
          );
          background-size: 200% auto;
          animation: colorShift 4s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (max-width: 767px) {
          html, body { max-width: 100vw; overflow-x: hidden; }
          * { max-width: 100%; box-sizing: border-box; }
        }
      `}</style>

      <div className={`min-h-screen antialiased flex flex-col items-center justify-center text-neutral-900 font-inter bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 p-0 xl:pt-2 xl:pr-4 xl:pb-8 xl:pl-4 relative overflow-x-hidden selection:bg-orange-500 selection:text-white ${inter.variable} ${oswald.variable} ${spaceGrotesk.variable}`}>
        <main className="relative w-full xl:max-w-[96rem] bg-[#0a0a0f] xl:rounded-[3rem] overflow-x-hidden min-h-screen xl:min-h-[calc(100vh-4rem)]">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-purple-500/10 blur-[120px] rounded-full" />
          </div>
          
          {/* Navigation - Simple Sticky Pill */}
          <nav className="sticky top-0 z-50 px-4 md:px-4 xl:px-4 py-4">
            <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-full shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-4">
                  {/* Logo */}
                  <a href="#" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <div className="flex text-white bg-gradient-to-br from-orange-500 to-orange-600 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl items-center justify-center shadow-lg shadow-orange-500/20">
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
                      <span className="uppercase leading-none text-base md:text-lg font-semibold tracking-tight font-oswald text-white">MargoFitness</span>
                      <span className="text-[0.55rem] uppercase text-white/50 tracking-widest font-space hidden sm:block">Elite Performance</span>
                    </div>
                  </a>

                  {/* Navigation Links - Desktop */}
                  <div className="hidden lg:flex items-center gap-1">
                    <a href="#" className="px-4 py-2 text-sm font-medium text-white hover:text-white/80 transition-colors">Главная</a>
                    <a href="#" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Бесплатные материалы</a>
                    <a href="#" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Тарифы</a>
                  </div>

                  {/* CTA Button */}
                  <button className="uppercase hover:bg-white/10 transition-all flex text-xs font-semibold text-white/90 tracking-wider rounded-full py-2 px-4 md:px-5 gap-2 items-center border border-white/10 backdrop-blur flex-shrink-0">
                    <span className="hidden sm:inline">Войти</span>
                    <span className="sm:hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="hidden sm:block" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </nav>
          
          <div className="relative w-full z-10">
              
              {/* 1. HERO SECTION */}
              <section className="w-full mx-auto px-4 pt-4 pb-12 md:px-8 md:pt-6 md:pb-20 relative overflow-x-hidden md:max-w-[90rem]">
                <div className="flex flex-col gap-6 md:gap-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center">
                    {/* Text Content */}
                    <div className="lg:col-span-6 flex flex-col gap-4 md:gap-8 z-20 order-1">
                      <div className="flex gap-4 items-center">
                        <div className="h-px w-8 md:w-12 bg-orange-600"></div>
                        <span className="uppercase text-xs md:text-sm font-medium text-orange-400 tracking-widest">Персональные тренировки онлайн</span>
                      </div>

                      <h1 className="text-5xl md:text-7xl lg:text-9xl leading-[0.9] uppercase font-medium text-white tracking-tight font-oswald">
                        Преврати <br />
                        <span className="animate-color-shift">мечту</span> <br />
                        <span className="animate-color-shift">в цель.</span>
                      </h1>

                      <p className="text-base md:text-lg text-white/70 max-w-lg font-inter leading-relaxed">
                        Персональные программы тренировок от профессионального тренера. Новые тренировки каждую неделю, отслеживание прогресса и поддержка 24/7.
                      </p>

                      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <button className="px-8 py-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl transition-all hover:shadow-xl shadow-lg shadow-orange-500/20 w-full md:w-auto flex justify-center items-center">
                          <span className="flex items-center gap-2 uppercase text-sm font-semibold tracking-widest">
                            Начать бесплатно
                            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                          </span>
                        </button>
                        <button className="px-8 py-4 bg-white/5 ring-1 ring-white/10 text-white rounded-xl hover:bg-white/10 transition-all uppercase text-sm font-semibold tracking-widest w-full md:w-auto backdrop-blur">
                          Посмотреть тарифы
                        </button>
                      </div>
                    </div>

                    {/* Image Content */}
                    <div className="lg:col-span-6 relative z-10 order-2 w-full mt-4 lg:mt-0">
                      <div className="absolute top-10 -right-10 w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] bg-orange-500/10 blur-[5rem] rounded-full pointer-events-none"></div>
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[24rem] md:h-[30rem] lg:h-[40rem] w-full ring-1 ring-white/10">
                        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Training" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent"></div>
                        
                        {/* Floating Stats Card */}
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-5 rounded-2xl text-white shadow-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center ring-1 ring-orange-400/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-300">
                                  <path d="m6.5 6.5 11 11"></path>
                                  <path d="m21 21-1-1"></path>
                                  <path d="m3 3 1 1"></path>
                                  <path d="m18 22 4-4"></path>
                                  <path d="m2 6 4-4"></path>
                                  <path d="m3 10 7-7"></path>
                                  <path d="m14 21 7-7"></path>
                                </svg>
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wider">Активная тренировка</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs uppercase text-white/80">
                              <span>Прогресс недели</span>
                              <span className="font-bold">83%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 w-[83%] rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. HOW IT WORKS */}
              <section className="py-12 md:py-16 overflow-x-hidden">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="mb-8 md:mb-12 max-w-2xl">
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-2 block">Как это работает</span>
                  <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight font-oswald uppercase">Путь к результату</h2>
                </div>

                </div>
                <div className="flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 gap-4 pb-8 md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-8 scrolling-wrapper">
                  {[
                    { num: '01', title: 'Регистрация', desc: 'Создай аккаунт и получи доступ к бесплатным материалам' },
                    { num: '02', title: 'Выбор плана', desc: 'Выбери подходящую подписку в зависимости от твоих целей' },
                    { num: '03', title: 'Тренировки', desc: 'Следуй программам с видео-инструкциями и отслеживай прогресс' },
                    { num: '04', title: 'Результат', desc: 'Получай новые программы каждую неделю и достигай целей' }
                  ].map((step) => (
                    <div key={step.num} className="snap-center min-w-[85vw] md:min-w-0 p-6 md:p-8 bg-white/[0.04] ring-1 ring-white/10 rounded-3xl hover:ring-white/20 hover:bg-white/[0.06] transition-all relative overflow-hidden min-h-[16rem] group backdrop-blur">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-7xl font-oswald font-bold text-white/5 group-hover:text-white/10 transition-all">{step.num}</span>
                      </div>
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <h3 className="text-2xl font-oswald uppercase mb-3 text-white">{step.title}</h3>
                        <p className="text-base text-white/70 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. ABOUT TRAINER */}
              <section className="py-12 md:py-20 overflow-x-hidden">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
                  {/* Image */}
                  <div className="order-1 relative w-full">
                    <div className="relative h-[22rem] md:h-[40rem] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                      <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Тренер" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                        <div className="inline-block px-3 py-1.5 mb-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[0.7rem] uppercase tracking-widest font-bold shadow-lg shadow-orange-500/30">Сертифицированный тренер</div>
                        <h3 className="text-white font-oswald text-3xl md:text-4xl uppercase tracking-tight">Маргарита</h3>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="order-2 flex flex-col gap-4 md:gap-6">
                    <div className="flex gap-4 items-center">
                      <div className="h-px w-12 bg-orange-500"></div>
                      <span className="uppercase text-sm font-medium text-orange-400 tracking-widest">О тренере</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-oswald font-medium text-white uppercase leading-[0.95]">
                      Тренировки это<br />не мотивация,<br />это система
                    </h2>
                    <div className="space-y-4 text-base md:text-lg text-white/70 leading-relaxed">
                      <p>"Я помогаю людям достигать своих целей через персональные программы и системный подход. Каждая тренировка адаптирована под ваш уровень подготовки."</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6">
                      {[
                        { value: '5+', label: 'Лет опыта' },
                        { value: '500+', label: 'Учеников' },
                        { value: '100+', label: 'Программ' }
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur p-4 rounded-2xl text-center hover:ring-white/20 transition-all">
                          <div className="text-3xl md:text-4xl font-oswald font-medium text-white">{stat.value}</div>
                          <div className="text-[0.65rem] md:text-xs uppercase text-white/60 tracking-widest mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </section>

              {/* 4. PRICING */}
              <section className="py-12 md:py-24 relative overflow-x-hidden md:overflow-visible">
                {/* Gradient fade to next section - extended for smooth transition */}
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent via-purple-500/[0.008] to-purple-500/[0.018] pointer-events-none"></div>
                <div className="relative z-10 w-full mx-auto md:max-w-[90rem] md:px-8">
                  <div className="max-w-3xl text-center mb-10 mx-auto px-4 md:px-8">
                    <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">Прозрачное ценообразование</span>
                    <h2 className="text-4xl sm:text-5xl tracking-tight text-white mt-4 font-oswald font-normal uppercase">Выбери свой период</h2>
                    <p className="mt-4 text-white/70 text-lg">Чем длиннее период, тем выгоднее цена</p>

                    {/* Period Selector */}
                    <div className="flex justify-center mt-8">
                      <div className="grid grid-cols-4 w-full max-w-sm md:max-w-xl p-1.5 bg-white/[0.04] ring-1 ring-white/10 rounded-2xl gap-2 backdrop-blur">
                        {([30, 90, 180, 365] as Period[]).map((days) => (
                          <button 
                            key={days}
                            onClick={() => handlePeriodChange(days)}
                            className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold uppercase tracking-widest transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1 leading-tight ${
                              selectedDuration === days 
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="text-xs md:text-sm">{days}</span>
                            <span className="text-xs md:text-sm">дней</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Cards */}
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 py-2 pb-8 md:grid md:grid-cols-3 md:gap-5 scrolling-wrapper md:items-center px-[7.5vw] md:px-0">
                    {/* Starter */}
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur p-6 md:p-8 flex flex-col hover:ring-white/20 transition-all md:min-h-[480px] flex-shrink-0">
                      <h3 className="text-xl font-medium text-white tracking-widest font-oswald uppercase mb-2">Basic</h3>
                      <p className="text-sm text-white/60 mb-6">Для начинающих атлетов</p>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span ref={priceStarterRef} className="text-5xl font-semibold text-white font-oswald transition-all duration-300">{pricingData[30].starter}</span>
                          <span className="text-white/60 text-lg">₽</span>
                          <span ref={(el) => { if (el) periodRefs.current[0] = el }} className="text-white/60 text-sm transition-all duration-300 ml-1">{pricingData[30].suffix}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1 text-sm text-white/70">
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>2 тренировки в неделю</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Видео-инструкции</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Отслеживание прогресса</span>
                        </li>
                      </ul>
                      <button className="w-full rounded-xl bg-white/10 text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white/15 transition-all ring-1 ring-white/10">Выбрать план</button>
                    </div>

                    {/* Pro - Highlighted */}
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl bg-orange-500/10 ring-2 ring-orange-400/30 backdrop-blur p-6 md:p-8 shadow-2xl z-10 flex flex-col relative hover:ring-orange-400/50 transition-all md:min-h-[530px] flex-shrink-0">
                      <div className="absolute top-6 right-6">
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-[0.65rem] font-bold uppercase text-white rounded-full shadow-lg shadow-orange-500/30">Популярный</span>
                      </div>
                      <h3 className="text-xl font-medium text-white tracking-widest font-oswald uppercase mb-2">Premium</h3>
                      <p className="text-sm text-white/70 mb-6">Оптимальное решение</p>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span ref={priceProRef} className="text-5xl font-semibold text-white font-oswald transition-all duration-300">{pricingData[30].pro}</span>
                          <span className="text-white/70 text-lg">₽</span>
                          <span ref={(el) => { if (el) periodRefs.current[1] = el }} className="text-white/70 text-sm transition-all duration-300 ml-1">{pricingData[30].suffix}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1 text-sm text-white/80">
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>3 тренировки в неделю</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Расширенные программы</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Бонусная система</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Приоритетная поддержка</span>
                        </li>
                      </ul>
                      <button className="w-full rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30">Начать бесплатно</button>
                    </div>

                    {/* Elite */}
                    <div className="min-w-[85vw] snap-center md:min-w-0 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur p-6 md:p-8 flex flex-col hover:ring-white/20 transition-all md:min-h-[480px] flex-shrink-0">
                      <h3 className="text-xl font-medium text-white tracking-widest font-oswald uppercase mb-2">Elite</h3>
                      <p className="text-sm text-white/60 mb-6">Максимум возможностей</p>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span ref={priceEliteRef} className="text-5xl font-semibold text-white font-oswald transition-all duration-300">{pricingData[30].elite}</span>
                          <span className="text-white/60 text-lg">₽</span>
                          <span ref={(el) => { if (el) periodRefs.current[2] = el }} className="text-white/60 text-sm transition-all duration-300 ml-1">{pricingData[30].suffix}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1 text-sm text-white/70">
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Всё из Premium</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Персональные рекомендации</span>
                        </li>
                        <li className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>VIP-поддержка 24/7</span>
                        </li>
                      </ul>
                      <button className="w-full rounded-xl bg-white/10 text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white/15 transition-all ring-1 ring-white/10">Выбрать план</button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. FEATURES SHOWCASE */}
              <section className="py-12 md:py-20 overflow-x-hidden relative">
                {/* Gradient from previous section - extended for smooth blend */}
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/[0.018] via-purple-500/[0.022] to-purple-500/[0.025] pointer-events-none"></div>
                {/* Main gradient */}
                <div className="absolute inset-0 top-96 bottom-96 bg-purple-500/[0.025] pointer-events-none"></div>
                {/* Gradient to next section - extended for smooth fade */}
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/[0.025] via-purple-500/[0.012] to-transparent pointer-events-none"></div>
                
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
                  
                  {/* Left: iPhone 16 Pro Max Mockup - HIDDEN ON MOBILE */}
                  <div className="hidden lg:flex justify-start order-1 lg:order-1 items-start lg:ml-12">
                    <div className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px] relative">
                      {/* iPhone 16 Pro Max Frame */}
                      <div className="relative">
                        {/* iPhone Body */}
                        <div className="relative bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-[3rem] p-2 shadow-2xl ring-1 ring-white/20">
                          {/* Side Buttons */}
                          <div className="absolute -left-0.5 top-20 w-0.5 h-8 bg-neutral-700 rounded-l-sm"></div>
                          <div className="absolute -left-0.5 top-32 w-0.5 h-12 bg-neutral-700 rounded-l-sm"></div>
                          <div className="absolute -right-0.5 top-28 w-0.5 h-16 bg-neutral-700 rounded-r-sm"></div>
                          
                          {/* Screen with content */}
                          <div className="relative w-full bg-[#0a0a0f] rounded-[2.6rem] overflow-hidden" style={{height: '690px'}}>
                            {/* Dynamic Island */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 ring-1 ring-purple-500/30"></div>
                              <div className="w-2 h-2 rounded-full bg-neutral-950"></div>
                            </div>

                            {/* Status Bar */}
                            <div className="absolute top-4 left-5 right-5 flex items-center justify-between text-white text-[0.7rem] font-semibold z-10">
                              <span>9:41</span>
                              <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                  <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                  <line x1="12" y1="20" x2="12.01" y2="20"></line>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="13" viewBox="0 0 27 13" fill="none">
                                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="white" strokeOpacity="0.35" fill="none"/>
                                  <rect x="2" y="2" width="18" height="8" rx="1" fill="white"/>
                                  <path d="M24 4C24 3.44772 24.4477 3 25 3H25.5C26.0523 3 26.5 3.44772 26.5 4V8C26.5 8.55228 26.0523 9 25.5 9H25C24.4477 9 24 8.55228 24 8V4Z" fill="white" fillOpacity="0.4"/>
                                </svg>
                              </div>
                            </div>

                            {/* Dashboard Content - NO SCROLL, Fixed Layout */}
                            <div className="relative w-full h-full pt-14 px-3 pb-6 overflow-hidden">
                              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                              
                              <div className="space-y-3.5">
                                {/* 1. Subscription Card */}
                                <div className="relative bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 ring-1 ring-white/10 backdrop-blur rounded-2xl p-3.5 overflow-hidden">
                                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
                                  <div className="relative flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-300">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                      </svg>
                                      <span className="text-[0.7rem] text-white/80 font-medium">Моя подписка</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[0.65rem] text-emerald-200 ring-1 ring-emerald-400/30">
                                      <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                                      Active
                                    </span>
                                  </div>
                                  <div className="bg-white/[0.04] rounded-xl p-3 ring-1 ring-white/10 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <div className="text-lg font-bold text-white font-oswald uppercase tracking-tight">PRO ATHLETE</div>
                                        <div className="text-[0.65rem] text-white/60 mt-0.5">Elite программа</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-white">23</div>
                                        <div className="text-[0.6rem] text-white/50">дней</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-300">
                                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                      </svg>
                                      <span className="text-[0.65rem] text-white/60">Истекает 19 января 2026</span>
                                    </div>
                                  </div>
                                  <button className="w-full bg-orange-500/15 text-orange-200 rounded-xl px-3 py-2.5 text-[0.75rem] font-semibold ring-1 ring-orange-400/30 flex items-center justify-center gap-1.5 hover:bg-orange-500/20 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                      <path d="M3 3v5h5"></path>
                                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                                      <path d="M16 16h5v5"></path>
                                    </svg>
                                    Продлить
                                  </button>
                                </div>

                                {/* 2. Weekly Stats Card */}
                                <div className="relative bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 ring-1 ring-white/10 backdrop-blur rounded-2xl p-3.5 overflow-hidden">
                                  <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
                                  <div className="relative flex items-center gap-1.5 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-300">
                                      <path d="m6.5 6.5 11 11"></path>
                                      <path d="m21 21-1-1"></path>
                                      <path d="m3 3 1 1"></path>
                                    </svg>
                                    <span className="text-[0.7rem] text-white/80 font-medium">Статистика недели</span>
                                  </div>
                                  <div className="bg-white/[0.04] rounded-xl p-3 ring-1 ring-white/10 mb-2.5">
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="text-4xl font-bold text-white font-oswald">5</span>
                                      <span className="text-base text-white/60">/ 6 тренировок</span>
                                    </div>
                                    <div className="text-[0.65rem] text-white/60">Завершено на этой неделе</div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-[0.65rem] text-white/60">
                                      <span>Недельный прогресс</span>
                                      <span className="font-semibold">83%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                      <div className="h-full w-[83%] bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[0.65rem] text-white/50 pt-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-300">
                                        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                                      </svg>
                                      Продолжай в том же духе!
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Bonus Card */}
                                <div className="relative bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/30 backdrop-blur rounded-2xl p-3.5 overflow-hidden">
                                  <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
                                  <div className="relative flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-300">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                      </svg>
                                      <span className="text-[0.7rem] text-white/90 font-medium">Бонусная программа</span>
                                    </div>
                                    <span className="text-[0.65rem] text-amber-100 bg-amber-500/20 px-2 py-1 rounded-full ring-1 ring-amber-400/40 font-medium">Gold 🔥</span>
                                  </div>
                                  <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 ring-1 ring-white/20 rounded-xl p-3">
                                    <div className="flex items-baseline gap-2 mb-1.5">
                                      <span className="text-4xl font-bold text-white font-oswald">1 250</span>
                                      <span className="text-base text-white/70">шагов</span>
                                    </div>
                                    <div className="text-[0.65rem] text-white/80 mb-3">Твой текущий баланс</div>
                                    <div className="flex justify-between text-[0.65rem] text-white/70 mb-2">
                                      <span>До Silver осталось</span>
                                      <span className="font-semibold">750 шагов</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                      <div className="h-full w-[62%] bg-gradient-to-r from-amber-300 to-amber-500 rounded-full"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Glow Effect */}
                        <div className="absolute -inset-8 bg-gradient-to-br from-orange-500/20 via-purple-500/10 to-transparent blur-3xl -z-10"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Features */}
                  <div className="flex flex-col gap-6 order-2 lg:order-2 lg:col-span-1 col-span-1">
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Возможности платформы</span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-oswald font-medium text-white uppercase leading-tight">
                        Всё для твоих<br className="hidden md:block" />результатов
                      </h2>
                    </div>

                    {/* Mobile: Full Width 2x3 Grid / Desktop: Regular 2x3 Grid */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4 auto-rows-fr">
                      {/* Feature 1 */}
                      <div className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur rounded-2xl p-4 md:p-5 hover:ring-white/20 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 ring-1 ring-orange-400/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-1 text-white">Еженедельно</h4>
                          <p className="text-xs md:text-sm text-white/60">Новые программы каждый понедельник</p>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur rounded-2xl p-4 md:p-5 hover:ring-white/20 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 ring-1 ring-purple-400/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-1 text-white">Для каждого</h4>
                          <p className="text-xs md:text-sm text-white/60">Программы для любого уровня</p>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur rounded-2xl p-4 md:p-5 hover:ring-white/20 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 ring-1 ring-sky-400/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-300">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-1 text-white">Видео</h4>
                          <p className="text-xs md:text-sm text-white/60">Подробные инструкции</p>
                        </div>
                      </div>

                      {/* Feature 4 */}
                      <div className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur rounded-2xl p-4 md:p-5 hover:ring-white/20 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 ring-1 ring-orange-400/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-1 text-white">Бонусы</h4>
                          <p className="text-xs md:text-sm text-white/60">Зарабатывай шаги</p>
                        </div>
                      </div>

                      {/* Feature 5 */}
                      <div className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur rounded-2xl p-4 md:p-5 hover:ring-white/20 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-1 text-white">Прогресс</h4>
                          <p className="text-xs md:text-sm text-white/60">Визуализация достижений</p>
                        </div>
                      </div>

                      {/* Feature 6 */}
                      <div className="bg-white/[0.04] ring-1 ring-white/10 backdrop-blur rounded-2xl p-4 md:p-5 hover:ring-white/20 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-1 text-white">Где угодно</h4>
                          <p className="text-xs md:text-sm text-white/60">Дома, в зале или на улице</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </section>

              {/* 6. FINAL CTA */}
              <section className="pt-12 md:pt-16 pb-12 md:pb-20 overflow-x-hidden">
                <div className="px-4 md:px-8 w-full mx-auto md:max-w-[90rem]">
                <div className="relative overflow-hidden rounded-3xl bg-orange-500/5 ring-1 ring-orange-400/20 text-center py-16 md:py-20 px-6">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                  <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"></div>
                  <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-oswald font-medium text-white uppercase mb-6 leading-none tracking-tight">
                      Твоё будущее <br />начинается сегодня
                    </h2>
                    <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto">
                      Присоединяйся к сотням людей, которые уже изменили свою жизнь
                    </p>
                    <button className="bg-white text-orange-600 px-10 py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-white/20">
                      Начать прямо сейчас
                    </button>
                  </div>
                </div>
                </div>
              </section>

              {/* 7. FOOTER */}
              <footer className="mt-auto overflow-x-hidden">
                  <div className="relative overflow-hidden xl:rounded-b-[3rem] border-t border-white/10 bg-[#0a0a0f] text-white py-8 md:py-12 px-4 sm:px-6 md:px-8">
                    {/* Background effects */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full" />
                      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
                    </div>

                    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
                      {/* Title */}
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] font-semibold tracking-tighter font-oswald mb-7 md:mb-8 uppercase text-center max-w-[1000px] w-full lg:w-auto px-4">
                        Готова начать свой путь?
                      </h2>

                      {/* CTA Section - такая же ширина как заголовок */}
                      <div className="relative w-full mb-6 flex justify-center max-w-[1000px]">
                        {/* Desktop: Left Navigation */}
                        <div className="hidden lg:flex flex-col gap-2 text-sm text-white/60 font-inter absolute left-30 top-[calc(50%+10px)] -translate-y-1/2">
                          <a href="#" className="hover:text-orange-400 transition-colors w-fit">Главная</a>
                          <a href="#" className="hover:text-orange-400 transition-colors w-fit">Тарифы</a>
                          <a href="#" className="hover:text-orange-400 transition-colors w-fit">Бесплатное</a>
                          <a href="#" className="hover:text-orange-400 transition-colors w-fit">О тренере</a>
                        </div>

                        {/* CTA Buttons - центр */}
                        <div className="flex flex-row items-center justify-center lg:gap-4 px-4 w-full lg:w-auto">
                          <button className="inline-flex items-center gap-2 hover:bg-gradient-to-br hover:from-orange-600 hover:to-orange-700 text-sm font-semibold text-white tracking-tight bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl px-6 sm:px-8 py-4 transition-all duration-200 font-inter shadow-lg shadow-orange-500/20 justify-center whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                              <path d="m6.5 6.5 11 11"></path>
                              <path d="m21 21-1-1"></path>
                              <path d="m3 3 1 1"></path>
                              <path d="m18 22 4-4"></path>
                              <path d="m2 6 4-4"></path>
                              <path d="m3 10 7-7"></path>
                              <path d="m14 21 7-7"></path>
                            </svg>
                            <span className="hidden sm:inline">Начать тренировки</span>
                            <span className="sm:hidden text-xs">Начать</span>
                          </button>
                          <div className="w-3 lg:hidden"></div>
                          <button className="inline-flex items-center gap-2 text-sm font-semibold text-white tracking-tight bg-white/10 hover:bg-white/15 rounded-xl px-6 sm:px-8 py-4 transition-all duration-200 font-inter ring-1 ring-white/10 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="text-xs sm:text-sm">Войти</span>
                          </button>
                        </div>

                        {/* Desktop: Right Legal */}
                        <div className="hidden lg:flex flex-col gap-2 text-sm text-white/60 font-inter absolute right-20 top-1/2 -translate-y-1/2 items-end">
                          <a href="#" className="hover:text-orange-400 transition-colors w-fit whitespace-nowrap">Пользовательское соглашение</a>
                          <a href="#" className="hover:text-orange-400 transition-colors w-fit whitespace-nowrap">Политика конфиденциальности</a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-center mb-4">
                        <a href="mailto:info@margofitness.ru" className="inline-flex items-center gap-2 text-sm md:text-base font-medium tracking-tight text-white/70 font-inter hover:text-orange-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          </svg>
                          <span>info@margofitness.ru</span>
                        </a>
                      </div>

                      {/* Social */}
                      <div className="flex items-center justify-center lg:gap-2.5 mb-3 w-full lg:w-auto mx-auto px-4 lg:px-0">
                        <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight bg-white rounded-full px-4 py-2.5 hover:bg-white/90 transition-colors duration-200 font-inter justify-center">
                          <SiTelegram className="w-4 h-4" />
                          <span>Telegram</span>
                        </a>
                        <div className="w-3 lg:hidden"></div>
                        <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:bg-white/90 transition-colors duration-200 p-2.5">
                          <SiVk className="w-full h-full" />
                        </a>
                        <div className="w-3 lg:hidden"></div>
                        <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:bg-white/90 transition-colors duration-200 p-2.5">
                          <SiInstagram className="w-full h-full" />
                        </a>
                        <div className="w-3 lg:hidden"></div>
                        <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:bg-white/90 transition-colors duration-200 p-2.5">
                          <SiTiktok className="w-full h-full" />
                        </a>
                      </div>

                      {/* Copyright - под соцсетями по центру */}
                      <div className="text-center text-xs text-white/40 font-inter mb-4">
                        © 2025 MargoFitness
                      </div>

                      {/* Mobile Navigation */}
                      <div className="lg:hidden flex flex-col items-center gap-2 pt-4 border-t border-white/10 text-xs">
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/60 font-inter">
                          <a href="#" className="hover:text-orange-400 transition-colors">Главная</a>
                          <span className="text-white/30">•</span>
                          <a href="#" className="hover:text-orange-400 transition-colors">Тарифы</a>
                          <span className="text-white/30">•</span>
                          <a href="#" className="hover:text-orange-400 transition-colors">Бесплатное</a>
                          <span className="text-white/30">•</span>
                          <a href="#" className="hover:text-orange-400 transition-colors">О тренере</a>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-white/50 font-inter">
                          <a href="#" className="hover:text-orange-400 transition-colors text-center">Пользовательское соглашение</a>
                          <a href="#" className="hover:text-orange-400 transition-colors text-center">Политика конфиденциальности</a>
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
