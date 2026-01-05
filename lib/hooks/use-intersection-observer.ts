'use client'

import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
        }
      },
      {
        rootMargin: '200px', // Начинаем рендер заранее
        threshold: 0,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref, isVisible, hasBeenVisible }
}

