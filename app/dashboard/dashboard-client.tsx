'use client'

import { Inter, Oswald } from 'next/font/google'
import { useEffect, useRef, useState, memo } from 'react'
import Link from 'next/link'
import { ReferralProcessor } from '@/components/referral-processor'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { Profile } from '@/types/database'
import { getTierDisplayName, getDaysUntilExpiration, isSubscriptionActive } from '@/lib/access-control'
import { getMonthGenitiveCase } from '@/lib/utils'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter', 
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true
})
const oswald = Oswald({ 
  subsets: ['latin'], 
  variable: '--font-oswald', 
  display: 'swap',
  fallback: ['Impact', 'system-ui'],
  preload: true
})

// Tooltip data - moved outside component to prevent recreation
const TOOLTIPS = {
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
} as const

interface DashboardClientProps {
  profile: Profile
}

export default function DashboardClient({ profile }: DashboardClientProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const bonusProgressRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const bonusCountRef = useRef<HTMLSpanElement>(null)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  const profileDesktopRef = useRef<HTMLElement>(null)
  const profileMobileRef = useRef<HTMLElement>(null)

  // Subscription data
  const subscriptionActive = isSubscriptionActive(profile)
  const daysLeft = getDaysUntilExpiration(profile)
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)
  
  // Display name and contact info
  const displayName = profile.full_name || 'Пользователь'
  const displayEmail = profile.email && !profile.email.includes('@telegram.local') ? profile.email : null
  const displayPhone = profile.phone || null
  
  // Auto-open profile dialog on first login
  useEffect(() => {
    if (!profile.profile_completed_at) {
      setProfileDialogOpen(true)
      setIsFirstTime(true)
    }
  }, [profile.profile_completed_at])
  
  const handleProfileDialogChange = (newOpen: boolean) => {
    setProfileDialogOpen(newOpen)
    if (!newOpen && isFirstTime) {
      setIsFirstTime(false)
    }
  }
  
  // Optimized animation logic for progress bars and counters
  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    const ANIMATION_DURATION = isMobile ? 1000 : 1500 // Faster on mobile
    let workoutAnimated = false
    let bonusAnimated = false
    
    // Unified animation function - uses CSS for progress, JS for counter
    const animateElements = (
      progressBar: HTMLElement | null,
      counter: HTMLElement | null,
      targetPercent: number,
      targetValue: number,
      formatter?: (n: number) => string
    ) => {
      if (!progressBar || !counter) return
      
      const format = formatter || ((n: number) => Math.floor(n).toString())
      
      // Set initial states
      progressBar.style.width = '0%'
      progressBar.style.transition = 'none' // Disable CSS transition, use JS
      counter.textContent = '0'
      
      // Animate both progress bar and counter with JS for perfect sync
      const startTime = performance.now()
      const frameInterval = isMobile ? 32 : 16 // ~30fps on mobile, ~60fps on desktop
      let lastFrameTime = startTime
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1)
        
        // Throttle animation frames on mobile (but always run final frame)
        if (progress < 1 && currentTime - lastFrameTime < frameInterval) {
          requestAnimationFrame(animate)
          return
        }
        
        lastFrameTime = currentTime
        
        // Smooth easing - same function for both animations
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        
        // Update progress bar (JS animation instead of CSS)
        const currentPercent = targetPercent * easeProgress
        progressBar.style.width = `${currentPercent}%`
        
        // Update counter
        const currentValue = targetValue * easeProgress
        counter.textContent = format(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Ensure final values are set when animation completes
          progressBar.style.width = `${targetPercent}%`
          counter.textContent = format(targetValue)
        }
      }
      
      requestAnimationFrame(animate)
    }
    
    // Set up intersection observers
    const observerOptions = {
      threshold: isMobile ? 0.05 : 0.2,
      rootMargin: '0px 0px -20px 0px'
    }
    
    const workoutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !workoutAnimated) {
            workoutAnimated = true
            animateElements(progressRef.current, countRef.current, 83, 5)
            workoutObserver.disconnect()
          }
        })
      },
      observerOptions
    )
    
    const bonusObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !bonusAnimated) {
            bonusAnimated = true
            animateElements(
              bonusProgressRef.current,
              bonusCountRef.current,
              62,
              1250,
              (n) => Math.floor(n).toLocaleString('ru-RU')
            )
            bonusObserver.disconnect()
          }
        })
      },
      observerOptions
    )
    
    // Start observing
    if (progressRef.current) workoutObserver.observe(progressRef.current)
    if (bonusProgressRef.current) bonusObserver.observe(bonusProgressRef.current)
    
    return () => {
      workoutObserver.disconnect()
      bonusObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    // Only add tooltip handler on desktop
    if (window.innerWidth < 1024) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.tooltip-trigger') && !target.closest('.tooltip-popup')) {
        setActiveTooltip(null)
      }
    }
    
    document.addEventListener('click', handleClickOutside, { passive: true })
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])
  
  // Optimized page entrance animations
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024
    const isMobile = window.innerWidth < 1024
    const isXL = window.innerWidth >= 1280
    
    // Animate cards
    const animateCards = () => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        
        // Always remove hidden class first
        card.classList.remove('card-hidden')
        
        if (isMobile) {
          // Mobile: Simple fade in without slide animation
          // Force reflow to ensure class removal is applied
          void card.offsetHeight
          
          card.style.opacity = '0'
          card.style.visibility = 'visible'
          card.style.transform = 'translateY(0)'
          
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease'
            card.style.opacity = '1'
            // Don't add gradientShift on mobile - battery drain
          })
        } else {
          // Desktop: Slide animation
          card.classList.add('card-animate-desktop')
          
          const handleEnd = () => {
            card.classList.remove('card-animate-desktop')
            card.style.visibility = 'visible'
            if (index === 3) {
              card.style.animation = 'gradientShift 10s ease infinite'
            }
            card.removeEventListener('animationend', handleEnd)
          }
          card.addEventListener('animationend', handleEnd)
        }
      })
    }
    
    // Animate profile
    const animateProfile = () => {
      const profileEl = isXL ? profileDesktopRef.current : profileMobileRef.current
      if (!profileEl) return
      
      // Always remove hidden class first
      profileEl.classList.remove('profile-hidden')
      
      if (isMobile && !isXL) {
        // Mobile: Simple fade in
        // Force reflow to ensure class removal is applied
        void profileEl.offsetHeight
        
        profileEl.style.opacity = '0'
        profileEl.style.visibility = 'visible'
        profileEl.style.transform = 'scale(1)'
        
        requestAnimationFrame(() => {
          profileEl.style.transition = 'opacity 0.4s ease'
          profileEl.style.opacity = '1'
        })
      } else {
        // Desktop/XL: Scale animation
        profileEl.classList.add('profile-animate')
        const handleEnd = () => {
          profileEl.classList.remove('profile-animate')
          profileEl.style.opacity = '1'
          profileEl.style.visibility = 'visible'
          profileEl.removeEventListener('animationend', handleEnd)
        }
        profileEl.addEventListener('animationend', handleEnd)
      }
    }
    
    // Execute animations
    const delay = isMobile ? 50 : 300
    setTimeout(() => {
      animateCards()
      setTimeout(animateProfile, isMobile ? 100 : 400)
    }, delay)
  }, [])

  const InfoButton = ({ tooltipKey }: { tooltipKey: string }) => (
    <button
      className="tooltip-trigger w-7 h-7 md:w-5 md:h-5 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center flex-shrink-0 [transition:all_0.3s_ease] hover:bg-white/10 hover:ring-white/20 hover:scale-110 active:scale-95"
      onClick={(e) => {
        e.stopPropagation()
        setActiveTooltip(activeTooltip === tooltipKey ? null : tooltipKey)
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-3 md:h-3 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <path d="M12 17h.01"></path>
      </svg>
    </button>
  )

  const Tooltip = memo(({ tooltipKey }: { tooltipKey: string }) => {
    const tooltip = TOOLTIPS[tooltipKey as keyof typeof TOOLTIPS]
    if (activeTooltip !== tooltipKey || !tooltip) return null
    
    return (
      <div 
        className="tooltip-popup absolute top-full left-0 mt-2 z-50 w-72 rounded-2xl bg-[#1a1a24] ring-1 ring-white/20 p-4 shadow-2xl backdrop-blur-xl"
        style={{
          animation: 'tooltipIn 0.2s ease-out forwards'
        }}
      >
        <div className="absolute -top-2 left-6 w-4 h-4 bg-[#1a1a24] ring-1 ring-white/20 rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <h4 className="text-sm font-semibold text-white mb-2">{tooltip.title}</h4>
        <p className="text-xs text-white/80 leading-relaxed">{tooltip.description}</p>
      </div>
    )
  })

  return (
    <>
      <ReferralProcessor />
      <ProfileEditDialog
        open={profileDialogOpen}
        onOpenChange={handleProfileDialogChange}
        profile={profile}
        isFirstTime={isFirstTime}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <style jsx global>{`
        .font-oswald { font-family: ${oswald.style.fontFamily}; }
        .font-inter { font-family: ${inter.style.fontFamily}; }
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden; }
        
        /* Optimized shimmer with GPU acceleration */
        @keyframes shimmer {
          0% {
            transform: translate3d(-100%, 0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate3d(200%, 0, 0);
            opacity: 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2.5s infinite !important;
        }
        
        /* Tooltip animation */
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
        
        /* Slide in from bottom */
        @keyframes slideInFromBottom {
          from {
            transform: translate3d(0, 50px, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
        
        /* Card initial state */
        .card-hidden {
          opacity: 1 !important;
          transform: translate3d(0, 50px, 0) !important;
          visibility: hidden !important;
        }
        
        .card-animate-desktop {
          animation: slideInFromBottom 1s cubic-bezier(0.34, 1.56, 0.64, 1) both !important;
          visibility: visible !important;
        }
        
        /* Profile card animation */
        .profile-hidden {
          opacity: 0 !important;
          visibility: hidden !important;
          transform: scale(0.9) !important;
        }
        
        .profile-animate {
          animation: scaleIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
          visibility: visible !important;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Pulse with glow - green */
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 1.5px 0.75px rgba(74, 222, 128, 0.45);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.28);
            box-shadow: 0 0 6px 2px rgba(74, 222, 128, 0.675);
          }
        }
        
        /* Pulse with glow - red */
        @keyframes pulseGlowRed {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 1.5px 0.75px rgba(248, 113, 113, 0.45);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.28);
            box-shadow: 0 0 6px 2px rgba(248, 113, 113, 0.675);
          }
        }
        
        /* Ring ripple effect - green */
        @keyframes ringRipple {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.75);
          }
        }
        
        /* Ring ripple effect - red */
        @keyframes ringRippleRed {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.75);
          }
        }
        
        /* Gradient shift animation */
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        /* Icon bounce */
        @keyframes iconBounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.1);
          }
        }
        
        /* Optimize touch interactions */
        button {
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        
        /* Smooth rendering */
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        
        /* Animation utilities */
        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite !important;
        }
        
        .animate-pulse-glow-red {
          animation: pulseGlowRed 2s ease-in-out infinite !important;
        }
        
        .animate-ring-ripple {
          animation: ringRipple 2s ease-out infinite !important;
        }
        
        .animate-ring-ripple-red {
          animation: ringRippleRed 2s ease-out infinite !important;
        }
        
        /* Mobile optimizations - aggressive performance boost */
        @media (max-width: 1023px) {
          html, body { max-width: 100vw; overflow-x: hidden; }
          * { max-width: 100%; box-sizing: border-box; transition-duration: 0.2s !important; }
          
          /* Disable GPU-heavy effects */
          .absolute.rounded-full.blur-3xl { display: none !important; }
          .backdrop-blur-xl, .backdrop-blur { backdrop-filter: blur(4px) !important; }
          [class*="shadow-2xl"], [class*="shadow-xl"] { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15) !important; }
          
          /* Disable all looping animations */
          .animate-shimmer, .animate-pulse-glow, .animate-ring-ripple, [style*="gradientShift"] { animation: none !important; }
          
          /* Disable hover effects on mobile - better performance and UX */
          @media (hover: none) {
            button:hover { 
              transform: none !important;
            }
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="relative w-full">
        <div className="px-4 md:px-8 pb-12">
              {/* Header */}
              <div className="mb-8 md:mb-12">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  {/* Left side - Title */}
                  <div className="flex-1">
                    <div className="hidden xl:flex justify-start mb-6 xl:mb-0 xl:absolute xl:top-[-3rem]">
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
                      <p className="hidden md:block mt-4 max-w-2xl text-base md:text-lg text-white/70">
                        Отслеживай свой прогресс и управляй подпиской
                      </p>
                    </div>
                  </div>

                  {/* Right side - Desktop User Profile */}
                  <div className="hidden xl:block flex-shrink-0 w-full xl:w-auto" style={{ transform: 'translateY(24px)' }}>
                <section ref={profileDesktopRef} className="profile-hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 pt-5 px-6 pb-6 md:hover:ring-white/20 md:hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                      <div className="relative z-10 flex items-center gap-5">
                        {/* Avatar */}
                        <button 
                          className="relative flex-shrink-0 group/avatar" 
                          style={{ touchAction: 'manipulation' }}
                          onClick={() => setProfileDialogOpen(true)}
                        >
                          <div className="w-32 h-32 rounded-[20px] bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] transition-all group-hover/avatar:ring-2 group-hover/avatar:ring-orange-400/50 active:scale-95">
                            <div className="w-full h-full rounded-[18px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                              {profile.avatar_url ? (
                                <img 
                                  src={profile.avatar_url} 
                                  alt="User Avatar" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Edit overlay on hover */}
                          <div className="absolute inset-0 rounded-[20px] bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              <path d="m15 5 4 4"></path>
                            </svg>
                          </div>
                        </button>

                        {/* Info */}
                        <div className="space-y-4 relative">
                          {/* Logout Button - positioned absolutely to not affect layout height */}
                          <a href="/auth/logout" className="absolute top-2 right-0 z-20 flex items-center gap-2 rounded-lg bg-red-500/10 ring-1 ring-red-400/30 px-3 py-2 transition-all hover:bg-red-500/15 hover:ring-red-400/40 active:scale-95 text-sm" style={{ touchAction: 'manipulation' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span className="text-red-200/90 font-medium">Выход</span>
                          </a>
                          
                          <div>
                            <h3 className="text-3xl font-semibold text-white font-oswald uppercase tracking-tight whitespace-nowrap">
                              {displayName}
                            </h3>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3 py-1.5 text-sm text-purple-200 ring-1 ring-purple-400/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                  <path d="M4 22h16"></path>
                                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                </svg>
                                <span className="font-medium">{tierDisplayName}</span>
                              </div>
                              {profile.created_at && (
                                <>
                                  <span className="text-xs text-white/50">•</span>
                                  <span className="text-sm text-white/60 whitespace-nowrap">
                                    Участник с {getMonthGenitiveCase(new Date(profile.created_at))} {new Date(profile.created_at).getFullYear()} г.
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            {displayEmail && (
                              <button 
                                className="flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95 text-left min-w-0" 
                                style={{ touchAction: 'manipulation' }}
                                onClick={() => setProfileDialogOpen(true)}
                              >
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 ring-1 ring-blue-400/20 flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                  </svg>
                                </div>
                                <div className="min-w-0 pointer-events-none">
                                  <p className="text-xs text-white/50 leading-tight">Email</p>
                                  <p className="text-sm text-white/90 truncate leading-tight mt-0.5">{displayEmail}</p>
                                </div>
                              </button>
                            )}

                            <button 
                              className="flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95 text-left flex-shrink-0" 
                              style={{ touchAction: 'manipulation' }}
                              onClick={() => setProfileDialogOpen(true)}
                            >
                              <div className="w-10 h-10 rounded-lg bg-green-500/10 ring-1 ring-green-400/20 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              </div>
                              <div className="pointer-events-none whitespace-nowrap" style={{ minWidth: '140px' }}>
                                <p className="text-xs text-white/50 leading-tight">Телефон</p>
                                <p className="text-sm text-white/90 leading-tight mt-0.5">{displayPhone || 'Не указан'}</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Mobile User Profile Card */}
              <section ref={profileMobileRef} className="profile-hidden xl:hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 mb-6 md:mb-8 md:hover:ring-white/20 md:hover:shadow-xl" style={{ transform: 'translateY(16px)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-5">
                  {/* Avatar - clickable for editing */}
                  <button 
                    className="relative flex-shrink-0 group/avatar" 
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => setProfileDialogOpen(true)}
                  >
                    <div className="w-28 h-28 rounded-[18px] bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] transition-all group-hover/avatar:ring-2 group-hover/avatar:ring-orange-400/50 active:scale-95">
                      <div className="w-full h-full rounded-[16px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="User Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Edit overlay on active/hover */}
                    <div className="absolute inset-0 rounded-[18px] bg-black/60 opacity-0 group-hover/avatar:opacity-100 group-active/avatar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-3.5 relative">
                    {/* Logout Button - positioned absolutely to not affect layout height */}
                    <a href="/auth/logout" className="absolute top-1 right-0 z-20 flex items-center gap-1.5 rounded-lg bg-red-500/10 ring-1 ring-red-400/30 px-2.5 py-1.5 transition-all hover:bg-red-500/15 hover:ring-red-400/40 active:scale-95 text-xs" style={{ touchAction: 'manipulation' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span className="text-red-200/90 font-medium">Выход</span>
                    </a>
                    
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-white font-oswald uppercase tracking-tight truncate pr-20">
                        {displayName}
                      </h3>
                      
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-xs text-purple-200 ring-1 ring-purple-400/30 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                          <path d="M4 22h16"></path>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                        <span className="font-medium">{tierDisplayName}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5">
                      {/* Phone */}
                      <button 
                        className="flex items-center gap-2 text-xs text-white/60 w-full rounded-lg py-1.5 px-2 transition-all hover:bg-white/[0.04] active:scale-95" 
                        style={{ touchAction: 'manipulation' }}
                        onClick={() => setProfileDialogOpen(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300 flex-shrink-0">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span className="pointer-events-none" style={{ minWidth: '120px', display: 'inline-block' }}>{displayPhone || 'Не указан'}</span>
                      </button>
                      
                      {/* Email */}
                      {displayEmail && (
                        <button 
                          className="flex items-center gap-2 text-xs text-white/60 w-full rounded-lg py-1.5 px-2 transition-all hover:bg-white/[0.04] active:scale-95" 
                          style={{ touchAction: 'manipulation' }}
                          onClick={() => setProfileDialogOpen(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 flex-shrink-0">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                          </svg>
                          <span className="truncate pointer-events-none">{displayEmail}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Divider - Desktop only */}
              <div className="hidden xl:flex items-center justify-center my-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/10 mx-8" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                
                {/* Card 1: Подписка */}
                <section 
                  ref={(el) => { cardsRef.current[0] = el }}
                  className="card-hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl md:hover:shadow-orange-500/10"
                >
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
                    {subscriptionActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/30">
                        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow">
                          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ring-ripple"></span>
                        </span>
                        Активна
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs text-red-200 ring-1 ring-red-400/30">
                        <span className="relative h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse-glow-red">
                          <span className="absolute inset-0 rounded-full bg-red-400 animate-ring-ripple-red"></span>
                        </span>
                        Неактивна
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white font-oswald uppercase tracking-tight">{tierDisplayName}</h3>
                        <p className="text-sm text-white/60 mt-1">
                          {subscriptionActive ? 'Активная подписка' : 'Подписка неактивна'}
                        </p>
                      </div>
                      {daysLeft !== null && daysLeft > 0 && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl text-white whitespace-nowrap">
                            <span className="font-bold">{daysLeft}</span>{' '}
                            <span className="text-xs font-normal text-white/50">
                              {(() => {
                                const lastDigit = daysLeft % 10
                                const lastTwoDigits = daysLeft % 100
                                if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней'
                                if (lastDigit === 1) return 'день'
                                if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
                                return 'дней'
                              })()}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {profile.subscription_expires_at && (
                      <div className="flex items-center gap-2 text-xs text-white/60 pt-3 border-t border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Истекает {new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button className="w-full rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 ring-1 ring-orange-400/30 p-3 transition-all hover:from-orange-500/15 hover:to-red-500/15 hover:ring-orange-400/40 active:scale-95" style={{ touchAction: 'manipulation' }}>
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                              <path d="M3 3v5h5"></path>
                              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                              <path d="M16 16h5v5"></path>
                            </svg>
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium text-white">Продлить подписку</p>
                            <p className="text-xs text-white/60">Выбери новый тариф</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs text-orange-200 whitespace-nowrap flex-shrink-0">
                          Открыть
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95" style={{ touchAction: 'manipulation' }}>
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                              <path d="M9 19h6"></path>
                              <path d="M9 15v-3H5l7-7 7 7h-4v3H9z"></path>
                            </svg>
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium text-white">Апгрейд тарифа</p>
                            <p className="text-xs text-white/60">Улучши свою подписку</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 whitespace-nowrap flex-shrink-0">
                          Открыть
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                </section>

                {/* Card 2: Тренировки за неделю */}
                <section 
                  ref={(el) => { cardsRef.current[1] = el }}
                  className="card-hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl md:hover:shadow-purple-500/10"
                >
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
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden relative">
                          <div 
                            ref={progressRef}
                            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-none"
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
                      
                      <button className="w-full rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 ring-1 ring-purple-400/30 p-3 transition-all hover:from-purple-500/15 hover:to-indigo-500/15 hover:ring-purple-400/40 active:scale-95" style={{ touchAction: 'manipulation' }}>
                        <div className="flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
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
                            <div className="text-left flex-1">
                              <p className="text-sm font-medium text-white">Программа недели</p>
                              <p className="text-xs text-white/60">6 тренировок доступно</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs text-purple-200 whitespace-nowrap flex-shrink-0">
                            Открыть
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Card 3: Дневник здоровья */}
                <section 
                  ref={(el) => { cardsRef.current[2] = el }}
                  className="card-hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl md:hover:shadow-emerald-500/10"
                >
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
                      <button className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10  transition-all hover:bg-white/[0.06] hover:ring-white/15 text-left active:scale-95">
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
                          <span className="text-xs font-bold text-emerald-400">-2.7</span>
                        </div>
                      </button>

                      {/* Шаги */}
                      <button className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10  transition-all hover:bg-white/[0.06] hover:ring-white/15 text-left active:scale-95">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Шаги</span>
                        </div>
                        <p className="text-2xl font-bold text-white font-oswald">8 547</p>
                      </button>

                      {/* Вода */}
                      <button className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10  transition-all hover:bg-white/[0.06] hover:ring-white/15 text-left active:scale-95">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Вода</span>
                        </div>
                        <p className="text-2xl font-bold text-white font-oswald">1.8<span className="text-sm text-white/60 ml-1">л</span></p>
                      </button>

                      {/* Калории */}
                      <button className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10  transition-all hover:bg-white/[0.06] hover:ring-white/15 text-left active:scale-95">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                            </svg>
                          </div>
                          <span className="text-xs text-white/60">Калории</span>
                        </div>
                        <p className="text-2xl font-bold text-white font-oswald">1 450</p>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 ring-1 ring-emerald-400/30 p-3  transition-all hover:from-emerald-500/15 hover:to-teal-500/15 hover:ring-emerald-400/40 active:scale-95">
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
                      </button>
                      
                      <button className="w-16 md:w-14 flex items-center justify-center rounded-xl bg-white/5 px-2 py-3 text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition-all active:scale-95">
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
                <Link href="/dashboard/bonuses">
                  <section 
                    ref={(el) => { cardsRef.current[3] = el }}
                    className="card-hidden group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/30 p-5 md:p-6 flex flex-col md:hover:ring-amber-400/60 md:hover:shadow-2xl md:hover:shadow-amber-500/20 cursor-pointer"
                    style={{ backgroundSize: '200% 200%' }}
                  >
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs text-amber-100 ring-1 ring-amber-400/40 font-medium relative overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent animate-shimmer"></span>
                        <span className="relative">Gold 🥇</span>
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
                          <div 
                            ref={bonusProgressRef}
                            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-none"
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3  transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95">
                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4"></path>
                              <path d="M12 8h.01"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Использовать</p>
                            <p className="text-xs text-white/60 mt-0.5">Оплата шагами</p>
                          </div>
                        </div>
                      </button>
                      
                      <button className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 ring-1 ring-amber-400/30 p-3  transition-all hover:from-amber-500/15 hover:to-orange-500/15 hover:ring-amber-400/40 active:scale-95">
                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                              <polyline points="16 6 12 2 8 6"></polyline>
                              <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Пригласить</p>
                            <p className="text-xs text-white/70 mt-0.5">+500 шагов</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </section>
                </Link>

                {/* Card 5: Полезные материалы */}
                <section 
                  ref={(el) => { cardsRef.current[4] = el }}
                  className="card-hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl md:hover:shadow-rose-500/10"
                >
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
                        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow">
                          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ring-ripple"></span>
                        </span>
                        Premium
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition-all hover:bg-white/[0.06] hover:ring-white/15 hover:shadow-lg  active:scale-95">
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

                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition-all hover:bg-white/[0.06] hover:ring-white/15 hover:shadow-lg  active:scale-95">
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

                    <button className="rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 ring-1 ring-rose-400/30 p-3 transition-all hover:from-rose-500/15 hover:to-pink-500/15 hover:ring-rose-400/40 text-left active:scale-95" style={{ touchAction: 'manipulation' }}>
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Обучающий контент</p>
                            <p className="text-xs text-white/60">Гайды и видео-уроки</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs text-rose-200 whitespace-nowrap flex-shrink-0">
                          Смотреть
                        </div>
                      </div>
                    </button>
                  </div>
                </section>

                {/* Card 6: Интенсивы */}
                <section 
                  ref={(el) => { cardsRef.current[5] = el }}
                  className="card-hidden group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6 flex flex-col md:hover:ring-white/25 md:hover:shadow-2xl md:hover:shadow-teal-500/10"
                >
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
                      <div className="rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-3 ring-1 ring-teal-400/30  aspect-square flex flex-col items-center justify-center text-center transition-all hover:ring-teal-400/50 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95">
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

                      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10  aspect-square flex flex-col items-center justify-center text-center transition-all hover:bg-white/[0.06] hover:ring-white/15 hover:shadow-lg active:scale-95">
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
                      <button className="w-full rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 ring-1 ring-teal-400/30 p-3 transition-all hover:from-teal-500/15 hover:to-cyan-500/15 hover:ring-teal-400/40 active:scale-95" style={{ touchAction: 'manipulation' }}>
                        <div className="flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                              </svg>
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-sm font-medium text-white">Каталог интенсивов</p>
                              <p className="text-xs text-white/60">Специализированные тренировки</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-teal-500/20 px-3 py-1.5 text-xs text-teal-200 whitespace-nowrap flex-shrink-0">
                            Открыть
                          </div>
                        </div>
                      </button>

                      <button className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-95" style={{ touchAction: 'manipulation' }}>
                        <div className="flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                              </svg>
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-sm font-medium text-white">Мои интенсивы</p>
                              <p className="text-xs text-white/60">Купленные программы</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 whitespace-nowrap flex-shrink-0">
                            Открыть
                          </div>
                        </div>
                      </button>
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

                {/* Mobile: original grid layout */}
                <div className="grid grid-cols-2 md:hidden gap-3">
                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 hover:shadow-xl active:scale-95">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 ring-1 ring-blue-400/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <path d="M8 10h.01"></path>
                        <path d="M12 10h.01"></path>
                        <path d="M16 10h.01"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80">Написать нам</span>
                  </button>

                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 hover:shadow-xl active:scale-95">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80">Оставить отзыв</span>
                  </button>

                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 hover:shadow-xl active:scale-95">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 ring-1 ring-rose-400/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80">Донат</span>
                  </button>

                  <button className="group/btn flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 hover:shadow-xl active:scale-95">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 ring-1 ring-sky-400/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-sky-300">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/80">Сообщество</span>
                  </button>
                </div>

                {/* Desktop: compact horizontal layout */}
                <div className="hidden md:flex gap-2">
                  <button className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95" style={{ touchAction: 'manipulation' }}>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 ring-1 ring-blue-400/20 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <path d="M8 10h.01"></path>
                        <path d="M12 10h.01"></path>
                        <path d="M16 10h.01"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white/80 pointer-events-none">Написать нам</span>
                  </button>

                  <button className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95" style={{ touchAction: 'manipulation' }}>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 ring-1 ring-amber-400/20 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white/80 pointer-events-none">Оставить отзыв</span>
                  </button>

                  <button className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95" style={{ touchAction: 'manipulation' }}>
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 ring-1 ring-rose-400/20 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white/80 pointer-events-none">Донат</span>
                  </button>

                  <button className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95" style={{ touchAction: 'manipulation' }}>
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 ring-1 ring-sky-400/20 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-sky-300">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white/80 pointer-events-none">Сообщество</span>
                  </button>
                </div>
              </div>
              </section>

              {/* Referral Card */}
              <section className="mt-12 relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                
                <button className="w-full transition-all hover:bg-white/[0.06] hover:ring-white/15 rounded-2xl p-5 active:scale-95" style={{ touchAction: 'manipulation' }}>
                  <div className="flex items-center justify-between gap-4 pointer-events-none">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                          <polyline points="16 6 12 2 8 6"></polyline>
                          <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-base md:text-lg font-semibold text-white mb-1">Приглашай друзей</p>
                        <p className="text-xs md:text-sm text-white/60">Получи +500 шагов за каждого друга</p>
                      </div>
                    </div>
                    <div className="hidden md:block rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 px-4 py-2 flex-shrink-0">
                      <span className="text-sm font-medium text-amber-200">Поделиться</span>
                    </div>
                  </div>
                </button>
              </section>
            </div>
          </div>
    </>
  )
}

