'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Sparkles } from 'lucide-react'
import { Achievement } from '@/types/database'

interface AchievementUnlockedToastProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementUnlockedToast({
  achievement,
  onClose,
}: AchievementUnlockedToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)

      // Автозакрытие через 5 секунд
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [achievement])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Даем время на анимацию закрытия
  }

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="fixed top-4 right-4 z-[100] w-full max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/30 backdrop-blur-xl shadow-2xl">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" />
            
            {/* Sparkles Animation */}
            <div className="absolute inset-0 overflow-hidden">
              <Sparkles className="absolute top-2 left-2 w-4 h-4 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute top-4 right-4 w-3 h-3 text-amber-400 animate-pulse delay-100" />
              <Sparkles className="absolute bottom-3 left-4 w-3 h-3 text-orange-400 animate-pulse delay-200" />
            </div>

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="flex-shrink-0 w-14 h-14 flex items-center justify-center"
                >
                  {achievement.icon_url ? (
                    <img 
                      src={achievement.icon_url} 
                      alt={achievement.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{achievement.icon}</span>
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
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        Достижение получено!
                      </span>
                    </div>
                    <h4 className="font-bold text-white mb-1 text-sm leading-tight">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-white/70 leading-tight line-clamp-2">
                      {achievement.description}
                    </p>

                    {/* Reward */}
                    {achievement.reward_amount && (
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
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook для управления уведомлениями о достижениях
export function useAchievementNotifications() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [queue, setQueue] = useState<Achievement[]>([])

  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      setCurrentAchievement(queue[0])
      setQueue(prev => prev.slice(1))
    }
  }, [currentAchievement, queue])

  const showAchievement = (achievement: Achievement) => {
    if (currentAchievement) {
      // Добавляем в очередь, если уже показывается другое
      setQueue(prev => [...prev, achievement])
    } else {
      setCurrentAchievement(achievement)
    }
  }

  const clearCurrent = () => {
    setCurrentAchievement(null)
  }

  return {
    currentAchievement,
    showAchievement,
    clearCurrent,
  }
}

