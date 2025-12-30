"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleLogout = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Анимация перед редиректом
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
      
      // Редирект после анимации
      setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    }

    handleLogout()
  }, [])

  return (
    <>
      <style jsx global>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        @keyframes spinFade {
          0% {
            transform: rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.3;
          }
        }
        
        .logout-fade-out {
          animation: fadeOut 0.4s ease-out forwards;
        }
        
        .spinner-ring {
          animation: spinFade 1s linear infinite;
        }
      `}</style>
      
      <div 
        className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)' }}
      >
        {/* Background blur circles */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        {/* Card */}
        <div className={`relative w-full max-w-md p-8 overflow-hidden rounded-3xl bg-[#1a1a24]/80 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl ${!isLoading ? 'logout-fade-out' : ''}`}>
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
          
          {/* Inner card */}
          <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-8 ring-1 ring-white/10 backdrop-blur relative">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/20">
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </div>
                </div>
                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-400/50 spinner-ring" style={{ animation: 'spinFade 1s linear infinite' }} />
              </div>
            </div>
            
            {/* Text */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-white mb-2">
                Выход из системы
              </h1>
              <p className="text-sm text-white/60">
                До скорых встреч!
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-6 w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
                style={{
                  animation: 'progressBar 1.2s ease-out forwards',
                  transformOrigin: 'left'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progressBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </>
  )
}

