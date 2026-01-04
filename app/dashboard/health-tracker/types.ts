export type MoodRating = 1 | 2 | 3 | 4 | 5;

// Типы для настроек трекера
export type WidgetId = 'water' | 'steps' | 'weight' | 'caffeine' | 'sleep' | 'mood' | 'nutrition' | 'photos' | 'notes';

export interface WidgetSettings {
  enabled: boolean;
  goal: number | null;
  inDailyPlan: boolean;
}

export interface UserParameters {
  height: number | null;
  weight: number | null;
  age: number | null;
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
  water: {
    id: 'water',
    name: 'Вода',
    icon: 'droplet',
    hasGoal: true,
    goalUnit: 'мл',
    goalLabel: 'Цель по воде',
    goalPlaceholder: 'Например: 2000',
    description: 'Отслеживайте потребление воды'
  },
  steps: {
    id: 'steps',
    name: 'Шаги',
    icon: 'footprints',
    hasGoal: true,
    goalUnit: 'шагов',
    goalLabel: 'Цель по шагам',
    goalPlaceholder: 'Например: 10000',
    description: 'Считайте шаги за день'
  },
  weight: {
    id: 'weight',
    name: 'Вес',
    icon: 'scale',
    hasGoal: true,
    goalUnit: 'кг',
    goalLabel: 'Целевой вес',
    goalPlaceholder: 'Например: 70',
    description: 'Отслеживайте изменения веса'
  },
  caffeine: {
    id: 'caffeine',
    name: 'Кофеин',
    icon: 'coffee',
    hasGoal: true,
    goalUnit: 'чашек',
    goalLabel: 'Лимит кофеина',
    goalPlaceholder: 'Например: 3',
    description: 'Контролируйте потребление кофеина'
  },
  sleep: {
    id: 'sleep',
    name: 'Сон',
    icon: 'moon',
    hasGoal: true,
    goalUnit: 'часов',
    goalLabel: 'Цель по сну',
    goalPlaceholder: 'Например: 8',
    description: 'Отслеживайте качество сна'
  },
  mood: {
    id: 'mood',
    name: 'Настроение',
    icon: 'smile',
    hasGoal: false,
    description: 'Фиксация эмоций и уровня энергии'
  },
  nutrition: {
    id: 'nutrition',
    name: 'Питание',
    icon: 'utensils',
    hasGoal: true,
    goalUnit: 'ккал',
    goalLabel: 'Цель по калориям',
    goalPlaceholder: 'Например: 2000',
    description: 'Отслеживайте КБЖУ'
  },
  photos: {
    id: 'photos',
    name: 'Фотоотчеты',
    icon: 'camera',
    hasGoal: false,
    description: 'Добавляйте фото своего прогресса'
  },
  notes: {
    id: 'notes',
    name: 'Заметки',
    icon: 'notebook-text',
    hasGoal: false,
    description: 'Записывайте важные мысли и наблюдения'
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
export type HabitFrequency = 'daily' | '2week' | '3week' | '4-5week'
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

export const HABIT_FREQUENCY_OPTIONS: Record<HabitFrequency, string> = {
  daily: 'Каждый день',
  '2week': '2 раза в неделю',
  '3week': '3 раза в неделю',
  '4-5week': '4-5 раз в неделю'
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
  sleepQuality: number; // 1-100
  
  // Состояние
  mood: MoodRating | null;
  energyLevel: number; // 1-10
  
  // КБЖУ
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  fats: number;
  fatsGoal: number;
  carbs: number;
  carbsGoal: number;

  // Дополнительно
  caffeineIntake: number; // порции/чашки
  caffeineGoal: number;
  notes: string;
  dailyPhotos: string[]; // URL миниатюр
  
  // Новые поля
  foodQuality: number | null; // 1-5
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
  sleepQuality: 85,
  mood: 4,
  energyLevel: 7,
  calories: 1850,
  caloriesGoal: 2200,
  protein: 120,
  proteinGoal: 150,
  fats: 65,
  fatsGoal: 70,
  carbs: 190,
  carbsGoal: 250,
  caffeineIntake: 2,
  caffeineGoal: 3,
  notes: "Сегодня отличная тренировка, чувствую прилив сил. Нужно больше пить воды вечером.",
  dailyPhotos: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop"
  ],
  foodQuality: 4,
  height: 170,
  age: 28,
  gender: 'female',
  habits: [
    { id: "1", title: "Креатин 5г", completed: true, streak: 12, category: "morning" },
    { id: "2", title: "Вакуум живота", completed: false, streak: 5, category: "morning" },
    { id: "3", title: "Чтение 20 мин", completed: false, streak: 3, category: "evening" },
    { id: "4", title: "Без сахара", completed: true, streak: 21, category: "anytime" },
  ]
};
