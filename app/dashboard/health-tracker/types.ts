export type MoodRating = 1 | 2 | 3 | 4 | 5;

export interface DailyHabit {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
  category: "morning" | "afternoon" | "evening" | "anytime";
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
