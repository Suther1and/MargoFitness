'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SignInPopup } from './signin-popup'
import { getCurrentProfile } from '@/lib/actions/profile'
import { colors as sharedColors } from '@/lib/constants/colors'
import { LogoIcon } from './LogoIcon'
import { LogoWithText } from './LogoWithText'

const colors = {
  ...sharedColors,
  adminLink: '#fbbf24',
}

interface NavbarProps {
  profile: Awaited<ReturnType<typeof getCurrentProfile>>
  pathname?: string
}

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/workouts', label: 'Тренировки' },
  { href: '/#pricing', label: 'Тарифы' },
  { href: '/free-content', label: 'Бесплатное' },
]

export default function Navbar({ profile, pathname = '' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  // Скрываем на тестовых страницах
  if (pathname.startsWith('/design-test')) {
    return null
  }

  const userLinks = profile?.role === 'admin'
    ? [{ href: '/admin', label: 'Админка', isAdmin: true }]
    : []

  const handleCloseMobileMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setMobileMenuOpen(false)
      setIsClosing(false)
    }, 500)
  }

  const handleAuthClick = () => {
    if (mobileMenuOpen) {
      handleCloseMobileMenu()
      setTimeout(() => setIsSignInOpen(true), 400)
    } else {
      setIsSignInOpen(true)
    }
  }

  // Управление блюром навбара при открытии попапов
  // УБРАНО: Dialog компонент сам управляет data-navbar-blur через setNavbarBlur()
  // MutationObserver здесь конфликтовал с Dialog

  return (
    <>
      {/* SignIn Popup - условное монтирование (глобальные стили удалены, проблем нет) */}
      {isSignInOpen && <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />}

      <style jsx global>{`
        @keyframes mobileMenuSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes mobileMenuSlideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
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
          animation: mobileMenuSlideIn 0.3s ease-out forwards;
        }

        [data-mobile-menu].closing {
          animation: mobileMenuSlideOut 0.3s ease-in forwards;
        }

        /* Блюр для navbar при открытом попапе */
        [data-navbar-container][data-navbar-blur="true"] > nav,
        [data-navbar-container][data-navbar-blur="true"] > button {
          filter: blur(4px) !important;
          -webkit-filter: blur(4px) !important;
          transition: filter 0.2s ease-in-out !important;
        }

        [data-navbar-container][data-navbar-blur="true"] {
          pointer-events: none !important;
        }

        /* Отключаем backdrop-blur при применении filter */
        [data-navbar-container][data-navbar-blur="true"] .backdrop-blur-xl {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
      `}</style>

      {/* Desktop Navbar */}
      <div 
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 px-4 py-4 max-w-[96rem] mx-auto xl:px-8"
        data-navbar-container
      >
        <nav 
          className="backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 w-full"
          style={{
            background: colors.navbarBg,
            border: `1px solid ${colors.cardBorder}`
          }}
        >
          <div className="flex items-center justify-between px-6 py-2 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <LogoIcon width={40} height={53} className="transition-transform group-hover:scale-105" />
              <LogoWithText width={180} height={50} className="transition-transform group-hover:scale-105" />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-orange-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              {userLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{ color: colors.adminLink }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth/Profile */}
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
                  onClick={handleAuthClick}
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

      {/* Mobile: только кнопка бургера */}
      <div 
        className="lg:hidden fixed top-[15px] right-4 z-50"
        data-navbar-container
      >
        <button
          onClick={() => mobileMenuOpen ? handleCloseMobileMenu() : setMobileMenuOpen(true)}
          className="p-3 rounded-xl transition-all active:scale-95 shadow-lg"
          style={{
            background: colors.navbarBg,
            border: `1px solid ${colors.cardBorder}`,
            color: colors.textPrimary,
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {(mobileMenuOpen || isClosing) && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            style={{ animation: isClosing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.2s ease forwards' }}
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
                      onClick={handleCloseMobileMenu}
                      className="block px-4 py-3 rounded-xl transition-all active:scale-95"
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
                      onClick={handleCloseMobileMenu}
                      className="block px-4 py-3 rounded-xl transition-all active:scale-95"
                      style={{
                        background: link.isAdmin ? `${colors.adminLink}1A` : colors.cardBg,
                        border: `1px solid ${link.isAdmin ? colors.adminLink : colors.cardBorder}`,
                        color: link.isAdmin ? colors.adminLink : colors.textPrimary,
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
                    onClick={handleCloseMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}1A, ${colors.secondary}1A)`,
                      border: `1px solid ${colors.primary}33`,
                    }}
                  >
                    <div 
                      className="size-10 rounded-full flex items-center justify-center ring-2 ring-primary/30 overflow-hidden" 
                      style={{
                        background: profile.avatar_url 
                          ? 'transparent' 
                          : `linear-gradient(to bottom right, ${colors.primary}33, ${colors.secondary}33)`
                      }}
                    >
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
                      <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        {profile.full_name || 'Профиль'}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
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
                    <div 
                      className="size-10 rounded-full flex items-center justify-center ring-2 ring-blue-500/30" 
                      style={{
                        background: `linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))`
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#60a5fa' }}>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        Авторизация
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
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

