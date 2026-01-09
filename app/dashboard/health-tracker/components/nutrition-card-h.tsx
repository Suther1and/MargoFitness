'use client'

import { memo } from 'react'
import { Utensils, Info, Salad, Soup, Pizza, Hamburger, Apple, Check, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { useEditableValue, useGoalProgress } from '../hooks'
import { ProgressRing } from './shared'
import { ANIMATIONS } from '../constants'
import { calculateBMI, getBMICategory, calculateCalorieNorms } from '../utils/bmi-utils'

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

export const NutritionCardH = memo(function NutritionCardH({
  calories,
  caloriesGoal,
  foodQuality,
  weight,
  height = 170,
  age = 25,
  gender = 'female',
  onUpdate,
}: NutritionCardHProps) {
  const [mealInput, setMealInput] = useState('')
  const { percentage } = useGoalProgress({ current: calories, goal: caloriesGoal })
  const { isEditing, localValue, inputValue, handleEdit, handleChange, handleBlur, handleKeyDown } = useEditableValue(calories, {
    onUpdate: (val) => onUpdate('calories', val),
    min: 0,
    maxValue: 9999,
    decimalPlaces: 0,
  })

  // Используем общие утилиты для расчета
  const bmiValue = calculateBMI(height, weight)
  const bmi = bmiValue ? parseFloat(bmiValue) : 0
  const bmiCategory = getBMICategory(bmi)
  const norms = calculateCalorieNorms(weight, height, age)

  const foodItems = [
    { rating: 1, icon: Hamburger, label: 'Много лишнего', color: 'text-red-400' },
    { rating: 2, icon: Pizza, label: 'Есть лишнее', color: 'text-orange-400' },
    { rating: 3, icon: Soup, label: 'Сбалансированно', color: 'text-yellow-400' },
    { rating: 4, icon: Apple, label: 'Чистое питание', color: 'text-emerald-400' },
    { rating: 5, icon: Salad, label: 'Идеальный рацион', color: 'text-pink-400' },
  ]

  const handleAddMeal = () => {
    const val = parseInt(mealInput)
    if (val && val > 0) {
      const newTotal = Math.min(localValue + val, 9999)
      onUpdate('calories', newTotal)
      setMealInput('')
    }
  }
  
  const handleMealInputChange = (value: string) => {
    // Фильтр только целых чисел до 9999
    const numValue = parseInt(value) || 0
    if (numValue <= 9999) {
      setMealInput(value)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 md:backdrop-blur-2xl p-5 md:p-6 hover:border-violet-500/20 transition-colors duration-500 min-h-[180px] md:min-h-[210px]">
      {/* Background Ambient */}
      <div className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none -z-10 hidden md:block" />
      
      <div className="flex flex-row gap-6 md:gap-8 h-full">
        {/* Левая часть: Кольцо калорий и Добавление */}
        <div className="flex flex-col justify-between h-full items-center w-[110px] md:w-[130px] flex-shrink-0">
          <div className="cursor-pointer" onClick={handleEdit}>
            <ProgressRing 
              percentage={percentage} 
              size="medium" 
              color="#8b5cf6" 
              glowColor="bg-violet-500/15"
              className="w-[100px] h-[100px] md:w-[120px] md:h-[120px]"
            >
              {isEditing ? (
                <input
                  autoFocus
                  type="number"
                  className="w-16 bg-transparent text-center text-2xl md:text-3xl font-black text-white font-oswald outline-none"
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <>
                  <span className="text-3xl md:text-4xl font-black text-white font-oswald leading-none">{localValue}</span>
                  <span className="text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">ккал</span>
                </>
              )}
            </ProgressRing>
          </div>

          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1 focus-within:border-violet-500/40 transition-all w-full min-h-[30px] md:min-h-[34px] overflow-hidden">
            <input
              type="number"
              placeholder="Добавить"
              className="flex-1 bg-transparent text-[16px] md:text-[11px] font-bold text-white outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0 origin-left scale-[0.625] md:scale-100 w-[160%] md:w-full"
              value={mealInput}
              onChange={(e) => handleMealInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMeal()}
            />
            <AnimatePresence>
              {mealInput && (
                <motion.button {...ANIMATIONS.valueChange} onClick={handleAddMeal} className="p-1 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/40 transition-colors ml-1">
                  <Check className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Правая часть: ИМТ, Нормы и Качество */}
        <div className="flex-1 flex flex-col justify-between h-full py-0.5">
          <div className="flex flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Info className="w-3 h-3 text-white/20" />
                <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">ИМТ</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-xl md:text-2xl font-black text-white font-oswald leading-none">{bmi}</span>
                <span className={cn("text-[7px] md:text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-white/5", bmiCategory.color)}>
                  {bmiCategory.label}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col items-end">
                <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest pr-1">Суточные нормы</span>
                <div className="flex items-center gap-0.5">
                    {norms ? [
                      { label: 'Сброс', val: norms.loss, color: 'text-emerald-400' },
                      { label: 'Норма', val: norms.maintain, color: 'text-violet-400' },
                      { label: 'Набор', val: norms.gain, color: 'text-orange-400' }
                    ].map((n, i) => (
                      <div key={n.label} className="flex items-center gap-0.5">
                        <button 
                          onClick={() => onUpdate('caloriesGoal', n.val)} 
                            className={cn(
                              "flex flex-col items-center px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl transition-colors min-w-[42px] md:min-w-[50px]",
                              caloriesGoal === n.val ? "bg-white/10 border border-white/10 shadow-lg" : "hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <span className={cn("text-[14px] md:text-[16px] font-black font-oswald transition-colors leading-none", caloriesGoal === n.val ? n.color : "text-white/30")}>{n.val}</span>
                            <span className="text-[6px] md:text-[7px] text-white/20 uppercase font-bold mt-1 tracking-tighter">{n.label}</span>
                        </button>
                        {i < 2 && <div className="w-px h-4 md:h-5 bg-white/5 mx-0.5" />}
                      </div>
                    )) : (
                      <span className="text-[8px] font-bold text-white/10 uppercase italic pr-1">Укажите данные в настройках</span>
                    )}
                </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-violet-500/10">
                        <Utensils className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">Качество питания</span>
                </div>
                {foodQuality && (
                    <span className={cn("text-[7px] md:text-[9px] font-bold uppercase", foodItems.find(i => i.rating === foodQuality)?.color)}>
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
                      "flex-1 py-2 md:py-2.5 rounded-xl border transition-colors duration-300 flex items-center justify-center",
                      isActive 
                        ? "bg-white/10 border-white/20 scale-105 shadow-lg" 
                        : "bg-white/5 border-white/5 opacity-30 hover:opacity-100 hover:bg-white/[0.07]"
                    )}
                  >
                    <item.icon className={cn(
                        "w-[18px] h-[18px] md:w-5 md:h-5 transition-colors duration-300",
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
})
