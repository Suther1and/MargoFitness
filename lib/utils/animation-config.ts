/**
 * Централизованная конфигурация анимаций для проекта
 * Оптимизирована для мобильных устройств с GPU acceleration
 */

import { Transition } from 'framer-motion'

// Оптимальные spring параметры для плавных анимаций
export const SPRING_CONFIG = {
  stiffness: 260,
  damping: 30,
  mass: 1,
}

// Тайминги для разных типов устройств
export const ANIMATION_DURATION = {
  mobile: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.4,
  },
  desktop: {
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
  },
}

// Easing функции
export const EASING = {
  smooth: [0.16, 1, 0.3, 1] as const, // Cubic bezier для плавных переходов
  sharp: [0.4, 0, 0.2, 1] as const,
  ease: [0.25, 0.1, 0.25, 1] as const,
}

// GPU acceleration стили
export const GPU_STYLES = {
  transform: 'translateZ(0)',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
}

/**
 * Готовые конфигурации transition для разных типов анимаций
 */
export const TRANSITIONS = {
  // Для диалогов и модальных окон
  dialog: (isMobile: boolean, index?: number): Transition => ({
    duration: isMobile ? ANIMATION_DURATION.mobile.normal : ANIMATION_DURATION.desktop.normal,
    ease: EASING.smooth,
  }),

  // Для переключения табов
  tab: (isMobile: boolean, index?: number): Transition => ({
    type: 'spring',
    stiffness: SPRING_CONFIG.stiffness,
    damping: SPRING_CONFIG.damping,
    mass: SPRING_CONFIG.mass,
  }),

  // Для раскрытия/скрытия (expansion/collapse)
  expansion: (isMobile: boolean, index?: number): Transition => ({
    duration: isMobile ? ANIMATION_DURATION.mobile.normal : ANIMATION_DURATION.desktop.fast,
    ease: EASING.smooth,
  }),

  // Для карточек (enter/exit)
  card: (isMobile: boolean, index?: number): Transition => ({
    duration: isMobile ? ANIMATION_DURATION.mobile.fast : ANIMATION_DURATION.desktop.fast,
    ease: EASING.smooth,
  }),

  // Для layout анимаций (shared layout)
  layout: (isMobile: boolean, index?: number): Transition => ({
    type: 'spring',
    stiffness: SPRING_CONFIG.stiffness,
    damping: SPRING_CONFIG.damping,
    mass: SPRING_CONFIG.mass,
  }),

  // Для списков с stagger эффектом
  stagger: (isMobile: boolean, index: number): Transition => ({
    duration: isMobile ? ANIMATION_DURATION.mobile.fast : ANIMATION_DURATION.desktop.fast,
    ease: EASING.smooth,
    delay: index * (isMobile ? 0.05 : 0.03),
  }),
}

/**
 * Варианты анимаций для часто используемых паттернов
 */
export const ANIMATION_VARIANTS = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Scale in/out (для модалок)
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  // Slide from top
  slideTop: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Slide from bottom
  slideBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Slide from left
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
}

/**
 * Утилита для определения мобильного устройства на клиенте
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

