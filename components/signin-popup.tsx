"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface SignInPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Блокируем скролл страницы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      // Вычисляем ширину scrollbar ДО блокировки
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      const scrollY = window.scrollY
      
      // Блокируем скролл через overflow вместо position fixed
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      
      // Компенсируем для fixed элементов (например navbar)
      const fixedElements = document.querySelectorAll('[class*="sticky"], [class*="fixed"]')
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.paddingRight = `${scrollbarWidth}px`
        }
      })
      
      return () => {
        // Восстанавливаем всё
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        
        fixedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.paddingRight = ''
          }
        })
      }
    }
  }, [isOpen])

  // Гарантированное срабатывание анимации на мобильных через MutationObserver
  useEffect(() => {
    if (!isOpen) return
    
    // Для мобильных используем более агрессивный подход
    const isMobile = window.innerWidth < 1024
    
    if (isMobile) {
      // Ждем появления dialog-content в DOM
      const observer = new MutationObserver(() => {
        const content = document.querySelector('[data-slot="dialog-content"]') as HTMLElement
        if (content) {
          // Принудительно перезапускаем анимацию
          content.style.animation = 'none'
          void content.offsetHeight // Force reflow
          content.style.animation = ''
          observer.disconnect()
        }
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
      
      // Очистка через 2 секунды если не сработало
      setTimeout(() => observer.disconnect(), 2000)
      
      return () => observer.disconnect()
    } else {
      // На десктопе используем простой force reflow
      const content = document.querySelector('[data-slot="dialog-content"]') as HTMLElement | null
      if (content) {
        void content.offsetHeight
      }
    }
  }, [isOpen])

  return (
    <>
      <style jsx global>{`
        /* Плавный рендеринг шрифтов */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Оптимизация всех кнопок для touch-устройств */
        button {
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
        }
        
        @keyframes popupScaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes popupScaleInMobile {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes popupScaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        /* Desktop: bounce эффект (медленнее) */
        [data-slot="dialog-content"][data-state="open"] {
          animation: popupScaleIn 0.5s cubic-bezier(0.34, 1.26, 0.64, 1) forwards !important;
          animation-fill-mode: both !important;
        }
        
        [data-slot="dialog-content"][data-state="closed"] {
          animation: popupScaleOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards !important;
          animation-fill-mode: both !important;
        }
        
        /* Mobile: плавная анимация с bounce эффектом (scale от 0.7) */
        @media (max-width: 1023px) {
          [data-slot="dialog-content"][data-state="open"] {
            animation: popupScaleInMobile 0.8s cubic-bezier(0.34, 1.26, 0.64, 1) forwards !important;
            animation-fill-mode: both !important;
          }
          
          [data-slot="dialog-content"][data-state="closed"] {
            animation: popupScaleOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards !important;
            animation-fill-mode: both !important;
          }
          
          /* Отключаем декоративные blur круги на мобильных (очень тяжело для GPU) */
          .absolute.rounded-full.blur-3xl {
            display: none !important;
          }
          
          /* Упрощаем backdrop-blur */
          .backdrop-blur-xl,
          .backdrop-blur {
            backdrop-filter: blur(4px) !important;
          }
          
          /* Упрощаем тени */
          .shadow-2xl {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15) !important;
          }
          
          /* Ускоряем все transitions */
          * {
            transition-duration: 0.2s !important;
          }
          
          /* Отключаем hover эффекты на touch устройствах */
          @media (hover: none) {
            button:hover {
              transform: none !important;
            }
          }
        }
      `}</style>
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-sm p-0 border-0 bg-transparent overflow-visible"
          showCloseButton={false}
        >
        <DialogTitle className="sr-only">Вход в MargoFitness</DialogTitle>
        
          {/* Card - Dashboard style glassmorphism */}
          <div className="relative w-full max-w-[455px] mx-auto mt-8 mb-8 p-6 sm:p-8 overflow-hidden rounded-3xl bg-[#1a1a24]/75 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl">
            {/* Close button inside card - 3px from edges */}
            <button
              onClick={onClose}
              className="absolute top-[3px] right-[3px] z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
              style={{ willChange: 'transform, opacity' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white/80">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              <span className="sr-only">Закрыть</span>
            </button>

            {/* Background effects like dashboard */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

            {/* Inner card with gradient - dashboard style */}
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur relative">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-[2px] shadow-lg shadow-orange-500/20">
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6.5 6.5 11 11"></path>
                      <path d="m21 21-1-1"></path>
                      <path d="m3 3 1 1"></path>
                      <path d="m18 22 4-4"></path>
                      <path d="m2 6 4-4"></path>
                      <path d="m3 10 7-7"></path>
                      <path d="m14 21 7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-2xl leading-tight tracking-tight font-semibold text-white font-montserrat">
                  Вход в MargoFitness
                </h1>
                <p className="mt-2 text-sm font-normal text-white/70 font-montserrat">
                  Начни свою трансформацию
                </p>
              </div>

              {/* Form */}
              <form className="mt-2 space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-white/60 font-roboto">
                    Email
                  </label>
                  <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-orange-500/50 focus-within:ring-2">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" className="h-4 w-4 text-white/40">
                      <path fill="currentColor" d="M22 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0"></path>
                      <path fill="currentColor" d="M15.612 2.038C14.59 2 13.399 2 12 2C7.286 2 4.929 2 3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12c0-1.399 0-2.59-.038-3.612a4.5 4.5 0 0 1-6.35-6.35" opacity=".5"></path>
                      <path fill="currentColor" d="M3.465 20.536C4.929 22 7.286 22 12 22s7.072 0 8.536-1.465C21.893 19.179 21.993 17.056 22 13h-3.16c-.905 0-1.358 0-1.755.183c-.398.183-.693.527-1.282 1.214l-.605.706c-.59.687-.884 1.031-1.282 1.214s-.85.183-1.755.183h-.321c-.905 0-1.358 0-1.756-.183s-.692-.527-1.281-1.214l-.606-.706c-.589-.687-.883-1.031-1.281-1.214S6.066 13 5.16 13H2c.007 4.055.107 6.179 1.465 7.535"></path>
                    </svg>
                    <input 
                      id="email" 
                      type="email" 
                      placeholder="твоя@почта.ru" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ml-3 flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none font-roboto"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-white/60 font-roboto">
                      Пароль
                    </label>
                    <a href="#" className="text-xs font-medium text-white/60 hover:text-orange-400 transition font-roboto">
                      Забыли пароль?
                    </a>
                  </div>
                  <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 pl-3 pr-2 py-2.5 text-sm text-white transition-all focus-within:ring-orange-500/50 focus-within:ring-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-white/40" fill="currentColor">
                      <path d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity=".5"/>
                      <path d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/>
                    </svg>
                    <input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ml-3 flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none font-roboto"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-3 mr-[7px] w-[33px] h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition flex-shrink-0 -my-1"
                      style={{ willChange: 'background-color, color' }}
                      aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary button - Dashboard style */}
                <button 
                  type="submit" 
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 ring-1 ring-orange-400/50 px-4 py-2.5 transition-all hover:from-orange-500/30 hover:to-orange-600/30 hover:ring-orange-400/60 active:scale-95 mt-6"
                  style={{ touchAction: 'manipulation', willChange: 'transform' }}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white font-montserrat">Продолжить</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-orange-500/30 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-200">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <span className="font-medium font-roboto">ИЛИ</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>

                {/* Social buttons - Dashboard glassmorphism style */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Telegram */}
                  <button type="button" className="flex items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-400/30 px-2 py-3 text-xs font-medium transition-all hover:bg-blue-500/25 hover:ring-blue-400/40 active:scale-95 backdrop-blur" style={{ willChange: 'transform' }}>
                    <span className="sr-only">Telegram</span>
                    <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
                      <path d="M48 1.7004L40.4074 46.0017C40.4074 46.0017 39.345 49.0733 36.4267 47.6002L18.9084 32.0543L18.8272 32.0085C21.1935 29.5494 39.5429 10.4546 40.3449 9.58905C41.5863 8.24856 40.8156 7.45053 39.3742 8.46313L12.2698 28.3849L1.81298 24.3128C1.81298 24.3128 0.167387 23.6353 0.00907665 22.1622C-0.151317 20.6867 1.86714 19.8887 1.86714 19.8887L44.4963 0.533499C44.4963 0.533499 48 -1.2482 48 1.7004V1.7004Z" fill="#93C5FD"/>
                    </svg>
                  </button>

                  {/* Yandex */}
                  <button type="button" className="flex items-center justify-center rounded-xl bg-red-500/15 ring-1 ring-red-400/30 px-2 py-3 text-xs font-medium transition-all hover:bg-red-500/25 hover:ring-red-400/40 active:scale-95 backdrop-blur" style={{ willChange: 'transform' }}>
                    <span className="sr-only">Yandex</span>
                    <svg className="w-5 h-5" viewBox="0 0 73 73" fill="none" style={{ transform: 'scale(1.15)' }}>
                      <path d="M43.1721 16.4533H38.9343C31.1651 16.4533 27.0844 20.3516 27.0844 26.1205C27.0844 32.6694 29.9096 35.7098 35.7169 39.6081L40.5036 42.8045L26.6921 63.3083H16.4115L28.8108 44.9873C21.6694 39.9196 17.667 35.0083 17.667 26.6663C17.667 16.2197 24.9654 9.12499 38.8558 9.12499H52.6677V63.3083H43.1721V16.4533Z" fill="#FCA5A5"/>
                    </svg>
                  </button>

                  {/* VK */}
                  <button type="button" className="flex items-center justify-center rounded-xl bg-blue-600/15 ring-1 ring-blue-500/30 px-2 py-3 text-xs font-medium transition-all hover:bg-blue-600/25 hover:ring-blue-500/40 active:scale-95 backdrop-blur" style={{ willChange: 'transform' }}>
                    <span className="sr-only">ВКонтакте</span>
                    <svg className="w-5 h-5" viewBox="0 0 57 36" fill="none">
                      <path d="M31.0456 36C11.5709 36 0.462836 22.4865 0 0H9.75515C10.0756 16.5045 17.2673 23.4955 22.9638 24.9369V0H32.1493V14.2342C37.7745 13.6216 43.6846 7.13513 45.6783 0H54.8638C54.1125 3.70048 52.6149 7.20425 50.4647 10.2921C48.3145 13.38 45.5578 15.9856 42.3673 17.9459C45.9287 19.7371 49.0744 22.2724 51.5967 25.3845C54.119 28.4965 55.9606 32.1146 57 36H46.8888C45.9558 32.6253 44.0594 29.6044 41.4374 27.3158C38.8154 25.0273 35.5844 23.573 32.1493 23.1351V36H31.0456Z" fill="#93C5FD"/>
                    </svg>
                  </button>

                  {/* Google - оригинальные цвета */}
                  <button type="button" className="flex items-center justify-center rounded-xl bg-white/[0.08] ring-1 ring-white/20 px-2 py-3 text-xs font-medium transition-all hover:bg-white/[0.12] hover:ring-white/30 active:scale-95 backdrop-blur" style={{ willChange: 'transform' }}>
                    <span className="sr-only">Google</span>
                    <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M48 24.5456C48 22.8438 47.8442 21.2074 47.5547 19.6365H24.4898V28.9201H37.6697C37.102 31.9202 35.3766 34.462 32.7829 36.1638V42.1856H40.6976C45.3284 38.0074 48 31.8547 48 24.5456Z" fill="#4285F4"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M24.4888 48C31.1011 48 36.6447 45.8509 40.6966 42.1854L32.782 36.1636C30.589 37.6036 27.7838 38.4545 24.4888 38.4545C18.1103 38.4545 12.7114 34.2327 10.7856 28.5599H2.60382V34.7781C6.63351 42.6218 14.9155 48 24.4888 48Z" fill="#34A853"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M10.7867 28.5599C10.2969 27.1199 10.0186 25.5817 10.0186 23.9999C10.0186 22.4181 10.2969 20.8799 10.7867 19.4399V13.2217H2.60483C0.946197 16.4617 0 20.1272 0 23.9999C0 27.8726 0.946197 31.5381 2.60483 34.7781L10.7867 28.5599Z" fill="#FBBC05"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M24.4888 9.54549C28.0844 9.54549 31.3126 10.7564 33.8506 13.1346L40.8747 6.25093C36.6335 2.37819 31.0899 0 24.4888 0C14.9155 0 6.63351 5.3782 2.60382 13.2219L10.7856 19.4401C12.7114 13.7673 18.1103 9.54549 24.4888 9.54549Z" fill="#EA4335"/>
                    </svg>
                  </button>
                </div>

                {/* Subtext */}
                <p className="pt-2 text-xs leading-[1.5] text-white/50 text-center font-roboto">
                  Продолжая, вы соглашаетесь с{' '}
                  <a href="#" className="font-medium text-white/70 hover:text-orange-400 transition whitespace-nowrap">
                    Условиями
                  </a>
                  {' '}и{' '}
                  <a href="#" className="font-medium text-white/70 hover:text-orange-400 transition whitespace-nowrap">
                    Политикой
                  </a>
                </p>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

