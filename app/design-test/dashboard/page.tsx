'use client'

import { Inter, Oswald, Space_Grotesk } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export default function DashboardDesignPage() {
  const progressRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const bonusCountRef = useRef<HTMLSpanElement>(null)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  
  const tooltips = {
    subscription: {
      title: 'Управление подпиской',
      description: 'Продли подписку или измени тариф для максимальной отдачи'
    },
    stats: {
      title: 'Тренировки',
      description: 'Отслеживай свой прогресс и переходи к тренировкам текущей недели'
    },
    bonuses: {
      title: 'Зарабатывай шаги',
      description: 'Получай бонусы за покупки и приглашай друзей для новых наград'
    },
    materials: {
      title: 'Обучающий контент',
      description: 'Бесплатные гайды и премиум материалы для твоих тренировок'
    },
    intensives: {
      title: 'Специальные программы',
      description: 'Узконаправленные паки тренировок для достижения конкретных целей'
    },
    diary: {
      title: 'Дневник здоровья',
      description: 'Отслеживай воду, шаги, вес, калории и другие важные показатели'
    }
  }
  
  useEffect(() => {
    // Animate progress bar
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && progressRef.current) {
          setTimeout(() => {
            if (progressRef.current) {
              progressRef.current.style.width = '83%'
            }
          }, 300)
        }
      })
    }, { threshold: 0.3 })

    if (progressRef.current?.parentElement) {
      observer.observe(progressRef.current.parentElement)
    }

    // Animate workout count
    if (countRef.current) {
      let count = 0
      const target = 5
      const duration = 1500
      const increment = target / (duration / 16)
      
      const timer = setInterval(() => {
        count += increment
        if (count >= target) {
          count = target
          clearInterval(timer)
        }
        if (countRef.current) {
          countRef.current.textContent = Math.floor(count).toString()
        }
      }, 16)
    }

    // Animate bonus count
    if (bonusCountRef.current) {
      let count = 0
      const target = 1250
      const duration = 2000
      const increment = target / (duration / 16)
      
      const timer = setInterval(() => {
        count += increment
        if (count >= target) {
          count = target
          clearInterval(timer)
        }
        if (bonusCountRef.current) {
          bonusCountRef.current.textContent = Math.floor(count).toLocaleString('ru-RU')
        }
      }, 16)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.tooltip-trigger') && !target.closest('.tooltip-popup')) {
        setActiveTooltip(null)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const InfoButton = ({ tooltipKey }: { tooltipKey: string }) => (
    <button
      className="tooltip-trigger w-5 h-5 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition-all flex-shrink-0"
      onClick={(e) => {
        e.stopPropagation()
        setActiveTooltip(activeTooltip === tooltipKey ? null : tooltipKey)
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <path d="M12 17h.01"></path>
      </svg>
    </button>
  )

  const Tooltip = ({ tooltipKey }: { tooltipKey: string }) => {
    const tooltip = tooltips[tooltipKey as keyof typeof tooltips]
    if (activeTooltip !== tooltipKey || !tooltip) return null
    
    return (
      <div 
        className="tooltip-popup absolute top-full left-0 mt-2 z-50 w-72 rounded-2xl bg-[#0a0a0f] ring-1 ring-white/20 p-4 shadow-2xl backdrop-blur-xl"
        style={{
          animation: 'tooltipIn 0.2s ease-out forwards'
        }}
      >
        <div className="absolute -top-2 left-6 w-4 h-4 bg-[#0a0a0f] ring-1 ring-white/20 rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <h4 className="text-sm font-semibold text-white mb-2">{tooltip.title}</h4>
        <p className="text-xs text-white/70 leading-relaxed">{tooltip.description}</p>
      </div>
    )
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
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        
        @keyframes tooltipIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @media (max-width: 767px) {
          html, body { max-width: 100vw; overflow-x: hidden; }
          * { max-width: 100%; box-sizing: border-box; }
        }
      `}</style>

      <div className={`min-h-screen antialiased flex flex-col items-center justify-center text-neutral-900 font-inter bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 p-0 xl:pt-8 xl:pr-4 xl:pb-8 xl:pl-4 relative overflow-x-hidden selection:bg-orange-500 selection:text-white ${inter.variable} ${oswald.variable} ${spaceGrotesk.variable}`}>
        <main className="relative w-full xl:max-w-[96rem] bg-[#0a0a0f] xl:rounded-[3rem] overflow-x-hidden overflow-y-auto min-h-screen xl:min-h-[calc(100vh-4rem)]">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-purple-500/10 blur-[120px] rounded-full" />
          </div>
          
          <div className="relative w-full z-10">
            
            {/* Navigation */}
            <nav className="flex flex-wrap z-30 backdrop-blur-xl bg-white/[0.03] border border-white/10 p-4 md:px-8 md:py-5 relative gap-4 items-center justify-between rounded-none md:rounded-2xl mb-6 md:mb-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex text-white bg-gradient-to-br from-orange-500 to-orange-600 w-10 h-10 rounded-xl items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1"></path><path d="m3 3 1 1"></path><path d="m18 22 4-4"></path><path d="m2 6 4-4"></path><path d="m3 10 7-7"></path><path d="m14 21 7-7"></path></svg>
                </div>
                <div className="flex flex-col">
                  <span className="uppercase leading-none text-lg md:text-xl font-semibold tracking-tight font-oswald text-white">MargoFitness</span>
                  <span className="text-[0.6rem] uppercase text-white/50 tracking-widest font-space hidden md:block">Elite Performance</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="uppercase hover:bg-white/10 transition-all flex text-xs font-semibold text-white/80 tracking-wider rounded-full py-2 px-5 gap-2 items-center border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span className="hidden sm:inline">Профиль</span>
                </button>
              </div>
            </nav>

            <div className="px-4 md:px-8 pb-12">
              {/* Header */}
              <div className="mb-8 md:mb-12">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  {/* Left side - Title */}
                  <div className="flex-1">
                    <div className="flex justify-start mb-6 xl:mb-0 xl:absolute xl:top-[-3rem]">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                          <line x1="12" y1="20" x2="12" y2="10"></line>
                          <line x1="18" y1="20" x2="18" y2="4"></line>
                          <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        <span className="text-sm text-orange-200/90">Твой прогресс</span>
                      </div>
                    </div>
                    
                    <div className="xl:mt-6">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white font-oswald uppercase">
                        Личный кабинет
                      </h1>
                      <p className="mt-4 max-w-2xl text-base md:text-lg text-white/70">
                        Отслеживай свой прогресс и управляй подпиской
                      </p>
                    </div>
                  </div>

                  {/* Right side - Desktop User Profile */}
                  <div className="hidden xl:block flex-shrink-0 w-full xl:w-auto xl:min-w-[42rem]">
                    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 hover:ring-white/20 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                      <div className="relative z-10 flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                              <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Margo" 
                                alt="User Avatar" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2 ring-[#0a0a0f]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <path d="m9 11 3 3L22 4"></path>
                            </svg>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <h3 className="text-2xl font-semibold text-white font-oswald uppercase tracking-tight">
                              Маргарита Иванова
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-200 ring-1 ring-purple-400/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                  <path d="M4 22h16"></path>
                                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                </svg>
                                <span className="font-medium">Pro Athlete</span>
                              </div>
                              <span className="text-xs text-white/50">•</span>
                              <span className="text-xs text-white/60">Участник с января 2024</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 ring-1 ring-blue-400/20 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[0.65rem] text-white/50 leading-tight">Email</p>
                                <p className="text-xs text-white/90 truncate leading-tight mt-0.5">margo.fitness@gmail.com</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-2.5">
                              <div className="w-8 h-8 rounded-lg bg-green-500/10 ring-1 ring-green-400/20 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[0.65rem] text-white/50 leading-tight">Телефон</p>
                                <p className="text-xs text-white/90 leading-tight mt-0.5">+7 (999) 123-45-67</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex flex-col gap-3 flex-shrink-0">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 text-center hover:bg-white/[0.06] transition-colors min-w-[4.5rem]">
                              <p className="text-xl font-bold text-white font-oswald leading-none">23</p>
                              <p className="text-[0.65rem] text-white/60 mt-1 leading-tight">дней</p>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 text-center hover:bg-white/[0.06] transition-colors min-w-[4.5rem]">
                              <p className="text-xl font-bold text-white font-oswald leading-none">47</p>
                              <p className="text-[0.65rem] text-white/60 mt-1 leading-tight">занятий</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                <path d="m15 5 4 4"></path>
                              </svg>
                            </button>
                            <button className="flex-1 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ring-1 ring-white/10 hover:bg-white/10 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Mobile User Profile Card */}
              <section className="xl:hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 hover:ring-white/20 transition-all mb-6 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-purple-500 p-[2px]">
                      <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Margo" 
                          alt="User Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2 ring-[#0a0a0f]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <path d="m9 11 3 3L22 4"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-semibold text-white font-oswald uppercase tracking-tight truncate">
                      Маргарита Иванова
                    </h3>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-xs text-purple-200 ring-1 ring-purple-400/30 mt-1.5 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                      </svg>
                      <span className="font-medium">Pro Athlete</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                      <span className="truncate">margo.fitness@gmail.com</span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center ring-1 ring-orange-400/30 hover:bg-orange-500/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      <path d="m15 5 4 4"></path>
                    </svg>
                  </button>
                </div>
              </section>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                
                {/* Card 1: Подписка */}
                <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 hover:ring-white/20 transition-all flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

                <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                      </svg>
                      <span className="font-medium">Моя подписка</span>
                      <InfoButton tooltipKey="subscription" />
                      <Tooltip tooltipKey="subscription" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active
                    </span>
                  </div>

                  <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-semibold text-white font-oswald uppercase tracking-tight">Pro Athlete</h3>
                        <p className="text-sm text-white/60 mt-1">Elite программа</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">23</p>
                        <p className="text-xs text-white/50">дней</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-white/60 pt-3 border-t border-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Истекает 19 января 2026
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 ring-1 ring-orange-400/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                              <path d="M3 3v5h5"></path>
                              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                              <path d="M16 16h5v5"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Продлить подписку</p>
                            <p className="text-xs text-white/60">Выбери новый тариф</p>
                          </div>
                        </div>
                        <button className="rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs text-orange-200 hover:bg-orange-500/30 transition-all whitespace-nowrap">
                          Открыть
                        </button>
                      </div>
                    </div>
                    
                    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Настройки тарифа</p>
                            <p className="text-xs text-white/60">Авто-продление и другое</p>
                          </div>
                        </div>
                        <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 transition-all whitespace-nowrap">
                          Открыть
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </section>

                {/* Card 2: Тренировки за неделю */}
                <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 hover:ring-white/20 transition-all flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

                  <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-4 relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                        <path d="m6.5 6.5 11 11"></path>
                        <path d="m21 21-1-1"></path>
                        <path d="m3 3 1 1"></path>
                        <path d="m18 22 4-4"></path>
                        <path d="m2 6 4-4"></path>
                        <path d="m3 10 7-7"></path>
                        <path d="m14 21 7-7"></path>
                      </svg>
                      <span className="font-medium">Тренировки</span>
                      <InfoButton tooltipKey="stats" />
                      <Tooltip tooltipKey="stats" />
                    </div>

                    <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10 mb-4">
                      <div className="flex items-end gap-3 mb-3">
                        <span ref={countRef} className="text-5xl font-bold text-white font-oswald">0</span>
                        <span className="text-lg text-white/60 mb-1.5">/ 6 тренировок</span>
                      </div>
                      <p className="text-sm text-white/70">Завершено на этой неделе</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Недельный прогресс</span>
                          <span>83%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden relative">
                          <div 
                            ref={progressRef}
                            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 ease-out"
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50 pt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                          </svg>
                          Продолжай в том же духе!
                        </div>
                      </div>
                      
                      <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 ring-1 ring-purple-400/30 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                                <path d="m6.5 6.5 11 11"></path>
                                <path d="m21 21-1-1"></path>
                                <path d="m3 3 1 1"></path>
                                <path d="m18 22 4-4"></path>
                                <path d="m2 6 4-4"></path>
                                <path d="m3 10 7-7"></path>
                                <path d="m14 21 7-7"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Программа недели</p>
                              <p className="text-xs text-white/60">6 тренировок доступно</p>
                            </div>
                          </div>
                          <button className="rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs text-purple-200 hover:bg-purple-500/30 transition-all whitespace-nowrap">
                            Открыть
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 3: Дневник здоровья */}
                <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 hover:ring-white/20 transition-all flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                  <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-4 relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        <path d="M12 7v6"></path>
                        <path d="M9 10h6"></path>
                      </svg>
                      <span className="font-medium">Дневник здоровья</span>
                      <InfoButton tooltipKey="diary" />
                      <Tooltip tooltipKey="diary" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {/* Вес */}
                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                              <path d="M3 3v18h18"></path>
                              <rect x="7" y="12" width="3" height="9"></rect>
                              <rect x="14" y="8" width="3" height="13"></rect>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Вес</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-white font-oswald">65.3<span className="text-sm text-white/60 ml-1">кг</span></p>
                          <span className="text-xs font-medium text-emerald-400">-2.7</span>
                        </div>
                      </div>

                      {/* Шаги */}
                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                              <ellipse cx="12" cy="5" rx="1" ry="3"></ellipse>
                              <path d="M2 20v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"></path>
                              <path d="M6 13.5V18"></path>
                              <path d="M18 13.5V18"></path>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Шаги</span>
                        </div>
                        <p className="text-2xl font-bold text-white font-oswald">8 547</p>
                      </div>

                      {/* Вода */}
                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Вода</span>
                        </div>
                        <p className="text-2xl font-bold text-white font-oswald">1.8<span className="text-sm text-white/60 ml-1">л</span></p>
                      </div>

                      {/* Калории */}
                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Калории</span>
                        </div>
                        <p className="text-2xl font-bold text-white font-oswald">1 450</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 ring-1 ring-emerald-400/30 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                                <path d="M12 5v14"></path>
                                <path d="M5 12h14"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Добавить запись</p>
                              <p className="text-xs text-white/60">Обнови показатели</p>
                            </div>
                          </div>
                          <button className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/30 transition-all whitespace-nowrap">
                            Открыть
                          </button>
                        </div>
                      </div>
                      
                      <button className="w-14 flex items-center justify-center rounded-xl bg-white/5 px-2 py-3 text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10"></line>
                          <line x1="12" y1="20" x2="12" y2="4"></line>
                          <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Card 4: Бонусная система */}
                <section className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/30 p-5 md:p-6 hover:ring-amber-400/50 transition-all flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                  <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.05] p-4 ring-1 ring-white/20 backdrop-blur relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <span className="font-medium">Бонусная программа</span>
                        <InfoButton tooltipKey="bonuses" />
                        <Tooltip tooltipKey="bonuses" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs text-amber-100 ring-1 ring-amber-400/40 font-medium">
                        Gold 🥇
                      </span>
                    </div>

                    <div className="rounded-xl bg-white/10 ring-1 ring-white/20 p-4 mb-3">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span ref={bonusCountRef} className="text-4xl font-bold text-white font-oswald">0</span>
                        <span className="text-lg text-white/70">шагов</span>
                      </div>
                      <p className="text-sm text-white/80">Твой текущий баланс</p>
                      
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex justify-between text-xs text-white/70 mb-2">
                          <span>До Silver осталось</span>
                          <span className="font-medium">750 шагов</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 w-[62%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3">
                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4"></path>
                              <path d="M12 8h.01"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">Использовать</p>
                            <p className="text-[0.65rem] text-white/60 mt-0.5">Оплата шагами</p>
                          </div>
                          <button className="rounded-lg bg-white/10 px-3 py-1 text-[0.65rem] text-white/80 hover:bg-white/15 transition-all whitespace-nowrap w-full">
                            Открыть
                          </button>
                        </div>
                      </div>
                      
                      <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 ring-1 ring-amber-400/30 p-3">
                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                              <polyline points="16 6 12 2 8 6"></polyline>
                              <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">Пригласить</p>
                            <p className="text-[0.65rem] text-white/70 mt-0.5">+500 шагов</p>
                          </div>
                          <button className="rounded-lg bg-amber-500/20 px-3 py-1 text-[0.65rem] text-amber-100 hover:bg-amber-500/30 transition-all whitespace-nowrap w-full">
                            Поделиться
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 5: Полезные материалы */}
                <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 hover:ring-white/20 transition-all flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

                  <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-white/80 text-sm relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                          <path d="M8 7h6"></path>
                          <path d="M8 11h8"></path>
                        </svg>
                        <span className="font-medium">Полезные материалы</span>
                        <InfoButton tooltipKey="materials" />
                        <Tooltip tooltipKey="materials" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        Premium
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400/20 to-pink-400/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Мастер-класс: Техника упражнений</p>
                            <p className="text-xs text-white/60 mt-0.5">15 мин • Premium</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Гайд по питанию</p>
                            <p className="text-xs text-white/60 mt-0.5">PDF • Бесплатно</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 text-center">
                        <p className="text-xl font-bold text-white font-oswald">24</p>
                        <p className="text-xs text-white/60 mt-0.5">Материала</p>
                      </div>
                      <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 text-center">
                        <p className="text-xl font-bold text-white font-oswald">12</p>
                        <p className="text-xs text-white/60 mt-0.5">Просмотрено</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 ring-1 ring-rose-400/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Обучающий контент</p>
                            <p className="text-xs text-white/60">Гайды и видео-уроки</p>
                          </div>
                        </div>
                        <button className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/30 transition-all whitespace-nowrap">
                          Смотреть
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 6: Интенсивы */}
                <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 hover:ring-white/20 transition-all flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

                  <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-white/80 text-sm relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                        </svg>
                        <span className="font-medium">Интенсивы</span>
                        <InfoButton tooltipKey="intensives" />
                        <Tooltip tooltipKey="intensives" />
                      </div>
                      <span className="text-xs text-white/60">3 куплено</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-3 ring-1 ring-teal-400/30 hover:ring-teal-400/50 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                            <path d="m6.5 6.5 11 11"></path>
                            <path d="m21 21-1-1"></path>
                            <path d="m3 3 1 1"></path>
                            <path d="m18 22 4-4"></path>
                            <path d="m2 6 4-4"></path>
                            <path d="m3 10 7-7"></path>
                            <path d="m14 21 7-7"></path>
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-white mb-1">Пресс за 14 дней</p>
                        <span className="text-xs text-teal-200 font-medium">Куплен</span>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                            <path d="M12 5v14"></path>
                            <path d="M5 12h14"></path>
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-white mb-1">Растяжка PRO</p>
                        <span className="text-xs text-white/50">590 ₽</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 ring-1 ring-teal-400/30 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Каталог интенсивов</p>
                              <p className="text-xs text-white/60">Специализированные тренировки</p>
                            </div>
                          </div>
                          <button className="rounded-lg bg-teal-500/20 px-3 py-1.5 text-xs text-teal-200 hover:bg-teal-500/30 transition-all whitespace-nowrap">
                            Открыть
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Мои интенсивы</p>
                              <p className="text-xs text-white/60">Купленные программы</p>
                            </div>
                          </div>
                          <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 transition-all whitespace-nowrap">
                            Открыть
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>

              {/* Quick Actions */}
              <section className="mt-12 relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300">
                    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
                    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>
                    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>
                  </svg>
                  <span className="font-medium">Быстрые действия</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 ring-1 ring-blue-400/20 flex items-center justify-center group-hover/btn:bg-blue-500/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <path d="M8 10h.01"></path>
                        <path d="M12 10h.01"></path>
                        <path d="M16 10h.01"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80 group-hover/btn:text-white transition-all">Написать нам</span>
                  </button>

                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 flex items-center justify-center group-hover/btn:bg-amber-500/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80 group-hover/btn:text-white transition-all">Оставить отзыв</span>
                  </button>

                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 ring-1 ring-rose-400/20 flex items-center justify-center group-hover/btn:bg-rose-500/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80 group-hover/btn:text-white transition-all">Донат</span>
                  </button>

                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 ring-1 ring-sky-400/20 flex items-center justify-center group-hover/btn:bg-sky-500/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-sky-300">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80 group-hover/btn:text-white transition-all">Сообщество</span>
                  </button>
                </div>
              </div>
              </section>

              {/* Footer CTA */}
              <section className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-purple-500/10 ring-1 ring-orange-400/30 p-8 md:p-12 text-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                    <path d="M5 3v4"></path>
                    <path d="M19 17v4"></path>
                    <path d="M3 5h4"></path>
                    <path d="M17 19h4"></path>
                  </svg>
                  <span className="text-sm text-white/90">Приглашай друзей</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase mb-4 leading-tight">
                  Получи +500 шагов<br />за каждого друга
                </h2>
                <p className="text-white/70 text-base md:text-lg mb-6">
                  Поделись ссылкой и зарабатывай бонусы. Твои друзья тоже получат подарок!
                </p>
                <button className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-all shadow-xl shadow-orange-500/20 text-sm uppercase tracking-wider">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  Поделиться ссылкой
                </button>
              </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

