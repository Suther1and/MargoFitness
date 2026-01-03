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
  waterIntake: number; // in ml
  waterGoal: number; // in ml
  sleepHours: number;
  sleepQuality: number; // 1-100
  weight: number; // in kg
  mood: MoodRating | null;
  energyLevel: number; // 1-10
  steps: number;
  stepsGoal: number;
  habits: DailyHabit[];
}

export const MOCK_DATA: DailyMetrics = {
  date: new Date(),
  waterIntake: 1250,
  waterGoal: 2500,
  sleepHours: 7.5,
  sleepQuality: 85,
  weight: 72.4,
  mood: 4,
  energyLevel: 7,
  steps: 6430,
  stepsGoal: 10000,
  habits: [
    { id: "1", title: "Креатин 5г", completed: true, streak: 12, category: "morning" },
    { id: "2", title: "Вакуум живота", completed: false, streak: 5, category: "morning" },
    { id: "3", title: "Чтение 20 мин", completed: false, streak: 3, category: "evening" },
    { id: "4", title: "Без сахара", completed: true, streak: 21, category: "anytime" },
  ]
};

