'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ReferralProcessor() {
  const isProcessing = useRef(false)
  
  useEffect(() => {
    const supabase = createClient()
    
    const processReferral = async (userId: string, refCode: string, retryCount = 0) => {
      if (isProcessing.current) return
      isProcessing.current = true
      
      try {
        console.log(`[ReferralProcessor] Processing referral (attempt ${retryCount + 1}):`, { userId, refCode })
        
        const response = await fetch('/api/auth/process-referral-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refCode })
        })

        const data = await response.json()
        console.log('[ReferralProcessor] API Response:', data)

        // Удаляем код только при успехе или если он уже был обработан/недействителен
        if (data.success || data.error === 'Already registered' || data.error === 'Invalid referral code') {
          localStorage.removeItem('pending_referral_code')
          localStorage.removeItem('referral_code_expiry')
          
          if (data.success && !data.message?.includes('Already registered')) {
            console.log('[ReferralProcessor] Success! Showing toast...')
            // Показываем toast...
            // (оставляем старый код toast)
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
            document.body.appendChild(toast)
            requestAnimationFrame(() => {
              toast.style.opacity = '1'
              toast.style.transform = 'translateX(0)'
            })
            setTimeout(() => {
              toast.style.opacity = '0'
              toast.style.transform = 'translateX(1rem)'
              setTimeout(() => toast.remove(), 500)
            }, 5000)
          }
        } else if (retryCount < 3) {
          // Если произошла временная ошибка, пробуем еще раз через 3 секунды
          isProcessing.current = false
          setTimeout(() => processReferral(userId, refCode, retryCount + 1), 3000)
        }
      } catch (error) {
        console.error('[ReferralProcessor] Request failed:', error)
        if (retryCount < 3) {
          isProcessing.current = false
          setTimeout(() => processReferral(userId, refCode, retryCount + 1), 3000)
        }
      } finally {
        isProcessing.current = false
      }
    }

    // 1. Проверяем текущую сессию при монтировании
    supabase.auth.getUser().then(({ data: { user } }) => {
      const refCode = localStorage.getItem('pending_referral_code')
      if (user && refCode) {
        processReferral(user.id, refCode)
      }
    })

    // 2. Слушаем изменения состояния авторизации (для входа/регистрации без перезагрузки)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ReferralProcessor] Auth event:', event)
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const refCode = localStorage.getItem('pending_referral_code')
        if (refCode) {
          processReferral(session.user.id, refCode)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}

