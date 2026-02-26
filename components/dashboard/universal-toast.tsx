'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle 
} from 'lucide-react'
import { Toast } from '@/types/toast'
import { Achievement } from '@/types/database'
import { useToast } from '@/contexts/toast-context'

interface ToastStyles {
  bg: string
  border: string
  iconBg: string
  icon: React.ReactNode
  titleColor: string
  progressBg: string
}

function getToastStyles(type: Toast['type'], customIcon?: string | React.ReactNode): ToastStyles {
  switch (type) {
    case 'achievement':
      return {
        bg: 'bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20',
        border: 'border-amber-500/30',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
        icon: customIcon || <Trophy className="w-5 h-5 text-white" />,
        titleColor: 'text-amber-400',
        progressBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      }
    case 'success':
      return {
        bg: 'bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20',
        border: 'border-green-500/30',
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
        icon: <CheckCircle className="w-5 h-5 text-white" />,
        titleColor: 'text-green-400',
        progressBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      }
    case 'error':
      return {
        bg: 'bg-gradient-to-br from-red-500/20 via-rose-500/20 to-pink-500/20',
        border: 'border-red-500/30',
        iconBg: 'bg-gradient-to-br from-red-500 to-rose-500',
        icon: <AlertCircle className="w-5 h-5 text-white" />,
        titleColor: 'text-red-400',
        progressBg: 'bg-gradient-to-r from-red-500 to-rose-500',
      }
    case 'info':
      return {
        bg: 'bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
        icon: <Info className="w-5 h-5 text-white" />,
        titleColor: 'text-blue-400',
        progressBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      }
    case 'warning':
      return {
        bg: 'bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20',
        border: 'border-yellow-500/30',
        iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
        icon: <AlertTriangle className="w-5 h-5 text-white" />,
        titleColor: 'text-yellow-400',
        progressBg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      }
  }
}

interface UniversalToastProps {
  toast: Toast
}

export function UniversalToast({ toast }: UniversalToastProps) {
  const { dismissToast } = useToast()
  const styles = getToastStyles(toast.type, toast.icon)
  const achievement = toast.data as Achievement | undefined
  const duration = toast.duration || 5000

  const handleClose = () => {
    dismissToast(toast.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className="w-full max-w-sm mb-3"
    >
      <div
        className={`relative overflow-hidden rounded-2xl ${styles.bg} border ${styles.border} backdrop-blur-xl shadow-2xl`}
      >
        {/* Animated Background */}
        {toast.type === 'achievement' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" />
            {/* Sparkles Animation for achievements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Sparkles className="absolute top-2 left-2 w-4 h-4 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute top-4 right-4 w-3 h-3 text-amber-400 animate-pulse delay-100" />
              <Sparkles className="absolute bottom-3 left-4 w-3 h-3 text-orange-400 animate-pulse delay-200" />
            </div>
          </>
        )}

        <div className="relative p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: toast.type === 'achievement' ? -180 : 0 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shadow-lg`}
            >
              {typeof toast.icon === 'string' ? (
                <span className="text-2xl">{toast.icon}</span>
              ) : (
                styles.icon
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black ${styles.titleColor} uppercase tracking-widest`}>
                    {toast.title}
                  </span>
                </div>
                <h4 className="font-bold text-white mb-0.5 text-sm leading-tight">
                  {toast.message}
                </h4>
                
                {/* Achievement specific - description */}
                {achievement && achievement.description && (
                  <p className="text-xs text-white/70 leading-tight line-clamp-2 mt-1">
                    {achievement.description}
                  </p>
                )}

                {/* Achievement reward */}
                {achievement && achievement.reward_amount && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25,
                      delay: 0.3,
                    }}
                    className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-amber-500/30 border border-amber-500/40 rounded-lg"
                  >
                    <span className="text-xs font-black text-amber-300">
                      +{achievement.reward_amount}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-1 ${styles.progressBg} origin-left`}
        />
      </div>
    </motion.div>
  )
}

/**
 * Toast Container - рендерит все активные тосты
 */
export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] pointer-events-none">
      <div className="flex flex-col-reverse items-end pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <UniversalToast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
