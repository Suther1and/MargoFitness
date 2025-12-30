'use client'

import { useEffect } from 'react'
import { validateReferralCode } from '@/lib/actions/referrals'

/**
 * Компонент для перехвата реферальных кодов из URL
 * Работает на всех страницах, сохраняет код в localStorage на 30 дней
 */
export function ReferralCodeCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refCode = params.get('ref')
    
    if (!refCode) return
    
    // Сохраняем код с датой истечения (30 дней)
    const expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000)
    localStorage.setItem('pending_referral_code', refCode)
    localStorage.setItem('referral_code_expiry', expiryDate.toString())
    
    console.log('[ReferralCodeCapture] Код сохранен:', {
      refCode,
      expiryDate: new Date(expiryDate).toISOString(),
      inLocalStorage: localStorage.getItem('pending_referral_code')
    })
    
    // Показываем toast только один раз за сессию
    const toastShown = sessionStorage.getItem('referral_toast_shown')
    if (toastShown) return
    
    // Валидируем код и показываем уведомление с задержкой
    validateReferralCode(refCode).then(async (result) => {
      if (result.success && result.data) {
        // Проверяем авторизацию
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        // Ждем загрузки страницы
        setTimeout(() => {
          // Создаем toast уведомление
          const toast = document.createElement('div')
          toast.className = 'absolute top-4 right-8 xl:right-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl shadow-2xl z-[100] max-w-sm opacity-0 transition-all duration-500 ease-out translate-x-4'
          toast.style.backdropFilter = 'blur(10px)'
          toast.style.border = '1px solid rgba(255, 255, 255, 0.2)'
          
          const userName = result.data?.userName || 'Кто-то'
          
          // Разный текст для авторизованных и неавторизованных
          if (user) {
            toast.innerHTML = `
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5">Реферальная ссылка</div>
                  <div class="text-xs opacity-90">Работает только для новых пользователей!</div>
                </div>
              </div>
            `
          } else {
            toast.innerHTML = `
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"></polyline>
                    <rect x="2" y="7" width="20" height="5"></rect>
                    <line x1="12" y1="22" x2="12" y2="7"></line>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5">${userName} пригласил вас!</div>
                  <div class="text-xs opacity-90">+250 шагов при регистрации</div>
                </div>
              </div>
            `
          }
          
          // Вставляем в контентный контейнер
          const contentContainer = document.querySelector('main') || document.body
          contentContainer.appendChild(toast)
          
          // Плавное появление
          requestAnimationFrame(() => {
            setTimeout(() => {
              toast.style.opacity = '1'
              toast.style.transform = 'translateX(0)'
            }, 50)
          })
          
          // Удаляем через 6 секунд
          setTimeout(() => {
            toast.style.opacity = '0'
            toast.style.transform = 'translateX(1rem)'
            setTimeout(() => toast.remove(), 500)
          }, 6000)
          
          // Отмечаем что показали в этой сессии
          sessionStorage.setItem('referral_toast_shown', 'true')
        }, 800) // Задержка 800мс для загрузки страницы
      }
    }).catch((error) => {
      console.error('Error validating referral code:', error)
    })
  }, [])
  
  return null
}

