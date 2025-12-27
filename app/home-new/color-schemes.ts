export type ColorScheme = {
  id: string
  name: string
  isDark: boolean
  colors: {
    background: string
    backgroundGradient: string
    primary: string
    primaryLight: string
    secondary: string
    accent: string
    textPrimary: string
    textSecondary: string
    cardBg: string
    cardBorder: string
    navbarBg: string
    blurColor1: string
    blurColor2: string
  }
}

export const colorSchemes: ColorScheme[] = [
  {
    id: 'original',
    name: 'Original',
    isDark: true,
    colors: {
      background: '#0a0a0f',
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
    }
  }
]

export const getColorScheme = (id: string): ColorScheme => {
  return colorSchemes.find(scheme => scheme.id === id) || colorSchemes[0]
}
