'use client'

import { motion } from 'framer-motion'
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
  const isDisabled = processing || disabled

  // Текст кнопки в зависимости от действия
  const getButtonText = () => {
    if (processing) return 'Перенаправление...'
    if (action === 'renewal') return `Продлить за ${finalPrice.toLocaleString('ru-RU')} ₽`
    if (action === 'upgrade') return `Обновить за ${finalPrice.toLocaleString('ru-RU')} ₽`
    return `Оплатить ${finalPrice.toLocaleString('ru-RU')} ₽`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      {/* Сообщение об ошибке */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-500/10 ring-1 ring-red-400/30 p-4 text-sm text-red-300 flex items-start gap-3"
        >
          <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Hero Кнопка */}
      <motion.button
        onClick={onClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={`group relative w-full rounded-2xl p-6 ring-1 transition-all duration-300 overflow-hidden ${
          isDisabled
            ? 'bg-white/5 ring-white/10 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 ring-orange-400/30 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40'
        }`}
      >
        {/* Shine эффект */}
        {!isDisabled && (
          <motion.div
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}

        {/* Pulse эффект на фоне при hover */}
        {!isDisabled && (
          <motion.div
            className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300"
          />
        )}

        {/* Контент кнопки */}
        <div className="relative flex items-center justify-center gap-3">
          {processing ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-white" />
              <span className="font-bold text-white text-xl font-oswald uppercase tracking-wide">
                {getButtonText()}
              </span>
            </>
          ) : (
            <>
              <motion.span 
                key={finalPrice}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="font-bold text-white text-xl md:text-2xl font-oswald uppercase tracking-wide"
              >
                {getButtonText()}
              </motion.span>
              {!isDisabled && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="h-6 w-6 text-white" strokeWidth={2.5} />
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.button>

      {/* Компактная надпись о безопасности на мобильных */}
      <div className="lg:hidden flex items-center justify-center gap-2 text-xs text-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
        </svg>
        <span>Безопасная оплата через ЮКасса</span>
      </div>

      {/* Дополнительная информация под кнопкой - только desktop */}
      <p className="hidden lg:block text-center text-xs text-white/40">
        Нажимая кнопку, вы соглашаетесь с{' '}
        <a href="#" className="text-white/60 hover:text-orange-400 transition-colors underline">
          условиями использования
        </a>
      </p>
    </motion.div>
  )
}

