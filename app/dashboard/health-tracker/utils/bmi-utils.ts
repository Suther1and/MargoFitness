export interface CalorieNorms {
  maintain: number;
  loss: number;
  gain: number;
}

export const calculateBMI = (height: number | null, weight: number | null): string | null => {
  if (!height || !weight) return null;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { 
    label: 'Дефицит веса', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-400',
    description: 'Твой вес ниже нормы. Рекомендуется проконсультироваться с врачом для коррекции питания.' 
  };
  if (bmi < 25) return { 
    label: 'Норма', 
    color: 'text-green-400', 
    bgColor: 'bg-green-400',
    description: 'Поздравляю! Твой вес находится в идеальном диапазоне для твоего роста.' 
  };
  if (bmi < 30) return { 
    label: 'Лишний вес', 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-400',
    description: 'Твой вес немного выше нормы. Это может быть поводом обратить внимание на активность и питание.' 
  };
  return { 
    label: 'Ожирение', 
    color: 'text-red-400', 
    bgColor: 'bg-red-400',
    description: 'Твой ИМТ указывает на избыточный вес. Рекомендуется обсудить план действий со специалистом.' 
  };
};

export const calculateCalorieNorms = (
  weight: number | null, 
  height: number | null, 
  age: number | null
): CalorieNorms | null => {
  if (!weight || !height || !age) return null;

  // Формула Миффлина-Сан Жеора для женщин (по умолчанию)
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  
  const maintain = Math.round(bmr * 1.375); // Умеренная активность
  return {
    loss: Math.round(maintain * 0.8),
    maintain,
    gain: Math.round(maintain * 1.1)
  };
};

