'use client'

import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Проверка при монтировании
    checkMobile()

    // Проверка при изменении размера окна
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

