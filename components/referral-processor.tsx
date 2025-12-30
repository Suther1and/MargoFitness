'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ReferralProcessor() {
  const router = useRouter()
  const isProcessing = useRef(false)
  
  useEffect(() => {
    const processReferral = async () => {
      // Защита от повторного запуска
      if (isProcessing.current) {
        console.log('[ReferralProcessor] Обработка уже запущена, пропускаем')
        return
      }
      
      const refCode = localStorage.getItem('pending_referral_code')
      
      console.log('[ReferralProcessor] Проверка кода:', {
        refCode,
        expiry: localStorage.getItem('referral_code_expiry'),
        hasCode: !!refCode
      })
      
      if (!refCode) {
        console.log('[ReferralProcessor] Код не найден, пропускаем')
        return
      }
      
      // Отмечаем что обработка запущена
      isProcessing.current = true
      
      console.log('[ReferralProcessor] Начинаем обработку кода:', refCode)
      
      // ВАЖНО: Удаляем код сразу, чтобы избежать повторной обработки
      localStorage.removeItem('pending_referral_code')
      localStorage.removeItem('referral_code_expiry')

      try {
        // Ждем установки сессии с проверкой (до 10 секунд)
        const supabase = createClient()
        let user = null
        let attempts = 0
        const maxAttempts = 10
        
        while (!user && attempts < maxAttempts) {
          attempts++
          console.log(`[ReferralProcessor] Проверка сессии, попытка ${attempts}/${maxAttempts}`)
          
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          
          if (currentUser) {
            user = currentUser
            console.log('[ReferralProcessor] Сессия установлена:', user.id)
            break
          }
          
          // Ждем 1 секунду перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        if (!user) {
          console.error('[ReferralProcessor] Не удалось установить сессию за 10 секунд, отмена')
          return
        }

        // Теперь отправляем запрос
        console.log('[ReferralProcessor] Отправляем запрос к API...')
        const response = await fetch('/api/auth/process-referral-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refCode })
        })

        const data = await response.json()
        
        console.log('[ReferralProcessor] Ответ API:', { response: response.status, data })

        if (data.success) {
          console.log('[ReferralProcessor] Успех! Бонус начислен')
          
          // Задержка для плавного появления после загрузки
          setTimeout(() => {
            const toast = document.createElement('div')
            toast.className = 'absolute top-4 right-8 xl:right-12 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl shadow-2xl z-[100] max-w-sm opacity-0 transition-all duration-500 ease-out translate-x-4'
            toast.style.backdropFilter = 'blur(10px)'
            toast.style.border = '1px solid rgba(255, 255, 255, 0.2)'
            toast.innerHTML = `
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5">Бонус начислен!</div>
                  <div class="text-xs opacity-90">+250 шагов</div>
                </div>
              </div>
            `
            
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
            
            // Удаляем toast через 5 секунд
            setTimeout(() => {
              toast.style.opacity = '0'
              toast.style.transform = 'translateX(1rem)'
              setTimeout(() => toast.remove(), 500)
            }, 5000)
          }, 300)
          
          // Не вызываем router.refresh() чтобы избежать мерцания диалога
          // Баланс обновится при следующей навигации пользователя
          console.log('[ReferralProcessor] Бонусы успешно начислены. Баланс обновится автоматически.')
        } else {
          console.error('[ReferralProcessor] Ошибка обработки:', data.error)
          // Код уже удалён в начале функции
        }
      } catch (error) {
        console.error('[ReferralProcessor] Ошибка запроса:', error)
        // Код уже удалён в начале функции
      } finally {
        // Сбрасываем флаг после завершения (успех или ошибка)
        isProcessing.current = false
      }
    }

    processReferral()
    
    // Cleanup function
    return () => {
      isProcessing.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

