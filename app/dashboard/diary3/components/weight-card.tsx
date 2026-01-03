'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Scale, TrendingDown, ArrowRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DiaryCard } from './diary-card'

interface WeightCardProps {
  value: number
  onUpdate: (value: number) => void
}

export function WeightCard({ value, onUpdate }: WeightCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Create a wide range of weights for the ruler
  const minWeight = 40
  const maxWeight = 150
  const step = 0.1
  const pixelsPerStep = 10 // How many pixels represent 0.1kg
  
  const x = useMotionValue(-(value - minWeight) / step * pixelsPerStep)

  // Sync x with value changes from outside
  useEffect(() => {
    if (!isEditing) {
      x.set(-(value - minWeight) / step * pixelsPerStep)
    }
  }, [value, x, isEditing])

  const handleDrag = () => {
    const currentX = x.get()
    const newValue = minWeight + Math.round(-currentX / pixelsPerStep) * step
    if (newValue >= minWeight && newValue <= maxWeight) {
        onUpdate(Number(newValue.toFixed(1)))
    }
  }

  return (
    <DiaryCard
      title="Вес"
      subtitle="Прогресс и замеры"
      icon={Scale}
      iconColor="text-pink-400"
      iconBg="bg-pink-500/10"
      className="justify-between"
    >
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col">
            <div className="text-3xl font-bold text-white tracking-tight leading-none">
                {value} <span className="text-base font-normal text-white/40">кг</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                <TrendingDown className="w-3 h-3" />
                -0.4 кг
            </div>
        </div>
      </div>

      <div className="relative h-16 bg-white/5 rounded-2xl border border-white/5 overflow-hidden flex items-center select-none cursor-grab active:cursor-grabbing" ref={containerRef}>
        {/* Center Marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-pink-500 z-20" />
        
        {/* Ruler Content */}
        <motion.div
          drag="x"
          dragConstraints={{
            left: -(maxWeight - minWeight) / step * pixelsPerStep,
            right: 0
          }}
          style={{ x }}
          onDrag={() => {
            setIsEditing(true)
            handleDrag()
          }}
          onDragEnd={() => setIsEditing(false)}
          className="flex items-end gap-0 h-full pl-[50%]"
        >
          {Array.from({ length: (maxWeight - minWeight) / step + 1 }).map((_, i) => {
            const currentWeight = minWeight + i * step
            const isMain = Math.abs(currentWeight - Math.round(currentWeight)) < 0.01

            return (
              <div 
                key={i} 
                className="flex flex-col items-center flex-shrink-0" 
                style={{ width: pixelsPerStep }}
              >
                <div 
                  className={cn(
                    "w-[1px] rounded-full transition-colors",
                    isMain ? "h-6 bg-white/30" : "h-2 bg-white/10"
                  )} 
                />
              </div>
            )
          })}
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Прошлый</span>
            <span className="text-xs font-bold text-white/60">72.8 кг</span>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Разница</span>
            <span className="text-xs font-bold text-green-400">-0.4 кг</span>
        </div>
      </div>
    </DiaryCard>
  )
}
