'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  // Скрываем на тестовых страницах
  if (pathname.startsWith('/design-test') || pathname === '/animation-test') {
    return null
  }

  const userLinks = profile?.role === 'admin'
    ? [{ href: '/admin', label: 'Админка', isAdmin: true }]
    : []

  const handleAuthClick = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
      setTimeout(() => setIsSignInOpen(true), 300)
    } else {
      setIsSignInOpen(true)
    }
  }

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-50 px-4 py-4 max-w-[96rem] mx-auto xl:px-8">
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
              <LogoIcon width={40} height={53} />
              <LogoWithText width={180} height={50} className="transition-opacity group-hover:opacity-70" />
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

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {profile ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-white hover:text-orange-500 transition-colors"
                  >
                    Профиль
                  </Link>
                  <Link
                    href="/auth/logout"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                      color: 'white'
                    }}
                  >
                    Выйти
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    color: 'white'
                  }}
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 p-4">
        <nav 
          className="backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 w-full"
          style={{
            background: colors.navbarBg,
            border: `1px solid ${colors.cardBorder}`
          }}
        >
          <div className="flex items-center justify-between px-4 py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <LogoIcon width={34} height={45} />
              <LogoWithText width={150} height={43} className="transition-opacity group-hover:opacity-70" />
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[80%] max-w-sm z-50"
              style={{
                background: colors.navbarBg,
                borderLeft: `1px solid ${colors.cardBorder}`
              }}
            >
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-white hover:text-orange-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium transition-colors"
                      style={{ color: colors.adminLink }}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {profile && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-white hover:text-orange-500 transition-colors"
                    >
                      Профиль
                    </Link>
                  )}
                </div>

                {/* Auth Buttons */}
                <div className="mt-auto pt-8">
                  {profile ? (
                    <Link
                      href="/auth/logout"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-6 py-3 text-center font-medium rounded-xl transition-colors"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                        color: 'white'
                      }}
                    >
                      Выйти
                    </Link>
                  ) : (
                    <button
                      onClick={handleAuthClick}
                      className="w-full px-6 py-3 font-medium rounded-xl transition-colors"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                        color: 'white'
                      }}
                    >
                      Войти
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SignIn Popup */}
      <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  )
}

