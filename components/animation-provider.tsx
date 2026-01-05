'use client'

import { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { SPRING_CONFIG } from '@/lib/utils/animation-config'

interface AnimationProviderProps {
  children: ReactNode
}

/**
 * Глобальный провайдер анимаций с оптимизированными настройками
 * Применяет GPU acceleration и единый spring config для всех анимаций
 */
export function AnimationProvider({ children }: AnimationProviderProps) {
  return (
    <MotionConfig 
      reducedMotion="never" 
      transition={{
        type: 'spring',
        stiffness: SPRING_CONFIG.stiffness,
        damping: SPRING_CONFIG.damping,
        mass: SPRING_CONFIG.mass,
      }}
    >
      {children}
    </MotionConfig>
  )
}

