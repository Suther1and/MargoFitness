'use client'

import { Utensils, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface NutritionCardHProps {
  calories: number
  caloriesGoal: number
  foodQuality: number | null
  weight: number
  height?: number
  age?: number
  gender?: 'male' | 'female'
  onUpdate: (metric: string, val: any) => void
}

export function NutritionCardH({
  calories,
  caloriesGoal,
  foodQuality,
  weight,
  height = 170,
  age = 25,
  gender = 'female',
  onUpdate
}: NutritionCardHProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Расчет ИМТ
  const bmi = useMemo(() => {
    if (!height || !weight) return 0
    const heightM = height / 100
    return parseFloat((weight / (heightM * heightM)).toFixed(1))
  }, [weight, height])

  const bmiCategory = useMemo(() => {
    if (bmi < 18.5) return { label: 'Дефицит', color: 'text-blue-400' }
    if (bmi < 25) return { label: 'Норма', color: 'text-emerald-400' }
    if (bmi < 30) return { label: 'Избыток', color: 'text-yellow-400' }
    return { label: 'Ожирение', color: 'text-red-400' }
  }, [bmi])

  // Расчет норм калорий (Mifflin-St Jeor)
  const norms = useMemo(() => {
    const bmr = gender === 'female' 
      ? (10 * weight) + (6.25 * height) - (5 * age) - 161
      : (10 * weight) + (6.25 * height) - (5 * age) + 5
    
    const maintain = Math.round(bmr * 1.375) // Умеренная активность
    return {
      loss: Math.round(maintain * 0.8),
      maintain,
      gain: Math.round(maintain * 1.1)
    }
  }, [weight, height, age, gender])

  const foodItems = [
    { rating: 1, emoji: '🍔', label: 'Тяжелая еда' },
    { rating: 2, emoji: '🍕', label: 'Фастфуд' },
    { rating: 3, emoji: '🍲', label: 'Домашняя еда' },
    { rating: 4, emoji: '🥗', label: 'Здоровое' },
    { rating: 5, emoji: '🥦', label: 'Суперфуд' },
  ]

  const calPerc = Math.min((calories / caloriesGoal) * 100, 100)

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl p-6 hover:border-violet-500/20 transition-all duration-500 h-[210px]">
      {/* Background Ambient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-[50px] -z-10" />
      
      <div className="flex gap-8 h-full items-center">
        {/* Левая часть: Кольцо калорий */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center group cursor-pointer" onClick={() => setIsEditing(true)}>
          <svg className="w-full h-full -rotate-90">
            <circle cx="72" cy="72" r="62" className="stroke-white/5" strokeWidth="10" fill="none" />
            <motion.circle
              cx="72" cy="72" r="62"
              className="stroke-violet-500"
              style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.3))' }}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "390", strokeDashoffset: "390" }}
              animate={{ strokeDashoffset: 390 - (390 * calPerc) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isEditing ? (
              <input 
                autoFocus
                type="number"
                className="w-20 bg-transparent text-center text-3xl font-black text-white font-oswald outline-none"
                value={calories}
                onChange={(e) => onUpdate('calories', parseInt(e.target.value) || 0)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              />
            ) : (
              <>
                <span className="text-3xl font-black text-white font-oswald leading-none">{calories}</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">ккал</span>
                <div className="mt-2 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                    <span className="text-[8px] font-bold text-violet-400 uppercase">цель {caloriesGoal}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Правая часть: ИМТ, Нормы и Качество */}
        <div className="flex-1 flex flex-col justify-between h-full py-1">
          {/* Верх: ИМТ и Нормы */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Info className="w-3 h-3 text-white/20" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Индекс массы</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-oswald">{bmi}</span>
                <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5", bmiCategory.color)}>
                  {bmiCategory.label}
                </span>
              </div>
            </div>

            <div className="space-y-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Суточные нормы</span>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-400/80">{norms.loss}</span>
                        <span className="text-[7px] text-white/20 uppercase">Сброс</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-violet-400/80">{norms.maintain}</span>
                        <span className="text-[7px] text-white/20 uppercase">Норма</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-orange-400/80">{norms.gain}</span>
                        <span className="text-[7px] text-white/20 uppercase">Набор</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Низ: Выбор качества еды */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-violet-500/10">
                        <Utensils className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Качество питания</span>
                </div>
                {foodQuality && (
                    <span className="text-[9px] font-bold text-violet-400/60 uppercase">
                        {foodItems.find(i => i.rating === foodQuality)?.label}
                    </span>
                )}
            </div>
            
            <div className="flex gap-2">
              {foodItems.map((item) => {
                const isActive = foodQuality === item.rating
                return (
                  <button
                    key={item.rating}
                    onClick={() => onUpdate('foodQuality', item.rating)}
                    className={cn(
                      "flex-1 py-2 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1",
                      isActive 
                        ? "bg-violet-500/10 border-violet-500/30 scale-105 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                        : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.07]"
                    )}
                  >
                    <span className={cn(
                        "text-xl transition-transform duration-300",
                        isActive ? "scale-110" : "grayscale"
                    )}>
                        {item.emoji}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

