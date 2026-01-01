/**
 * Анимирует элемент с fade out/in эффектом
 */
export function animateElement(element: HTMLElement | null, newValue?: string): void {
  if (!element) return
  
  element.style.transition = 'all 0.2s ease-in'
  element.style.opacity = '0'
  element.style.filter = 'blur(4px)'
  element.style.transform = 'translateY(5px)'
  
  setTimeout(() => {
    if (newValue !== undefined) {
      element.innerText = newValue
    }
    element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    element.style.opacity = '1'
    element.style.filter = 'blur(0px)'
    element.style.transform = 'translateY(0)'
  }, 250)
}

/**
 * Анимирует появление элемента (для перечеркнутых цен)
 */
export function animateOriginalPriceAppearance(element: HTMLElement | null, value: string): void {
  if (!element) return
  
  const container = element.parentElement
  if (!container) return
  
  // Показываем контейнер и элемент
  container.style.visibility = 'visible'
  container.style.height = 'auto'
  container.style.overflow = 'visible'
  element.style.display = 'inline'
  
  // Устанавливаем начальное состояние элемента
  element.innerText = value
  element.style.opacity = '0'
  element.style.filter = 'blur(8px)'
  element.style.transform = 'translateY(-15px)'
  
  // Анимируем появление с задержкой
  setTimeout(() => {
    element.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    element.style.opacity = '1'
    element.style.filter = 'blur(0px)'
    element.style.transform = 'translateY(0)'
  }, 250)
}

/**
 * Скрывает элемент мгновенно (для перечеркнутых цен)
 */
export function hideOriginalPrice(element: HTMLElement | null): void {
  if (!element) return
  
  const container = element.parentElement
  if (!container) return
  
  // Мгновенно скрываем
  container.style.visibility = 'hidden'
  container.style.height = '0'
  element.style.opacity = '0'
}

