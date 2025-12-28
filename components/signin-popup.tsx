"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { OAuthButtons } from "@/components/oauth-buttons"

interface SignInPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 border-0 bg-transparent overflow-visible">
        <DialogTitle className="sr-only">Вход в MargoFitness</DialogTitle>
        <div className="w-full max-w-5xl mt-8 mr-auto mb-8 ml-auto relative">
          {/* Outer circuit-style nodes with motivational words */}
          <div className="pointer-events-none hidden md:block absolute top-0 right-0 bottom-0 left-0 z-0">
            {/* Left upper node */}
            <div className="absolute left-4 top-1/4 flex items-center gap-2 text-neutral-700">
              <div className="h-px flex-1 bg-neutral-800 translate-x-2"></div>
              <div className="relative h-9 px-4 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-medium text-orange-500">Сила</span>
                <span className="absolute -left-1 h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.65)] animate-pulse"></span>
              </div>
              <div className="h-px w-12 bg-neutral-800"></div>
            </div>

            {/* Left bottom node */}
            <div className="absolute left-10 bottom-10 flex items-center gap-2 text-neutral-700">
              <div className="h-px flex-1 bg-neutral-800 translate-x-2"></div>
              <div className="relative h-9 px-4 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-medium text-orange-500">Энергия</span>
                <span className="absolute -left-1 h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.65)] animate-pulse"></span>
              </div>
              <div className="h-px w-16 bg-neutral-800"></div>
            </div>

            {/* Right upper node */}
            <div className="absolute right-4 top-1/5 flex items-center gap-2 text-neutral-700">
              <div className="h-px w-16 bg-neutral-800"></div>
              <div className="relative h-9 px-4 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-medium text-orange-500">Результат</span>
                <span className="absolute -right-1 h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.65)] animate-pulse"></span>
              </div>
              <div className="h-px flex-1 bg-neutral-800 -translate-x-2"></div>
            </div>

            {/* Right bottom node */}
            <div className="absolute right-8 bottom-16 flex items-center gap-2 text-neutral-700">
              <div className="h-px w-10 bg-neutral-800"></div>
              <div className="relative h-9 px-4 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-medium text-orange-500">Победа</span>
                <span className="absolute -right-1 h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.65)] animate-pulse"></span>
              </div>
              <div className="h-px flex-1 bg-neutral-800 -translate-x-2"></div>
            </div>
          </div>

          {/* Card */}
          <div className="sm:px-10 sm:py-10 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 max-w-md border-neutral-800 border rounded-3xl mr-auto ml-auto pt-8 pr-6 pb-8 pl-6 relative shadow-xl z-10">
            {/* Top glow dots */}
            <div className="absolute left-10 top-5 hidden h-1.5 w-16 rounded-full bg-neutral-700/60 sm:block"></div>
            <div className="absolute right-10 top-5 hidden h-1.5 w-10 rounded-full bg-neutral-700/30 sm:block"></div>

            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex bg-neutral-900 w-14 h-14 rounded-2xl relative shadow-[0_0_0_1px_rgba(82,82,91,0.7)] items-center justify-center">
                <div className="flex bg-neutral-950 w-10 h-10 rounded-2xl relative items-center justify-center">
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
            <div className="mt-6 text-center">
              <h1 className="text-[22px] leading-tight tracking-tight font-semibold text-neutral-50 font-montserrat">
                Вход в MargoFitness
              </h1>
              <p className="mt-2 text-sm font-normal text-neutral-400 font-montserrat">
                Войдите или создайте новый аккаунт
              </p>
            </div>

            {/* Form */}
            <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-400 font-roboto">
                  Email
                </label>
                <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2.5 text-sm text-neutral-100 shadow-inner shadow-black/40 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/70">
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500">
                    <path fill="currentColor" d="M22 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0"></path>
                    <path fill="currentColor" d="M15.612 2.038C14.59 2 13.399 2 12 2C7.286 2 4.929 2 3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12c0-1.399 0-2.59-.038-3.612a4.5 4.5 0 0 1-6.35-6.35" opacity=".5"></path>
                    <path fill="currentColor" d="M3.465 20.536C4.929 22 7.286 22 12 22s7.072 0 8.536-1.465C21.893 19.179 21.993 17.056 22 13h-3.16c-.905 0-1.358 0-1.755.183c-.398.183-.693.527-1.282 1.214l-.605.706c-.59.687-.884 1.031-1.282 1.214s-.85.183-1.755.183h-.321c-.905 0-1.358 0-1.756-.183s-.692-.527-1.281-1.214l-.606-.706c-.589-.687-.883-1.031-1.281-1.214S6.066 13 5.16 13H2c.007 4.055.107 6.179 1.465 7.535"></path>
                  </svg>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ml-3 flex-1 bg-transparent text-sm font-normal text-neutral-100 placeholder:text-neutral-600 focus:outline-none font-roboto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-400 font-roboto">
                    Пароль
                  </label>
                  <a href="#" className="text-xs font-medium text-neutral-400 hover:text-neutral-100 font-roboto">
                    Забыли?
                  </a>
                </div>
                <div className="flex shadow-black/40 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/70 text-sm text-neutral-100 bg-neutral-950/60 border-neutral-800 border rounded-xl pt-2.5 pr-3 pb-2.5 pl-3 shadow-inner items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-neutral-500" fill="currentColor">
                    <path d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity=".5"/>
                    <path d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/>
                  </svg>
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ml-3 flex-1 bg-transparent text-sm font-normal text-neutral-100 placeholder:text-neutral-600 focus:outline-none font-roboto"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 rounded-full px-2 py-1 text-[11px] font-medium text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-100 transition font-roboto"
                  >
                    {showPassword ? 'Скрыть' : 'Показать'}
                  </button>
                </div>
              </div>

              {/* Primary button */}
              <button 
                type="submit" 
                className="mt-2 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/80 font-montserrat"
                style={{
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  boxShadow: '0 14px 35px rgba(249, 115, 22, 0.55)'
                }}
              >
                Продолжить
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="h-px flex-1 bg-neutral-800/80"></div>
                <span className="font-medium font-roboto">ИЛИ</span>
                <div className="h-px flex-1 bg-neutral-800/80"></div>
              </div>

              {/* Social buttons - 4 штуки: Telegram, Yandex, VK, Google */}
              <div className="grid grid-cols-4 gap-3">
                {/* Telegram */}
                <button type="button" className="flex items-center justify-center rounded-xl border-0 px-2 py-2.5 text-xs font-medium hover:opacity-80 transition" style={{ background: '#27A6E5' }}>
                  <span className="sr-only">Telegram</span>
                  <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
                    <path d="M48 1.7004L40.4074 46.0017C40.4074 46.0017 39.345 49.0733 36.4267 47.6002L18.9084 32.0543L18.8272 32.0085C21.1935 29.5494 39.5429 10.4546 40.3449 9.58905C41.5863 8.24856 40.8156 7.45053 39.3742 8.46313L12.2698 28.3849L1.81298 24.3128C1.81298 24.3128 0.167387 23.6353 0.00907665 22.1622C-0.151317 20.6867 1.86714 19.8887 1.86714 19.8887L44.4963 0.533499C44.4963 0.533499 48 -1.2482 48 1.7004V1.7004Z" fill="#FEFEFE"/>
                  </svg>
                </button>

                {/* Yandex */}
                <button type="button" className="flex items-center justify-center rounded-xl border-0 px-2 py-2.5 text-xs font-medium hover:opacity-80 transition" style={{ background: '#FB3F1C' }}>
                  <span className="sr-only">Yandex</span>
                  <svg className="w-6 h-6" viewBox="0 0 73 73" fill="none" style={{ transform: 'scale(1.15)' }}>
                    <path d="M43.1721 16.4533H38.9343C31.1651 16.4533 27.0844 20.3516 27.0844 26.1205C27.0844 32.6694 29.9096 35.7098 35.7169 39.6081L40.5036 42.8045L26.6921 63.3083H16.4115L28.8108 44.9873C21.6694 39.9196 17.667 35.0083 17.667 26.6663C17.667 16.2197 24.9654 9.12499 38.8558 9.12499H52.6677V63.3083H43.1721V16.4533Z" fill="white"/>
                  </svg>
                </button>

                {/* VK */}
                <button type="button" className="flex items-center justify-center rounded-xl border-0 px-2 py-2.5 text-xs font-medium hover:opacity-80 transition" style={{ background: '#0077FF' }}>
                  <span className="sr-only">ВКонтакте</span>
                  <svg className="w-6 h-6" viewBox="0 0 57 36" fill="none">
                    <path d="M31.0456 36C11.5709 36 0.462836 22.4865 0 0H9.75515C10.0756 16.5045 17.2673 23.4955 22.9638 24.9369V0H32.1493V14.2342C37.7745 13.6216 43.6846 7.13513 45.6783 0H54.8638C54.1125 3.70048 52.6149 7.20425 50.4647 10.2921C48.3145 13.38 45.5578 15.9856 42.3673 17.9459C45.9287 19.7371 49.0744 22.2724 51.5967 25.3845C54.119 28.4965 55.9606 32.1146 57 36H46.8888C45.9558 32.6253 44.0594 29.6044 41.4374 27.3158C38.8154 25.0273 35.5844 23.573 32.1493 23.1351V36H31.0456Z" fill="white"/>
                  </svg>
                </button>

                {/* Google */}
                <button type="button" className="flex items-center justify-center rounded-xl border-0 px-2 py-2.5 text-xs font-medium hover:opacity-80 transition" style={{ background: '#FFFFFF' }}>
                  <span className="sr-only">Google</span>
                  <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M48 24.5456C48 22.8438 47.8442 21.2074 47.5547 19.6365H24.4898V28.9201H37.6697C37.102 31.9202 35.3766 34.462 32.7829 36.1638V42.1856H40.6976C45.3284 38.0074 48 31.8547 48 24.5456Z" fill="#4285F4"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M24.4888 48C31.1011 48 36.6447 45.8509 40.6966 42.1854L32.782 36.1636C30.589 37.6036 27.7838 38.4545 24.4888 38.4545C18.1103 38.4545 12.7114 34.2327 10.7856 28.5599H2.60382V34.7781C6.63351 42.6218 14.9155 48 24.4888 48Z" fill="#34A853"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.7867 28.5599C10.2969 27.1199 10.0186 25.5817 10.0186 23.9999C10.0186 22.4181 10.2969 20.8799 10.7867 19.4399V13.2217H2.60483C0.946197 16.4617 0 20.1272 0 23.9999C0 27.8726 0.946197 31.5381 2.60483 34.7781L10.7867 28.5599Z" fill="#FBBC05"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M24.4888 9.54549C28.0844 9.54549 31.3126 10.7564 33.8506 13.1346L40.8747 6.25093C36.6335 2.37819 31.0899 0 24.4888 0C14.9155 0 6.63351 5.3782 2.60382 13.2219L10.7856 19.4401C12.7114 13.7673 18.1103 9.54549 24.4888 9.54549Z" fill="#EA4335"/>
                  </svg>
                </button>
              </div>

              {/* Subtext */}
              <p className="pt-3 text-xs leading-relaxed text-neutral-500 text-center font-roboto">
                Продолжая, вы соглашаетесь с{' '}
                <a href="#" className="font-medium text-neutral-200 hover:text-orange-500">
                  Условиями
                </a>
                {' '}и{' '}
                <a href="#" className="font-medium text-neutral-200 hover:text-orange-500">
                  Политикой
                </a>
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

