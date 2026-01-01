// Фиксированная цветовая схема для всего проекта
export const colors = {
  background: '#0C0C11',
  backgroundGradient: 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)',
  primary: '#f97316',
  primaryLight: '#fb923c',
  secondary: '#ea580c',
  accent: '#fbbf24',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  navbarBg: 'rgba(255, 255, 255, 0.08)',
  blurColor1: 'rgba(249, 115, 22, 0.1)',
  blurColor2: 'rgba(168, 85, 247, 0.1)',
} as const

export type ColorScheme = typeof colors

