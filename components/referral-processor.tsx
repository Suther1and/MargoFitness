'use client'

import { useEffect } from 'react'

export function ReferralProcessor() {
  useEffect(() => {
    const processReferral = async () => {
      console.log('[Referral Processor] Component mounted')
      
      const refCode = localStorage.getItem('pending_referral_code')
      
      console.log('[Referral Processor] Checking localStorage:', { 
        refCode: refCode || 'NOT_FOUND',
        allKeys: Object.keys(localStorage)
      })
      
      if (!refCode) {
        console.log('[Referral Processor] No pending referral code found')
        return
      }

      console.log('[Referral Processor] ✅ Found pending referral code:', refCode)
      
      try {
        // Ждем чтобы сессия точно установилась
        console.log('[Referral Processor] Waiting 2 seconds for session...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('[Referral Processor] Sending request to API...')

        const response = await fetch('/api/auth/process-referral-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refCode })
        })

        console.log('[Referral Processor] API response status:', response.status)

        const data = await response.json()
        console.log('[Referral Processor] API response data:', data)

        if (data.success) {
          console.log('[Referral Processor] ✅ Referral processed successfully')
          localStorage.removeItem('pending_referral_code')
          
          // Показываем уведомление
          const toast = document.createElement('div')
          toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top'
          toast.innerHTML = '🎉 Бонус +250 шагов за регистрацию по приглашению!'
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 5000)
          
          // Обновляем страницу чтобы показать новый баланс
          window.location.reload()
        } else {
          console.error('[Referral Processor] Failed:', data.error)
          localStorage.removeItem('pending_referral_code')
        }
      } catch (error) {
        console.error('[Referral Processor] Error:', error)
        localStorage.removeItem('pending_referral_code')
      }
    }

    processReferral()
  }, [])

  return null
}

