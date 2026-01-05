'use client'

import { useState, useEffect, useMemo } from 'react'
import { Transition } from 'framer-motion'
import { TRANSITIONS, GPU_STYLES, SPRING_CONFIG } from '@/lib/utils/animation-config'

/**
 * Хук для адаптивных анимаций с оптимизацией под mobile/desktop
 * 
 * @example
 * const { isMobile, getTransition, gpuStyles } = useResponsiveAnimation()
 * 
 * <motion.div
 *   style={gpuStyles}
 *   transition={getTransition('expansion')}
 * />
 */
export function useResponsiveAnimation() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Начальная проверка
    checkMobile()

    // Слушаем изменения размера окна
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  /**
   * Получить оптимизированный transition config для типа анимации
   */
  const getTransition = useMemo(() => {
    return (
      type: 'dialog' | 'tab' | 'expansion' | 'card' | 'layout' | 'stagger',
      options?: { index?: number }
    ): Transition => {
      if (!mounted) {
        // SSR fallback - используем desktop параметры
        if (type === 'stagger') {
          return TRANSITIONS.stagger(false, options?.index ?? 0)
        }
        return TRANSITIONS[type](false, options?.index)
      }

      if (type === 'stagger') {
        return TRANSITIONS.stagger(isMobile, options?.index ?? 0)
      }

      return TRANSITIONS[type](isMobile, options?.index)
    }
  }, [isMobile, mounted])

  /**
   * GPU acceleration стили для применения к анимируемым элементам
   */
  const gpuStyles = useMemo(() => GPU_STYLES, [])

  /**
   * Spring config для использования в MotionConfig
   */
  const springConfig = useMemo(() => SPRING_CONFIG, [])

  /**
   * Утилита для проверки готовности (mounted)
   */
  const isReady = mounted

  return {
    isMobile,
    isReady,
    getTransition,
    gpuStyles,
    springConfig,
  }
}

/**
 * Упрощенный хук только для определения мобильного устройства
 * Используйте когда не нужны дополнительные утилиты
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}

