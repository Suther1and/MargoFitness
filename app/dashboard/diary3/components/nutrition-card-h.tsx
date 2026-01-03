'use client'

import { Utensils, Info, Salad, Soup, Pizza, Hamburger, Apple, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [mealInput, setMealInput] = useState('')

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
    { rating: 1, icon: Hamburger, label: 'Тяжелая еда', color: 'text-red-400' },
    { rating: 2, icon: Pizza, label: 'Фастфуд', color: 'text-orange-400' },
    { rating: 3, icon: Soup, label: 'Домашняя еда', color: 'text-yellow-400' },
    { rating: 4, icon: Apple, label: 'Здоровое', color: 'text-emerald-400' },
    { rating: 5, icon: Salad, label: 'Суперфуд', color: 'text-pink-400' },
  ]

  const calPerc = Math.min((calories / caloriesGoal) * 100, 100)

  const handleAddMeal = () => {
    const val = parseInt(mealInput)
    if (val) {
      onUpdate('calories', calories + val)
      setMealInput('')
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl p-6 hover:border-violet-500/20 transition-all duration-500 h-[210px]">
      {/* Background Ambient */}
      <div className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
      
      <div className="flex gap-8 h-full items-center">
        {/* Левая часть: Кольцо калорий */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-[130px] h-[130px] flex-shrink-0 flex items-center justify-center group cursor-pointer" onClick={() => setIsEditing(true)}>
            <svg className="w-full h-full -rotate-90 relative overflow-visible" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="stroke-white/5" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50" cy="50" r="44"
                className="stroke-violet-500"
                style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.3))' }}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "276.5", strokeDashoffset: "276.5" }}
                animate={{ strokeDashoffset: 276.5 - (276.5 * calPerc) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
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
                  <span className="text-4xl font-black text-white font-oswald leading-none">{calories}</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2">ккал</span>
                </>
              )}
            </div>
          </div>

          {/* Кнопка быстрого добавления */}
          <div className="relative flex items-center gap-1 bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1 group/input focus-within:border-violet-500/40 transition-all">
            <input 
              type="number"
              placeholder="Добавить..."
              className="w-16 bg-transparent text-[11px] font-bold text-white outline-none placeholder:text-white/20"
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMeal()}
            />
            <button 
              onClick={handleAddMeal}
              className="p-1 rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500/40 transition-colors"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Правая часть: ИМТ, Нормы и Качество */}
        <div className="flex-1 flex flex-col justify-between h-full py-1">
          {/* Верх: ИМТ и Нормы */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Info className="w-3 h-3 text-white/20" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">ИМТ</span>
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
                <div className="flex items-center gap-1.5">
                    {[
                      { label: 'Сброс', val: norms.loss, color: 'text-emerald-400' },
                      { label: 'Норма', val: norms.maintain, color: 'text-violet-400' },
                      { label: 'Набор', val: norms.gain, color: 'text-orange-400' }
                    ].map((n, i) => (
                      <div key={n.label} className="flex items-center gap-1.5">
                        <button 
                          onClick={() => onUpdate('caloriesGoal', n.val)} 
                          className={cn(
                            "flex flex-col items-center px-2 py-1 rounded-lg transition-all",
                            caloriesGoal === n.val ? "bg-white/10 border border-white/10" : "hover:bg-white/5 border border-transparent"
                          )}
                        >
                            <span className={cn("text-[13px] font-black font-oswald transition-colors", caloriesGoal === n.val ? n.color : "text-white/30")}>{n.val}</span>
                            <span className="text-[7px] text-white/20 uppercase font-bold">{n.label}</span>
                        </button>
                        {i < 2 && <div className="w-px h-4 bg-white/5" />}
                      </div>
                    ))}
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
                    <span className={cn("text-[9px] font-bold uppercase", foodItems.find(i => i.rating === foodQuality)?.color)}>
                        {foodItems.find(i => i.rating === foodQuality)?.label}
                    </span>
                )}
            </div>
            
            <div className="flex gap-1">
              {foodItems.map((item) => {
                const isActive = foodQuality === item.rating
                return (
                  <button
                    key={item.rating}
                    onClick={() => onUpdate('foodQuality', item.rating)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center",
                      isActive 
                        ? "bg-white/10 border-white/20 scale-105 shadow-lg" 
                        : "bg-white/5 border-white/5 opacity-30 hover:opacity-100 hover:bg-white/[0.07]"
                    )}
                  >
                    <item.icon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? item.color : "text-white"
                    )} />
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

