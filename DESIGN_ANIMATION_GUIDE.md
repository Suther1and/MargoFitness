# 🎨 Гайд: Дизайн и Анимации для MargoFitness

> Технический гайд для создания оптимизированных страниц с анимациями для десктопа и мобильных устройств

## 📋 Содержание

1. [Структура компонента](#структура-компонента)
2. [Оптимизация шрифтов](#оптимизация-шрифтов)
3. [Анимации: синхронизация и производительность](#анимации-синхронизация-и-производительность)
4. [Мобильная оптимизация](#мобильная-оптимизация)
5. [Интерактивность кнопок](#интерактивность-кнопок)
6. [CSS стили и эффекты](#css-стили-и-эффекты)
7. [Чек-лист перед деплоем](#чек-лист-перед-деплоем)

---

## Структура компонента

### ✅ Правильный импорт и setup

```typescript
'use client'

import { Inter, Oswald } from 'next/font/google'
import { useEffect, useRef, useState, memo } from 'react'

// Только используемые шрифты с preload
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter', 
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true
})

const oswald = Oswald({ 
  subsets: ['latin'], 
  variable: '--font-oswald', 
  display: 'swap',
  fallback: ['Impact', 'system-ui'],
  preload: true
})
```

### ✅ Константы вне компонента

```typescript
// ❌ Плохо: внутри компонента (пересоздается каждый рендер)
export default function Page() {
  const tooltips = { ... }
}

// ✅ Хорошо: вне компонента
const TOOLTIPS = {
  key: { title: '...', description: '...' }
} as const

export default function Page() {
  // ...
}
```

### ✅ Оптимизация состояния

```typescript
// Используй только необходимые состояния
const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

// refs для элементов с анимациями
const progressRef = useRef<HTMLDivElement>(null)
const countRef = useRef<HTMLSpanElement>(null)
const cardsRef = useRef<(HTMLElement | null)[]>([])
```

---

## Оптимизация шрифтов

### ⚠️ Важно

- **НЕ загружай лишние шрифты** - каждый шрифт ~15-20KB
- Используй только те, которые реально применяются в дизайне
- Всегда добавляй `preload: true` и `fallback`

### ✅ Пример

```typescript
// Достаточно 2-3 шрифтов максимум
const inter = Inter({ preload: true, fallback: ['system-ui'] })
const oswald = Oswald({ preload: true, fallback: ['Impact'] })

// Применяй через CSS классы
<div className={`${inter.variable} ${oswald.variable}`}>
  <h1 className="font-oswald">Заголовок</h1>
  <p className="font-inter">Текст</p>
</div>
```

---

## Анимации: синхронизация и производительность

### 🎯 Главное правило

**Для синхронизации нескольких анимаций используй JS, а не CSS transitions**

### ✅ Правильная анимация прогресс бара + счетчика

```typescript
useEffect(() => {
  const isMobile = window.innerWidth < 1024
  const ANIMATION_DURATION = isMobile ? 1000 : 1500
  
  const animateElements = (
    progressBar: HTMLElement | null,
    counter: HTMLElement | null,
    targetPercent: number,
    targetValue: number,
    formatter?: (n: number) => string
  ) => {
    if (!progressBar || !counter) return
    
    const format = formatter || ((n: number) => Math.floor(n).toString())
    
    // Отключи CSS transitions
    progressBar.style.width = '0%'
    progressBar.style.transition = 'none'
    counter.textContent = '0'
    
    const startTime = performance.now()
    const frameInterval = isMobile ? 32 : 16 // 30fps на мобильных
    let lastFrameTime = startTime
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1)
      
      // Throttling для мобильных (но финальный кадр всегда)
      if (progress < 1 && currentTime - lastFrameTime < frameInterval) {
        requestAnimationFrame(animate)
        return
      }
      
      lastFrameTime = currentTime
      
      // ОДНА easing функция для обоих элементов
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      // Обновляй оба элемента с одной easing
      progressBar.style.width = `${targetPercent * easeProgress}%`
      counter.textContent = format(targetValue * easeProgress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Гарантируй финальные значения
        progressBar.style.width = `${targetPercent}%`
        counter.textContent = format(targetValue)
      }
    }
    
    requestAnimationFrame(animate)
  }
}, [])
```

### 📌 Ключевые моменты

1. **Одна easing функция** для всех синхронизированных элементов
2. **Один requestAnimationFrame цикл** для всех элементов
3. **Throttling на мобильных** (30fps вместо 60fps)
4. **Финальный кадр всегда выполняется** (для корректных значений)
5. **Отключай CSS transitions** если анимируешь через JS

### ✅ IntersectionObserver для триггера анимаций

```typescript
const observerOptions = {
  threshold: isMobile ? 0.05 : 0.2,
  rootMargin: '0px 0px -20px 0px'
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true
        animateElements(...)
        observer.disconnect() // Отключи после срабатывания
      }
    })
  },
  observerOptions
)

if (element) observer.observe(element)
```

---

## Мобильная оптимизация

### 🔥 Критично для производительности

### ✅ CSS медиа-запрос для мобильных

```css
@media (max-width: 1023px) {
  /* Скрой декоративные элементы (blur круги) */
  .absolute.rounded-full.blur-3xl {
    display: none !important;
  }
  
  /* Уменьши интенсивность blur */
  .backdrop-blur-xl, .backdrop-blur {
    backdrop-filter: blur(4px) !important;
  }
  
  /* Упрости shadows */
  [class*="shadow-2xl"], [class*="shadow-xl"] {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15) !important;
  }
  
  /* Отключи зацикленные анимации */
  .animate-shimmer,
  .animate-pulse-glow,
  .animate-ring-ripple,
  [style*="gradientShift"] {
    animation: none !important;
  }
  
  /* Отключи hover эффекты на touch устройствах */
  @media (hover: none) {
    button:hover {
      transform: none !important;
    }
  }
  
  /* Ускорь все transitions */
  * {
    transition-duration: 0.2s !important;
  }
}
```

### 📌 Что отключать на мобильных

**❌ Отключай:**
- Декоративные blur круги на фоне (огромная нагрузка на GPU)
- Зацикленные анимации (shimmer, pulse, gradient shift)
- Hover эффекты transform
- Сложные shadows

**✅ Оставляй:**
- Backdrop blur (но уменьши интенсивность до 4px)
- Active состояния кнопок (для feedback)
- Основные transitions (но сократи до 0.2s)
- Простые shadows

### ✅ Анимация появления карточек на мобильных

```typescript
// Для мобильных - простой fade без slide
if (isMobile) {
  card.classList.remove('card-hidden')
  void card.offsetHeight // Force reflow
  
  card.style.opacity = '0'
  card.style.visibility = 'visible'
  card.style.transform = 'translateY(0)'
  
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.4s ease'
    card.style.opacity = '1'
  })
} else {
  // Для десктопа - полноценная анимация
  card.classList.remove('card-hidden')
  card.classList.add('card-animate-desktop')
}
```

---

## Интерактивность кнопок

### ✅ Правильная структура кнопки

```tsx
<button 
  className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 
             ring-1 ring-orange-400/30 p-3 transition-all 
             hover:from-orange-500/15 hover:to-red-500/15 
             hover:ring-orange-400/40 active:scale-95"
  style={{ touchAction: 'manipulation' }}
>
  <div className="flex items-center justify-between pointer-events-none">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
        {/* Icon */}
      </div>
      <div className="text-left flex-1">
        <p className="text-sm font-medium text-white">Заголовок</p>
        <p className="text-xs text-white/60">Описание</p>
      </div>
    </div>
    <div className="rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs text-orange-200 flex-shrink-0">
      Открыть
    </div>
  </div>
</button>
```

### 📌 Ключевые моменты

1. **`touchAction: 'manipulation'`** - улучшает отзывчивость на мобильных
2. **`pointer-events-none`** на внутреннем div - предотвращает блокировку кликов
3. **`active:scale-95`** - визуальный feedback при нажатии
4. **`flex-shrink-0`** на иконках и бейджах - предотвращает сжатие
5. **НЕ используй вложенные анимированные span** внутри кнопок

### ✅ CSS для кнопок

```css
button {
  user-select: none;
  -webkit-tap-highlight-color: transparent; /* Убирает белое мерцание */
  touch-action: manipulation;
  cursor: pointer;
  position: relative;
  z-index: 1;
}
```

### ❌ Что НЕ делать

```tsx
{/* ❌ Плохо: анимированный span блокирует клики */}
<button>
  <span className="absolute inset-0 animate-shimmer pointer-events-none"></span>
  <span>Текст</span> {/* Клики не работают */}
</button>

{/* ✅ Хорошо: если нужен эффект, используй CSS pseudo-elements */}
<button className="relative overflow-hidden">
  Текст
</button>
```

---

## CSS стили и эффекты

### ✅ Keyframe анимации (только необходимые)

```css
/* Slide in from top */
@keyframes slideInFromTop {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale in */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Tooltip появление */
@keyframes tooltipIn {
  0% { opacity: 0; transform: translateY(-8px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Gradient shift (только для десктопа) */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### ✅ Utility классы

```css
/* Минимальный набор */
.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite !important;
}

.animate-ring-ripple {
  animation: ringRipple 2s ease-out infinite !important;
}

/* Не создавай десятки неиспользуемых utility классов */
```

### ✅ Плавный рендеринг

```css
* { 
  -webkit-font-smoothing: antialiased; 
  -moz-osx-font-smoothing: grayscale; 
}
```

---

## Чек-лист перед деплоем

### 📱 Тестирование на мобильных

- [ ] Все кнопки реагируют на **первый тап**
- [ ] Нет белого мерцания при нажатии
- [ ] Прогресс бары и счетчики **синхронизированы**
- [ ] Финальные значения анимаций **корректны**
- [ ] Карточки появляются (нет `card-hidden` без удаления)
- [ ] Телефон **не греется** при скролле/обновлениях
- [ ] Нет горизонтального скролла

### 💻 Тестирование на десктопе

- [ ] Анимации плавные и красивые
- [ ] Hover эффекты работают
- [ ] Tooltip появляются по клику
- [ ] Gradient shift работает (если есть)

### 🎨 Дизайн

- [ ] Backdrop blur работает (4px на мобильных, 8-12px на десктопе)
- [ ] Shadows не слишком тяжелые
- [ ] Декоративные blur круги **скрыты на мобильных**
- [ ] Шрифты загружаются быстро

### ⚡ Производительность

- [ ] Нет зацикленных анимаций на мобильных
- [ ] FPS throttling (30fps на мобильных)
- [ ] Passive event listeners где возможно
- [ ] Константы вынесены за пределы компонента
- [ ] Компоненты мемоизированы где нужно

### 📦 Код

- [ ] Нет неиспользуемых импортов
- [ ] Нет неиспользуемых состояний
- [ ] Нет лишних шрифтов
- [ ] CSS сжат и оптимизирован
- [ ] Нет дублирования логики

---

## 🎯 Шаблон компонента

```typescript
'use client'

import { Inter, Oswald } from 'next/font/google'
import { useEffect, useRef, useState, memo } from 'react'

// Fonts
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter', 
  display: 'swap',
  fallback: ['system-ui'],
  preload: true
})

const oswald = Oswald({ 
  subsets: ['latin'], 
  variable: '--font-oswald', 
  display: 'swap',
  fallback: ['Impact', 'system-ui'],
  preload: true
})

// Constants outside component
const CONFIG = {
  // your constants
} as const

export default function Page() {
  // Refs
  const elementRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  
  // State (минимум)
  const [active, setActive] = useState<string | null>(null)
  
  // Animations effect
  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    const DURATION = isMobile ? 1000 : 1500
    
    // Animation logic here
    
    return () => {
      // Cleanup
    }
  }, [])
  
  // Event handlers effect
  useEffect(() => {
    if (window.innerWidth < 1024) return // Skip on mobile if not needed
    
    const handleEvent = (e: Event) => {
      // Handle event
    }
    
    document.addEventListener('event', handleEvent, { passive: true })
    return () => document.removeEventListener('event', handleEvent)
  }, [])
  
  return (
    <>
      <style jsx global>{`
        /* Your styles */
        
        @media (max-width: 1023px) {
          /* Mobile optimizations */
        }
      `}</style>
      
      <div className={`${inter.variable} ${oswald.variable}`}>
        {/* Your content */}
      </div>
    </>
  )
}
```

---

## 📚 Дополнительные ресурсы

### Референсы
- Готовая страница: `app/design-test/dashboard/page.tsx`
- История оптимизаций: Git commits в ветке `feature/advanced-animations`

### Полезные паттерны
- **IntersectionObserver** для lazy анимаций
- **requestAnimationFrame** для плавных анимаций
- **Throttling** для оптимизации на мобильных
- **memo** для предотвращения лишних ре-рендеров

---

## ⚠️ Частые ошибки

1. **Разные easing функции** для синхронизированных анимаций
   - ❌ CSS transition + JS animation с разными easing
   - ✅ Одна JS анимация с одной easing для всех элементов

2. **Pointer-events на кнопках**
   - ❌ `pointer-events: none` на самой кнопке
   - ✅ `pointer-events: none` только на внутренних декоративных элементах

3. **Финальные значения анимаций**
   - ❌ Throttling блокирует последний кадр
   - ✅ Финальный кадр всегда выполняется + гарантия через else блок

4. **Зацикленные анимации на мобильных**
   - ❌ Shimmer, pulse, gradient shift работают постоянно
   - ✅ Отключены через CSS медиа-запрос

5. **Лишние шрифты**
   - ❌ Загружаем 3-4 шрифта, используем 2
   - ✅ Загружаем только то, что используем

---

**Создано:** 27.12.2024  
**Версия:** 1.0  
**Основано на:** `app/design-test/dashboard/page.tsx`

