'use client'

import { Inter, Oswald, Space_Grotesk } from 'next/font/google'
import { useState, useRef } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

type Period = 30 | 90 | 180 | 365

const pricingData = {
  30: { starter: 29, pro: 59, elite: 99, suffix: '/30 дней' },
  90: { starter: 79, pro: 149, elite: 249, suffix: '/90 дней' },
  180: { starter: 149, pro: 289, elite: 479, suffix: '/180 дней' },
  365: { starter: 279, pro: 549, elite: 899, suffix: '/365 дней' }
}

export default function DesignTestPage() {
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
        
        /* Prevent horizontal scroll on mobile */
        @media (max-width: 767px) {
          html, body { max-width: 100vw; overflow-x: hidden; }
          * { max-width: 100%; box-sizing: border-box; }
          img { max-width: 100%; height: auto; }
        }
        
        /* Mobile compact adjustments */
        @media (max-width: 767px) {
          .mobile-compact-section { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
          .mobile-compact-about { max-height: 100vh; }
          .mobile-compact-about img { height: 18rem !important; }
          .mobile-reduce-spacing { gap: 1rem !important; }
          .mobile-card-shadow { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15) !important; }
        }
      `}</style>

      <div className={`min-h-screen antialiased flex flex-col items-center justify-center text-neutral-900 font-inter bg-gray-950 p-0 xl:pt-8 xl:pr-4 xl:pb-8 xl:pl-4 relative overflow-x-hidden selection:bg-orange-500 selection:text-white ${inter.variable} ${oswald.variable} ${spaceGrotesk.variable}`}>
        <main className="relative w-full xl:max-w-[96rem] bg-[#EAEAEA] xl:rounded-[3rem] shadow-none xl:shadow-2xl overflow-x-hidden overflow-y-auto flex flex-col min-h-screen xl:min-h-[calc(100vh-4rem)]">
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[20rem] h-[20rem] md:w-[50rem] md:h-[50rem] bg-gradient-to-b from-white/60 to-transparent opacity-50 blur-3xl pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3 overflow-hidden"></div>

          {/* Navigation */}
          <nav className="flex flex-wrap z-30 bg-stone-100 p-4 md:px-12 md:py-6 relative gap-4 items-center justify-between border-b border-neutral-200/50 xl:border-none w-full overflow-x-hidden">
            <div className="flex items-center gap-3">
              <div className="flex text-white bg-neutral-900 w-10 h-10 md:w-9 md:h-9 rounded-lg items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1"></path><path d="m3 3 1 1"></path><path d="m18 22 4-4"></path><path d="m2 6 4-4"></path><path d="m3 10 7-7"></path><path d="m14 21 7-7"></path></svg>
              </div>
              <div className="flex flex-col">
                <span className="uppercase leading-none text-xl md:text-2xl font-medium tracking-tight font-oswald">AEXOS</span>
                <span className="text-[0.6rem] uppercase text-neutral-700 tracking-widest font-space hidden md:block">Elite Performance</span>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button className="uppercase hover:bg-neutral-800 transition-colors flex shadow-neutral-900/10 text-xs font-semibold text-white tracking-wider bg-neutral-900 rounded-full py-3 px-6 md:py-2 md:px-6 shadow-lg gap-2 items-center">
                <span>Login</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-100 z-10 relative">
            
            {/* 1. HERO SECTION */}
            <section className="bg-zinc-100 w-full mx-auto px-4 pt-8 pb-12 md:px-12 md:pt-12 md:pb-24 relative md:max-w-[90rem] overflow-x-hidden">
              <div className="flex flex-col gap-6 md:gap-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center">
                  {/* Text Content */}
                  <div className="lg:col-span-6 flex flex-col gap-4 md:gap-8 z-20 order-1">
                    <div className="flex gap-4 items-center">
                      <div className="h-px w-8 md:w-12 bg-orange-600"></div>
                      <span className="uppercase text-xs md:text-sm font-medium text-orange-600 tracking-widest">Advanced Human Performance</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-9xl leading-[0.9] uppercase font-medium text-neutral-900 tracking-tight font-oswald">
                      Redefine <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-900">Your Limits.</span>
                    </h1>

                    <p className="text-base md:text-lg text-neutral-600 max-w-lg font-inter leading-relaxed">
                      Science-backed programming, AI-driven recovery analysis, and elite coaching. Stop exercising. Start training.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                      <button className="px-8 py-4 bg-neutral-900 text-white rounded-lg transition-all hover:shadow-xl w-full md:w-auto flex justify-center items-center">
                        <span className="flex items-center gap-2 uppercase text-sm font-semibold tracking-widest">
                          Start Free Trial
                          <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </span>
                      </button>
                      <button className="px-8 py-4 border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-all uppercase text-sm font-semibold tracking-widest w-full md:w-auto">
                        View Plans
                      </button>
                    </div>
                  </div>

                  {/* Image Content */}
                  <div className="lg:col-span-6 relative z-10 order-2 w-full mt-4 lg:mt-0">
                    <div className="absolute top-10 -right-10 w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] bg-orange-500/10 blur-[5rem] rounded-full pointer-events-none"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[24rem] md:h-[30rem] lg:h-[40rem] w-full">
                      <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Training" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent"></div>
                      
                      {/* Floating Stats Card */}
                      <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-xl text-white shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5 4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider">Live Zone 4</span>
                          </div>
                          <span className="text-xl font-oswald font-medium">164 BPM</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs uppercase">
                            <span>Load</span>
                            <span>92%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[92%] rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. HOW IT WORKS */}
            <section className="py-12 md:py-20 bg-white border-t border-neutral-200 overflow-x-hidden">
              <div className="px-4 w-full mx-auto md:px-12 md:max-w-[90rem]">
                <div className="mb-8 md:mb-12 max-w-2xl">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2 block">The Protocol</span>
                  <h2 className="text-4xl md:text-5xl font-medium text-neutral-900 tracking-tight font-oswald">Built for Results.</h2>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 gap-4 pb-8 md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0 scrolling-wrapper">
                  {[
                    { num: '01', title: 'Assess', desc: 'Biometric scanning and strength testing to establish your physiological baseline.' },
                    { num: '02', title: 'Plan', desc: 'AI generates a hyper-customized split based on your goals, equipment, and schedule.' },
                    { num: '03', title: 'Execute', desc: 'Follow guided workouts with real-time form correction and intensity tracking.' },
                    { num: '04', title: 'Evolve', desc: 'Data analysis adapts your future sessions. Progressive overload is guaranteed.' }
                  ].map((step) => (
                    <div key={step.num} className="snap-center min-w-[85vw] md:min-w-0 p-6 md:p-8 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-neutral-900 hover:bg-neutral-900 transition-all relative overflow-hidden min-h-[16rem] group">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-7xl font-oswald font-bold text-neutral-200/50 group-hover:text-white/10">{step.num}</span>
                      </div>
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <h3 className="text-2xl font-oswald uppercase mb-3 text-neutral-900 group-hover:text-white">{step.title}</h3>
                        <p className="text-base text-neutral-500 leading-relaxed group-hover:text-neutral-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. ABOUT TRAINER */}
            <section className="bg-zinc-100 py-12 md:py-24 mobile-compact-section overflow-x-hidden">
              <div className="px-4 w-full mx-auto md:px-12 md:max-w-[90rem]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center mobile-compact-about">
                  {/* Image */}
                  <div className="order-1 relative w-full">
                    <div className="relative h-[22rem] md:h-[40rem] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mobile-card-shadow">
                      <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" alt="Head Coach" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-orange-600 text-white text-[0.65rem] uppercase tracking-widest font-bold">Head Coach</div>
                        <h3 className="text-white font-oswald text-3xl md:text-4xl uppercase tracking-tight">Marcus Thorne</h3>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="order-2 mobile-reduce-spacing flex flex-col gap-4 md:gap-6">
                    <div className="flex gap-4 items-center">
                      <div className="h-px w-12 bg-neutral-400"></div>
                      <span className="uppercase text-sm font-medium text-neutral-500 tracking-widest">Expert Guidance</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-oswald font-medium text-neutral-900 uppercase leading-[0.9]">
                      Training alone <br /> is just guessing.
                    </h2>
                    <div className="space-y-4 text-base md:text-lg text-neutral-600 leading-relaxed">
                      <p>"I've trained Olympians, Special Forces, and CEOs. The common thread? They don't rely on motivation; they rely on systems."</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6">
                      {[
                        { value: '15+', label: 'Years Exp' },
                        { value: '10k+', label: 'Athletes' },
                        { value: 'PhD', label: 'Biomech' }
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 text-center">
                          <div className="text-3xl md:text-4xl font-oswald font-medium text-neutral-900">{stat.value}</div>
                          <div className="text-[0.6rem] md:text-xs uppercase text-neutral-500 tracking-widest mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. PRICING */}
            <section className="bg-neutral-950 py-16 md:py-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
              <div className="mx-auto max-w-7xl px-0 md:px-8 relative z-10 overflow-hidden">
                <div className="mx-auto max-w-3xl text-center mb-10 px-6">
                  <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Simple, Transparent Pricing</span>
                  <h2 className="text-4xl sm:text-5xl tracking-tight text-white mt-4 font-oswald font-normal uppercase">Choose Your Duration</h2>
                  <p className="mt-4 text-white/80 text-lg">Select the commitment level that fits your goals</p>

                  {/* Period Selector */}
                  <div className="flex justify-center mt-8 px-4">
                    <div className="grid grid-cols-4 w-full max-w-sm md:max-w-xl p-1 md:p-1.5 bg-neutral-900/50 md:bg-neutral-900 border border-white/10 rounded-xl gap-1 md:gap-2">
                      {([30, 90, 180, 365] as Period[]).map((days) => (
                        <button 
                          key={days}
                          onClick={() => handlePeriodChange(days)}
                          className={`px-1.5 md:px-5 py-1.5 md:py-2.5 rounded-lg font-semibold uppercase tracking-wide md:tracking-widest transition-all flex flex-col md:flex-row items-center justify-center gap-0 md:gap-1 leading-tight ${
                            selectedDuration === days 
                              ? 'bg-white text-neutral-900 shadow-md' 
                              : 'text-neutral-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xs md:text-sm">{days}</span>
                          <span className="text-xs md:text-sm">ДНЕЙ</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="flex overflow-x-auto snap-x snap-mandatory px-6 gap-4 pb-8 md:grid md:grid-cols-3 md:gap-6 md:pb-0 md:px-0 scrolling-wrapper md:items-center">
                  {/* Starter */}
                  <div className="min-w-[88vw] snap-center md:min-w-0 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 flex flex-col md:min-h-[480px]">
                    <h3 className="text-xl font-medium text-white tracking-widest font-oswald uppercase mb-2">Starter</h3>
                    <p className="text-sm text-white/70 mb-6">Perfect for first-time athletes</p>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl text-white/60">$</span>
                        <span ref={priceStarterRef} className="text-5xl font-semibold text-white font-oswald transition-all duration-300">{pricingData[30].starter}</span>
                        <span ref={(el) => { if (el) periodRefs.current[0] = el }} className="text-white/60 text-sm transition-all duration-300">{pricingData[30].suffix}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-white/80">
                      <li className="flex gap-2"><span>✓</span><span>Basic Training Plan</span></li>
                      <li className="flex gap-2"><span>✓</span><span>Video Tutorials</span></li>
                      <li className="flex gap-2"><span>✓</span><span>Progress Tracking</span></li>
                    </ul>
                    <button className="w-full rounded-xl bg-white/10 text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-neutral-900 transition-all border border-white/10">Select Plan</button>
                  </div>

                  {/* Pro - Highlighted */}
                  <div className="min-w-[88vw] snap-center md:min-w-0 rounded-3xl bg-white p-6 md:p-8 shadow-2xl z-10 flex flex-col relative md:min-h-[530px]">
                    <div className="absolute top-6 right-6">
                      <span className="bg-neutral-900 px-3 py-1 text-[0.65rem] font-bold uppercase text-white rounded-full">Popular</span>
                    </div>
                    <h3 className="text-xl font-medium text-neutral-900 tracking-widest font-oswald uppercase mb-2">Pro Athlete</h3>
                    <p className="text-sm text-neutral-600 mb-6">Experience elite programming</p>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl text-neutral-400">$</span>
                        <span ref={priceProRef} className="text-5xl font-semibold text-neutral-900 font-oswald transition-all duration-300">{pricingData[30].pro}</span>
                        <span ref={(el) => { if (el) periodRefs.current[1] = el }} className="text-neutral-500 text-sm transition-all duration-300">{pricingData[30].suffix}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-700">
                      <li className="flex gap-2"><span className="text-orange-600">✓</span><span>AI-Adaptive Workouts</span></li>
                      <li className="flex gap-2"><span className="text-orange-600">✓</span><span>Advanced Biometrics</span></li>
                      <li className="flex gap-2"><span className="text-orange-600">✓</span><span>Nutrition Planning</span></li>
                      <li className="flex gap-2"><span className="text-orange-600">✓</span><span>Priority Support</span></li>
                    </ul>
                    <button className="w-full rounded-xl bg-neutral-900 text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all shadow-lg">Start Free Trial</button>
                  </div>

                  {/* Elite */}
                  <div className="min-w-[88vw] snap-center md:min-w-0 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 flex flex-col md:min-h-[480px]">
                    <h3 className="text-xl font-medium text-white tracking-widest font-oswald uppercase mb-2">Elite</h3>
                    <p className="text-sm text-white/70 mb-6">Ultimate performance package</p>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl text-white/60">$</span>
                        <span ref={priceEliteRef} className="text-5xl font-semibold text-white font-oswald transition-all duration-300">{pricingData[30].elite}</span>
                        <span ref={(el) => { if (el) periodRefs.current[2] = el }} className="text-white/60 text-sm transition-all duration-300">{pricingData[30].suffix}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-white/80">
                      <li className="flex gap-2"><span>✓</span><span>1-on-1 Coach Chat</span></li>
                      <li className="flex gap-2"><span>✓</span><span>Form Correction</span></li>
                      <li className="flex gap-2"><span>✓</span><span>All-inclusive access</span></li>
                    </ul>
                    <button className="w-full rounded-xl bg-white/10 text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-neutral-900 transition-all border border-white/10">Select Plan</button>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. FEATURES SHOWCASE */}
            <section className="py-16 md:py-24 bg-neutral-50 overflow-x-hidden">
              <div className="px-4 w-full mx-auto md:px-12 md:max-w-[90rem]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  
                  {/* Left: Dashboard Mockup */}
                  <div className="flex justify-center lg:justify-start order-1 lg:order-1">
                    <div className="w-full max-w-[280px] md:max-w-[360px] lg:max-w-[520px] relative">
                      {/* Phone Frame */}
                      <div style={{borderRadius: '2.5rem'}} className="relative bg-neutral-900 p-3 shadow-2xl border border-neutral-800/50 overflow-hidden">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-4 py-2 text-xs text-white/60">
                          <span className="font-semibold text-white">MargoFitness</span>
                          <div className="flex items-center gap-2">
                            <span>9:41</span>
                            <div className="w-4 h-2 rounded-full bg-white/20 overflow-hidden">
                              <div className="h-full w-3/4 bg-white/80"></div>
                            </div>
                          </div>
                        </div>

                        {/* Dashboard Content Preview */}
                        <div style={{borderRadius: '1.75rem'}} className="bg-zinc-100 p-4 space-y-3 min-h-[480px] md:min-h-[520px] lg:min-h-[580px]">
                          {/* Profile Card */}
                          <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                            <div className="flex-1">
                              <div className="h-3 bg-neutral-200 rounded w-24 mb-1"></div>
                              <div className="h-2 bg-neutral-100 rounded w-32"></div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              <div className="w-6 h-6 rounded-lg bg-orange-100 mb-2"></div>
                              <div className="h-2 bg-neutral-100 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-neutral-200 rounded w-12"></div>
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              <div className="w-6 h-6 rounded-lg bg-purple-100 mb-2"></div>
                              <div className="h-2 bg-neutral-100 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-neutral-200 rounded w-12"></div>
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              <div className="w-6 h-6 rounded-lg bg-blue-100 mb-2"></div>
                              <div className="h-2 bg-neutral-100 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-neutral-200 rounded w-12"></div>
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              <div className="w-6 h-6 rounded-lg bg-green-100 mb-2"></div>
                              <div className="h-2 bg-neutral-100 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-neutral-200 rounded w-12"></div>
                            </div>
                          </div>

                          {/* Progress Card */}
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <div className="h-3 bg-neutral-200 rounded w-32 mb-2"></div>
                            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
                              <div className="h-full w-2/3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
                            </div>
                            <div className="h-2 bg-neutral-100 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Glow Effect */}
                      <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 to-pink-500/20 blur-3xl -z-10"></div>
                    </div>
                  </div>

                  {/* Right: Features */}
                  <div className="flex flex-col gap-6 order-2 lg:order-2">
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Почему выбирают нас</span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-oswald font-medium text-neutral-900 uppercase leading-tight">
                        Твоя трансформация <br className="hidden md:block" /> начинается здесь
                      </h2>
                    </div>

                    {/* Mobile: Compact 2x3 Grid / Desktop: 2x3 Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4 auto-rows-fr">
                      {/* Feature 1 */}
                      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-neutral-200 hover:border-orange-500/30 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-orange-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 md:w-5 md:h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-0.5 md:mb-1">Еженедельные программы</h4>
                          <p className="text-xs md:text-sm text-neutral-600">Новые тренировки каждый понедельник</p>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-neutral-200 hover:border-orange-500/30 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-purple-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 md:w-5 md:h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-0.5 md:mb-1">Персональный подход</h4>
                          <p className="text-xs md:text-sm text-neutral-600">Программы для любого уровня подготовки</p>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-neutral-200 hover:border-orange-500/30 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 md:w-5 md:h-5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-0.5 md:mb-1">Видео с техникой</h4>
                          <p className="text-xs md:text-sm text-neutral-600">Детальные инструкции для каждого упражнения</p>
                        </div>
                      </div>

                      {/* Feature 4 */}
                      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-neutral-200 hover:border-orange-500/30 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-pink-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 md:w-5 md:h-5"><path d="M6.5 6.5 11 11m0 0 4.5 4.5M11 11l4.5-4.5M11 11l-4.5 4.5m10-7L21 21m-18 0 1-1m16-8 4-4M2 6l4-4"></path></svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-0.5 md:mb-1">Бонусная система</h4>
                          <p className="text-xs md:text-sm text-neutral-600">Зарабатывай шаги за тренировки и покупки</p>
                        </div>
                      </div>

                      {/* Feature 5 */}
                      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-neutral-200 hover:border-orange-500/30 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-green-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 md:w-5 md:h-5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-0.5 md:mb-1">Отслеживание прогресса</h4>
                          <p className="text-xs md:text-sm text-neutral-600">Визуализация твоих достижений</p>
                        </div>
                      </div>

                      {/* Feature 6 */}
                      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-neutral-200 hover:border-orange-500/30 transition-all flex flex-col gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-amber-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 md:w-5 md:h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-bold font-oswald uppercase mb-0.5 md:mb-1">Без привязки к залу</h4>
                          <p className="text-xs md:text-sm text-neutral-600">Тренируйся дома, в зале или на улице</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. FINAL CTA */}
            <section className="pb-12 px-4 md:px-12 bg-zinc-100 overflow-x-hidden">
              <div className="w-full mx-auto md:max-w-[90rem] bg-neutral-900 rounded-3xl relative overflow-hidden text-center py-16 md:py-24 px-6">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                  <h2 className="text-4xl md:text-7xl font-oswald font-medium text-white uppercase mb-6 leading-none tracking-tight">
                    Your Future Self <br /> Is Waiting.
                  </h2>
                  <p className="text-neutral-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
                    The only thing standing between you and peak performance is a decision. Join 15,000+ athletes today.
                  </p>
                  <button className="bg-white text-neutral-900 px-10 py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-lg">
                    Get Started Now
                  </button>
                </div>
              </div>
            </section>

            {/* 7. FOOTER */}
            <footer className="px-6 py-12 md:px-12 text-neutral-400 bg-neutral-900 overflow-x-hidden">
              <div className="max-w-7xl mx-auto text-center">
                <div className="mb-6">
                  <span className="font-oswald text-lg font-medium text-white">AEXOS</span>
                  <p className="text-sm mt-2">Elite Performance System</p>
                </div>
                <p className="text-xs">© 2026 AEXOS Performance. All rights reserved.</p>
              </div>
            </footer>
        </div>
      </main>
    </div>
    </>
  )
}
