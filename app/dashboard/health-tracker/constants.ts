// Константы для Health Tracker

// Цветовые схемы для разных статусов
export const COLORS = {
  // Статус выполнения цели
  goal: {
    achieved: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      glow: 'bg-emerald-500/10',
      gradient: 'from-emerald-500/15 via-emerald-400/20 to-emerald-500/15',
    },
    inProgress: {
      text: 'text-white',
      bg: 'bg-white/5',
      border: 'border-white/10',
      glow: 'bg-white/5',
    },
  },
  
  // Цвета для специфичных метрик
  water: {
    primary: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'bg-blue-600/15',
    gradient: 'from-blue-600/15 via-blue-500/20 to-blue-600/15',
  },
  
  steps: {
    primary: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'bg-orange-500/5',
  },
  
  weight: {
    primary: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  
  sleep: {
    primary: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    glow: 'bg-indigo-500/10',
  },
  
  caffeine: {
    primary: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    overLimit: {
      primary: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  },
  
  nutrition: {
    primary: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'bg-violet-500/10',
  },
} as const

// Размеры и отступы
export const SIZES = {
  card: {
    borderRadius: 'rounded-[2rem]',
    borderRadiusLarge: 'rounded-[2.5rem]',
    padding: 'px-6 pt-4 pb-6',
    paddingCompact: 'p-4',
  },
  
  button: {
    small: 'w-9 h-9',
    medium: 'w-10 h-10',
    icon: 'w-3.5 h-3.5',
    iconMedium: 'w-4 h-4',
  },
  
  icon: {
    badge: 'w-3.5 h-3.5',
    header: 'w-4 h-4',
    large: 'w-5 h-5',
  },
  
  progressRing: {
    small: 'w-[90px] h-[90px]',
    medium: 'w-[120px] h-[120px]',
    large: 'w-[125px] h-[125px]',
  },
} as const

// Конфигурации анимаций
export const ANIMATIONS = {
  // Анимация появления Trophy
  trophy: {
    initial: { scale: 0, rotate: -45 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  
  // Анимация появления иконок
  icon: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  
  // Анимация кнопок
  button: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },
  
  buttonLarge: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
  },
  
  // Анимация прогресс-бара
  progressBar: {
    initial: { width: 0 },
    transition: { type: 'spring', stiffness: 50, damping: 15 },
  },
  
  // Анимация числового значения
  valueChange: {
    initial: { y: 5, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -5, opacity: 0 },
  },
  
  // Пульсация свечения для достигнутой цели
  glowPulse: {
    animate: { 
      scale: [1, 1.1, 1], 
      opacity: [0.15, 0.3, 0.15] 
    },
    transition: { duration: 2, repeat: Infinity },
  },
} as const

// Общие стили для карточек
export const CARD_STYLES = {
  base: 'relative group overflow-hidden border transition-all duration-700 backdrop-blur-2xl',
  background: 'bg-zinc-900/50',
  hover: 'hover:border-white/10',
} as const

// Типографика
export const TYPOGRAPHY = {
  label: {
    small: 'text-[8px] font-bold uppercase tracking-widest',
    medium: 'text-[9px] font-black uppercase tracking-wider',
    large: 'text-[10px] font-black uppercase tracking-[0.2em]',
  },
  
  value: {
    small: 'text-2xl font-black font-oswald',
    medium: 'text-3xl font-black font-oswald',
    large: 'text-4xl font-black font-oswald tracking-tighter',
    xlarge: 'text-5xl font-black font-oswald tracking-tighter',
  },
} as const

// Настройки для прогресс-колец
export const PROGRESS_RING = {
  small: {
    radius: 38,
    circumference: 238.7,
    strokeWidth: 9,
  },
  medium: {
    radius: 44,
    circumference: 276.5,
    strokeWidth: 8,
  },
} as const

