export type MoodRating = 1 | 2 | 3 | 4 | 5;

// Типы для настроек трекера
export type WidgetId = 'habits' | 'water' | 'steps' | 'weight' | 'caffeine' | 'sleep' | 'mood' | 'nutrition' | 'photos' | 'notes';

// Типы для статистики
export type StatsView = 'overall' | 'habits' | WidgetId;

export type PeriodType = '7d' | '30d' | '6m' | '1y' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

// Типы для моковых данных статистики
export interface DayMetrics {
  water?: number;
  steps?: number;
  sleep?: number;
  sleepQuality?: number;
  caffeine?: number;
  weight?: number;
  energy?: number;
  mood?: MoodRating;
  calories?: number;
  protein?: number;
  fats?: number;
  carbs?: number;
}

export interface NoteWithContext {
  id: string;
  date: string;
  content: string;
  mood?: MoodRating;
  dayMetrics: DayMetrics;
}

export interface PhotoEntry {
  id: string;
  date: string;
  url: string;
  weight: number;
}

export interface WidgetSettings {
  enabled: boolean;
  goal: number | null;
  inDailyPlan: boolean;
}

export interface UserParameters {
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
}

export interface TrackerSettings {
  widgets: Record<WidgetId, WidgetSettings>;
  userParams: UserParameters;
}

export interface WidgetConfig {
  id: WidgetId;
  name: string;
  icon: string;
  hasGoal: boolean;
  goalUnit?: string;
  goalLabel?: string;
  goalPlaceholder?: string;
  description?: string;
}

export const WIDGET_CONFIGS: Record<WidgetId, WidgetConfig> = {
  habits: {
    id: 'habits',
    name: 'Привычки',
    icon: 'flame',
    hasGoal: false,
    description: 'Отслеживай выполнение ежедневных привычек'
  },
  water: {
    id: 'water',
    name: 'Вода',
    icon: 'droplet',
    hasGoal: true,
    goalUnit: 'мл',
    goalLabel: 'Цель по воде',
    goalPlaceholder: 'Например: 2000',
    description: 'Отслеживай потребление воды'
  },
  steps: {
    id: 'steps',
    name: 'Шаги',
    icon: 'footprints',
    hasGoal: true,
    goalUnit: 'шагов',
    goalLabel: 'Цель по шагам',
    goalPlaceholder: 'Например: 10000',
    description: 'Считай шаги за день'
  },
  weight: {
    id: 'weight',
    name: 'Вес',
    icon: 'scale',
    hasGoal: true,
    goalUnit: 'кг',
    goalLabel: 'Целевой вес',
    goalPlaceholder: 'Например: 70',
    description: 'Отслеживай изменения веса'
  },
  caffeine: {
    id: 'caffeine',
    name: 'Кофеин',
    icon: 'coffee',
    hasGoal: true,
    goalUnit: 'чашек',
    goalLabel: 'Лимит кофеина',
    goalPlaceholder: 'Например: 3',
    description: 'Контролируй потребление кофе'
  },
  sleep: {
    id: 'sleep',
    name: 'Сон',
    icon: 'moon',
    hasGoal: true,
    goalUnit: 'часов',
    goalLabel: 'Цель по сну',
    goalPlaceholder: 'Например: 8',
    description: 'Отслеживай качество сна'
  },
  mood: {
    id: 'mood',
    name: 'Настроение',
    icon: 'smile',
    hasGoal: false,
    description: 'Фиксируй эмоции и энергию'
  },
  nutrition: {
    id: 'nutrition',
    name: 'Питание',
    icon: 'utensils',
    hasGoal: true,
    goalUnit: 'ккал',
    goalLabel: 'Цель по калориям',
    goalPlaceholder: 'Например: 2000',
    description: 'Отслеживай потребление калорий'
  },
  photos: {
    id: 'photos',
    name: 'Фотоотчеты',
    icon: 'camera',
    hasGoal: false,
    description: 'Добавляй фото своего прогресса'
  },
  notes: {
    id: 'notes',
    name: 'Заметки',
    icon: 'notebook-text',
    hasGoal: false,
    description: 'Записывай мысли и наблюдения'
  }
};

export interface DailyHabit {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
  category: "morning" | "afternoon" | "evening" | "anytime";
}

// Типы для управления привычками в настройках
export type HabitFrequency = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type HabitTime = 'anytime' | 'morning' | 'afternoon' | 'evening'

export interface Habit {
  id: string
  title: string
  frequency: HabitFrequency
  time: HabitTime
  enabled: boolean
  streak: number
  createdAt: string
}

export const HABIT_FREQUENCY_OPTIONS: Record<number, string> = {
  1: 'Раз в неделю',
  2: '2 раза в неделю',
  3: '3 раза в неделю',
  4: '4 раза в неделю',
  5: '5 раз в неделю',
  6: '6 раз в неделю',
  7: 'Каждый день'
}

export const HABIT_TIME_OPTIONS: Record<HabitTime, string> = {
  anytime: 'Любое время',
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер'
}

export interface DailyMetrics {
  date: Date;
  // Основные метрики
  waterIntake: number; // в мл
  waterGoal: number; // в мл
  steps: number;
  stepsGoal: number;
  weight: number; // в кг
  weightGoal?: number;
  sleepHours: number;
  sleepGoal: number;
  
  // Состояние
  mood: MoodRating | null;
  energyLevel: number; // 1-10
  
  // Питание
  calories: number;
  caloriesGoal: number;
  foodQuality: number | null; // 1-5

  // Дополнительно
  caffeineIntake: number; // порции/чашки
  caffeineGoal: number;
  notes: string;
  dailyPhotos: string[]; // URL миниатюр
  
  // Параметры пользователя
  height?: number; // см
  age?: number;
  gender?: 'male' | 'female';
  
  habits: DailyHabit[];
}

export const MOCK_DATA: DailyMetrics = {
  date: new Date(),
  waterIntake: 1250,
  waterGoal: 2500,
  steps: 6430,
  stepsGoal: 10000,
  weight: 72.4,
  weightGoal: 70.0,
  sleepHours: 7.5,
  sleepGoal: 8.0,
  mood: 4,
  energyLevel: 7,
  calories: 1850,
  caloriesGoal: 2200,
  caffeineIntake: 2,
  caffeineGoal: 3,
  notes: "",
  dailyPhotos: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop"
  ],
  foodQuality: 4,
  height: 170,
  age: 28,
  gender: 'female',
  habits: [] // Привычки теперь берутся из настроек через useHabits()
}

// MOCK_DATA теперь пустой - все данные загружаются из Supabase;

// Типы для агрегированной статистики обзора
export interface OverviewStats {
  weight: {
    start: number
    current: number
    change: number
    period: string
  } | null
  habits: {
    completionRate: number
    bestStreak: number
    habitName: string
  } | null
  steps: {
    average: number
    goal: number
    percentage: number
    daysWithData: number
  } | null
  water: {
    average: number
    goal: number
    percentage: number
    daysWithData: number
  } | null
  caffeine: {
    average: number
    daysWithData: number
  } | null
  sleep: {
    average: number
    goal: number
    percentage: number
    daysWithData: number
  } | null
  nutrition: {
    avgCalories: number
    avgQuality: number | null
    goal: number
  } | null
  mood: {
    avgMood: number | null
    avgEnergy: number | null
  } | null
  notes: {
    content: string
    date: string
    metricsSnapshot: any
  } | null
  photos: {
    count: number
  } | null
}