'use client'

import { useState, useEffect } from 'react'
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react'

interface PaymentCTAButtonProps {
  finalPrice: number
  processing: boolean
  disabled?: boolean
  error?: string
  onClick: () => void
  action?: 'renewal' | 'upgrade'
}

export function PaymentCTAButton({ 
  finalPrice, 
  processing, 
  disabled = false,
  error,
  onClick,
  action
}: PaymentCTAButtonProps) {
  const [isMobile, setIsMobile] = useState(false)
  const isDisabled = processing || disabled

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  // Текст кнопки в зависимости от действия
  const getButtonText = () => {
    if (processing) return 'Перенаправление...'
    if (action === 'renewal') return 'Продлить подписку'
    if (action === 'upgrade') return 'Обновить тариф'
    return 'Оплатить программу'
  }

  return (
    <>
      <style jsx>{`
        .cta-button {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .cta-button:not(:disabled) {
          background: linear-gradient(90deg, #f97316, #ef4444, #f97316) !important;
          background-size: 200% auto !important;
          animation: gradient-flow 3s linear infinite !important;
        }
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .cta-button:active:not(:disabled) {
          transform: scale(0.96);
        }
        .error-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .shine-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: skewX(-25deg);
          animation: shine 6s infinite !important;
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        @media (max-width: 1023px) {
          .cta-button {
            transition-duration: 0.2s;
          }
          .shine-effect {
            display: block !important;
          }
        }
      `}</style>

      <div className="space-y-3">
        {error && (
          <div className="error-shake rounded-xl bg-red-500/10 ring-1 ring-red-400/30 p-4 text-sm text-red-300 flex items-start gap-3">
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`cta-button group relative w-full rounded-2xl ${isMobile ? 'p-4' : 'p-6'} ring-1 overflow-hidden ${
            isDisabled
              ? 'bg-white/5 ring-white/10 cursor-not-allowed text-white/20'
              : 'ring-orange-400/30 shadow-xl shadow-orange-500/25 text-white hover:brightness-110'
          }`}
        >
          {/* Shine эффект */}
          {!isDisabled && <div className="shine-effect pointer-events-none" />}

          <div className="relative flex items-center justify-center gap-3 pointer-events-none">
            {processing ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />
                <span className="font-bold text-xl font-oswald uppercase tracking-wide">
                  {getButtonText()}
                </span>
              </>
            ) : (
              <>
                <span className="font-bold text-xl md:text-2xl font-oswald uppercase tracking-wide">
                  {getButtonText()}
                </span>
                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/20">
                  <span className="font-bold text-xl md:text-2xl font-oswald whitespace-nowrap">
                    {finalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                  <div className={isMobile ? '' : 'group-hover:translate-x-1 transition-transform'}>
                    <ArrowRight className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                </div>
              </>
            )}
          </div>
        </button>

        <div className="lg:hidden flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Безопасная оплата через ЮКасса</span>
        </div>

        <p className="hidden lg:block text-center text-[10px] text-white/20 uppercase tracking-widest">
          Нажимая кнопку, вы соглашаетесь с{' '}
          <a href="#" className="text-white/40 hover:text-orange-400 transition-colors underline">
            условиями использования
          </a>
        </p>
      </div>
    </>
  )
}
