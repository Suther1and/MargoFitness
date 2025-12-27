'use client'

import React, { createContext, useContext } from 'react'
import { ColorScheme, colorSchemes } from './color-schemes'
import { fontPairs } from './font-pairs'

type ThemeContextType = {
  currentScheme: ColorScheme
  currentFont: typeof fontPairs[0]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Используем фиксированные значения
  const currentScheme = colorSchemes[0] // Original theme
  const currentFont = fontPairs[0] // Oswald + Montserrat + Roboto

  return (
    <ThemeContext.Provider value={{ currentScheme, currentFont }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
