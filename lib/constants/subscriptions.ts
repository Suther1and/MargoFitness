import type { SubscriptionTier } from '@/types/database'

export type SubscriptionLevel = 'FREE' | 'BASIC' | 'PRO' | 'ELITE';

export const WIDGET_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  basic: 6,
  pro: 8,
  elite: 8,
}

export const HABIT_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  basic: 6,
  pro: 10,
  elite: 15,
}

export interface SubscriptionBenefit {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionLevel;
  name: string;
  benefits: SubscriptionBenefit[];
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionLevel, SubscriptionPlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Базовый доступ для ознакомления',
    benefits: [
      { text: 'Демо-тренировка', included: true },
      { text: 'Несколько демо-статей', included: true },
      { text: 'Демо-интенсив', included: true },
      { text: '1 виджет в трекере', included: true },
      { text: '1 привычка для отслеживания', included: true },
      { text: 'Статистика и аналитика', included: false },
      { text: 'Telegram коммьюнити', included: true }, // Пока доступно всем
    ],
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    description: 'Оптимальный старт для регулярных тренировок',
    benefits: [
      { text: '2 тренировки в неделю', included: true },
      { text: 'Расширенная библиотека статей', included: true },
      { text: '6 виджетов в трекере', included: true },
      { text: '6 привычек для отслеживания', included: true },
      { text: 'Статистика и аналитика', included: true },
      { text: 'Telegram коммьюнити', included: true },
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'Максимальный результат и глубокая аналитика',
    benefits: [
      { text: '3 тренировки в неделю', included: true },
      { text: 'Полный доступ к статьям', included: true },
      { text: '8 из 8 виджетов в трекере', included: true },
      { text: '10 привычек для отслеживания', included: true },
      { text: 'Полная статистика и аналитика', included: true },
      { text: 'Telegram коммьюнити', included: true },
    ],
  },
  ELITE: {
    id: 'ELITE',
    name: 'Elite',
    description: 'Персональный подход и полное сопровождение',
    benefits: [
      { text: '3 тренировки в неделю', included: true },
      { text: '15 привычек для отслеживания', included: true },
      { text: 'Индивидуальное ведение', included: true, highlight: true },
      { text: 'Индивидуальный план питания', included: true, highlight: true },
      { text: 'Прямая связь с Марго', included: true, highlight: true },
      { text: 'Telegram коммьюнити', included: true },
    ],
  },
};
