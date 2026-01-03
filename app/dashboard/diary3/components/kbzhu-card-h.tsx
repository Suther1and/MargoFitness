'use client'

import { Utensils, Edit3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface KbzhuCardHProps {
  calories: number; caloriesGoal: number;
  protein: number; proteinGoal: number;
  fats: number; fatsGoal: number;
  carbs: number; carbsGoal: number;
  onUpdate: (metric: string, val: number) => void
}

export function KbzhuCardH(props: KbzhuCardHProps) {
  const calPerc = Math.min((props.calories / props.caloriesGoal) * 100, 100)
  const [editingField, setEditingField] = useState<string | null>(null)
  
  const macros = [
    { id: 'protein', label: 'Белки', val: props.protein, goal: props.proteinGoal, color: 'bg-red-500' },
    { id: 'fats', label: 'Жиры', val: props.fats, goal: props.fatsGoal, color: 'bg-amber-500' },
    { id: 'carbs', label: 'Углеводы', val: props.carbs, goal: props.carbsGoal, color: 'bg-blue-500' },
  ]

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl p-8 hover:border-amber-500/20 transition-all duration-500 h-full">
      <div className="flex flex-col md:flex-row gap-10 h-full items-center">
        {/* Кольцо калорий */}
        <div className="relative w-36 h-36 flex-shrink-0 cursor-pointer group/cal" onClick={() => setEditingField('calories')}>
          <svg className="w-full h-full -rotate-90">
            <circle cx="72" cy="72" r="64" className="stroke-white/5" strokeWidth="12" fill="none" />
            <motion.circle
              cx="72" cy="72" r="64"
              className="stroke-amber-500"
              style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.2))' }}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "402", strokeDashoffset: "402" }}
              animate={{ strokeDashoffset: 402 - (402 * calPerc) / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {editingField === 'calories' ? (
                <input 
                    autoFocus
                    type="number"
                    className="w-20 bg-transparent text-center text-3xl font-black text-white font-oswald outline-none"
                    value={props.calories}
                    onChange={(e) => props.onUpdate('calories', parseInt(e.target.value) || 0)}
                    onBlur={() => setEditingField(null)}
                />
            ) : (
                <>
                    <span className="text-4xl font-black text-white font-oswald leading-none">{props.calories}</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2">ккал</span>
                </>
            )}
          </div>
        </div>

        {/* Макросы */}
        <div className="flex-1 w-full space-y-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5 text-amber-500/60" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Макронутриенты</span>
            </div>
          </div>
          
          <div className="grid gap-4">
            {macros.map((m) => {
              const p = Math.min((m.val / m.goal) * 100, 100)
              const isEditing = editingField === m.id
              return (
                <div key={m.label} className="space-y-2 group/macro">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">{m.label}</span>
                    <div className="flex items-baseline gap-1 cursor-pointer" onClick={() => setEditingField(m.id)}>
                      {isEditing ? (
                        <input 
                            autoFocus
                            type="number"
                            className="w-12 bg-white/5 border border-white/10 rounded px-1 text-right text-xs font-bold text-white outline-none"
                            value={m.val}
                            onChange={(e) => props.onUpdate(m.id, parseInt(e.target.value) || 0)}
                            onBlur={() => setEditingField(null)}
                        />
                      ) : (
                        <span className="text-sm font-black text-white font-oswald">{m.val}г</span>
                      )}
                      <span className="text-[10px] text-white/20">/ {m.goal}г</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className={cn("h-full transition-all duration-500", m.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
