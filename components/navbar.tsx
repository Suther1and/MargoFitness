'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/actions/profile'
import { SignInPopup } from './signin-popup'
import { Menu, X } from 'lucide-react'
import { colors as sharedColors } from '@/lib/constants/colors'

const colors = {
  ...sharedColors,
  adminLink: '#fbbf24',
}

const navLinkClass = "px-4 py-2 text-sm font-medium transition-all hover:opacity-80"

interface NavbarProps {
  profile: Awaited<ReturnType<typeof getCurrentProfile>>
  pathname?: string
}

export default function Navbar({ profile, pathname = '' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isBackdropClosing, setIsBackdropClosing] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false)

  // Скрываем навигацию на тестовых страницах дизайна
  if (pathname.startsWith('/design-test')) {
    return null
  }

  // Отслеживание скролла для sticky эффекта
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Закрываем мобильное меню при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Слушаем события об открытии попапов со всех страниц
  useEffect(() => {
    const handlePopupStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>
      setIsAnyPopupOpen(customEvent.detail)
    }

    window.addEventListener('signInPopupStateChange', handlePopupStateChange)
    return () => window.removeEventListener('signInPopupStateChange', handlePopupStateChange)
  }, [])

  // Скролл не блокируем - пользователь может скроллить под открытым меню

  // MutationObserver для гарантированного срабатывания анимации на мобильных
  useEffect(() => {
    if (!mobileMenuOpen) return
    
    const isMobile = window.innerWidth < 1024
    
    if (isMobile) {
      const observer = new MutationObserver(() => {
        const panel = document.querySelector('[data-mobile-menu]') as HTMLElement
        if (panel) {
          panel.style.animation = 'none'
          void panel.offsetHeight // Force reflow
          panel.style.animation = ''
          observer.disconnect()
        }
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
      
      setTimeout(() => observer.disconnect(), 2000)
      return () => observer.disconnect()
    }
  }, [mobileMenuOpen])

  const handleCloseMobileMenu = () => {
    setIsClosing(true)
    setIsBackdropClosing(true)
    setTimeout(() => {
      setMobileMenuOpen(false)
      setIsClosing(false)
      setIsBackdropClosing(false)
    }, 500) // Длительность анимации закрытия
  }

  const handleAuthClick = () => {
    if (mobileMenuOpen) {
      // Если шторка открыта, закрываем её и открываем попап с задержкой
      handleCloseMobileMenu()
      setTimeout(() => {
        setIsSignInOpen(true)
      }, 400)
    } else {
      // Если шторка закрыта, открываем попап сразу
      setIsSignInOpen(true)
    }
  }

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/workouts', label: 'Тренировки' },
    { href: '/#pricing', label: 'Тарифы' },
    { href: '/free-content', label: 'Бесплатное' },
  ]

  const userLinks = profile
    ? [
        ...(profile.role === 'admin'
          ? [{ href: '/admin', label: 'Админка', isAdmin: true }]
          : []),
      ]
    : []

  return (
    <>
      <style jsx global>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes mobileMenuSlideScale {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.7);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes mobileMenuSlideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.7);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        [data-mobile-menu] {
          animation: slideInFromRight 0.4s cubic-bezier(0.34, 1.26, 0.64, 1) forwards;
        }

        [data-mobile-menu].closing {
          animation: mobileMenuSlideOut 0.5s cubic-bezier(0.34, 1.26, 0.64, 1) forwards;
        }

        @media (max-width: 1023px) {
          [data-mobile-menu] {
            animation: mobileMenuSlideScale 0.5s cubic-bezier(0.34, 1.26, 0.64, 1) forwards !important;
            animation-fill-mode: both !important;
          }
          
          [data-mobile-menu].closing {
            animation: mobileMenuSlideOut 0.5s cubic-bezier(0.34, 1.26, 0.64, 1) forwards !important;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease forwards;
        }

        .animate-fade-out {
          animation: fadeOut 0.3s ease forwards;
        }

        .hover-link:hover {
          color: #f97316 !important;
        }

        /* Принудительный блюр для navbar */
        div[data-navbar-container][data-navbar-blur="true"],
        div[data-navbar-blur="true"][data-navbar-container] {
          filter: blur(4px) !important;
          -webkit-filter: blur(4px) !important;
          transition: filter 0.2s ease-in-out !important;
        }
        
        /* Убеждаемся что backdrop-blur не мешает */
        div[data-navbar-container][data-navbar-blur="true"] *,
        div[data-navbar-blur="true"][data-navbar-container] * {
          will-change: auto !important;
        }

      `}</style>

      {/* Desktop Navbar - Full */}
      <div 
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 px-4 py-4 max-w-[96rem] mx-auto xl:px-8"
        data-navbar-container
        style={{
          pointerEvents: isAnyPopupOpen || isSignInOpen ? 'none' : 'auto'
        }}
      >
        <nav 
          className="backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 w-full"
          style={{
            background: colors.navbarBg,
            border: `1px solid ${colors.cardBorder}`
          }}
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-1.5 md:py-2 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
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
                <span className="uppercase leading-none text-base md:text-lg font-semibold tracking-tight" style={{ color: colors.textPrimary }}>MargoFitness</span>
                <span className="text-[0.55rem] uppercase tracking-widest hidden sm:block" style={{ color: colors.textSecondary }}>Elite Performance</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navLinkClass} hover-link`}
                  style={{ color: colors.textPrimary }}
                >
                  {link.label}
                </Link>
              ))}
              
              {userLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navLinkClass} hover-link`}
                  style={{ color: link.isAdmin ? colors.adminLink : colors.textSecondary }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth/Profile */}
            <div className="flex items-center gap-2">
              {profile ? (
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="relative w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] transition-all hover:ring-2 hover:ring-orange-400/50 active:scale-95">
                    <div className="w-full h-full rounded-[12px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name || profile.email || 'Avatar'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-base font-bold">
                          {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <button 
                  onClick={() => setIsSignInOpen(true)}
                  className="uppercase hover:opacity-80 transition-all flex text-xs font-semibold tracking-wider rounded-full py-2 px-4 md:px-5 gap-2 items-center backdrop-blur flex-shrink-0 active:scale-95" 
                  style={{
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cardBorder}`,
                    background: `${colors.textPrimary}0D`,
                    touchAction: 'manipulation',
                  }}
                >
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
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Sign In Popup - выше навигации, чтобы не размонтировался при закрытии */}
      <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />

      {/* Mobile: только бургер */}
      {!isSignInOpen && !isAnyPopupOpen && (
        <div 
          className="lg:hidden fixed top-[15px] right-4 z-50"
          data-navbar-container
        >
          <button
            onClick={() => mobileMenuOpen ? handleCloseMobileMenu() : setMobileMenuOpen(true)}
            className="p-3 rounded-xl backdrop-blur-xl transition-all active:scale-95"
            style={{
              background: colors.navbarBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {(mobileMenuOpen || isClosing) && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${isBackdropClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={handleCloseMobileMenu}
          />

          {/* Mobile Menu Panel */}
          <div
            data-mobile-menu
            data-navbar-container
            className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-50 lg:hidden ${isClosing ? 'closing' : ''}`}
            style={{
              background: '#0C0C11',
              borderLeft: `1px solid ${colors.cardBorder}`
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: colors.cardBorder }}
              >
                <span
                  className="text-lg font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Меню
                </span>
                <button
                  onClick={handleCloseMobileMenu}
                  className="p-2 rounded-lg transition-all active:scale-95"
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                  }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl transition-all active:scale-95 hover-link"
                      style={{
                        background: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                        color: colors.textPrimary,
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl transition-all active:scale-95 hover-link"
                      style={{
                        background: link.isAdmin
                          ? `${colors.adminLink}1A`
                          : colors.cardBg,
                        border: `1px solid ${
                          link.isAdmin ? colors.adminLink : colors.cardBorder
                        }`,
                        color: link.isAdmin
                          ? colors.adminLink
                          : colors.textPrimary,
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer with Auth */}
              <div
                className="p-4 border-t"
                style={{ borderColor: colors.cardBorder }}
              >
                {profile ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}1A, ${colors.secondary}1A)`,
                      border: `1px solid ${colors.primary}33`,
                    }}
                  >
                    <div className="size-10 rounded-full flex items-center justify-center ring-2 ring-primary/30 overflow-hidden" style={{
                      background: profile.avatar_url 
                        ? 'transparent' 
                        : `linear-gradient(to bottom right, ${colors.primary}33, ${colors.secondary}33)`
                    }}>
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || profile.email || 'Avatar'}
                          className="size-full object-cover"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.textSecondary }}>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {profile.full_name || 'Профиль'}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Перейти в кабинет
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: colors.primary }}
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                ) : (
                  <button
                    onClick={handleAuthClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95"
                    style={{
                      background: `linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))`,
                      border: `1px solid rgba(59, 130, 246, 0.2)`,
                    }}
                  >
                    <div className="size-10 rounded-full flex items-center justify-center ring-2 ring-blue-500/30" style={{
                      background: `linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))`
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#60a5fa' }}>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        Авторизация
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Войдите в кабинет
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: '#60a5fa' }}
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

