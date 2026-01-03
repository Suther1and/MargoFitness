'use client'

import { ANIMATIONS } from '../constants'

/**
 * Хук для получения готовых анимационных конфигураций
 */
export function useMetricAnimations() {
  return {
    trophy: ANIMATIONS.trophy,
    icon: ANIMATIONS.icon,
    button: ANIMATIONS.button,
    buttonLarge: ANIMATIONS.buttonLarge,
    progressBar: ANIMATIONS.progressBar,
    valueChange: ANIMATIONS.valueChange,
    glowPulse: ANIMATIONS.glowPulse,
  }
}

