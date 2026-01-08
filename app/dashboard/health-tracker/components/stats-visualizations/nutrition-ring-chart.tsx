"use client"

import { motion } from "framer-motion"

interface NutritionData {
  protein: number
  fats: number
  carbs: number
  total: number
}

interface NutritionRingChartProps {
  data: NutritionData
  size?: number
}

export function NutritionRingChart({ 
  data, 
  size = 120 
}: NutritionRingChartProps) {
  const center = size / 2
  const radius = (size - 30) / 2
  const strokeWidth = 12

  const { protein, fats, carbs, total } = data
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-white/20 text-xs" style={{ width: size, height: size }}>
        Нет данных
      </div>
    )
  }

  // Calculate percentages
  const proteinPercent = (protein / total) * 100
  const fatsPercent = (fats / total) * 100
  const carbsPercent = (carbs / total) * 100

  // Calculate circumference
  const circumference = 2 * Math.PI * radius

  // Calculate stroke dash offsets for each segment
  const proteinDash = (proteinPercent / 100) * circumference
  const fatsDash = (fatsPercent / 100) * circumference
  const carbsDash = (carbsPercent / 100) * circumference

  // Rotation angles to position segments
  const proteinRotate = -90
  const fatsRotate = proteinRotate + (proteinPercent / 100) * 360
  const carbsRotate = fatsRotate + (fatsPercent / 100) * 360

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
        />

        {/* Protein segment (violet) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={strokeWidth}
          strokeDasharray={`${proteinDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${proteinRotate} ${center} ${center})`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${proteinDash} ${circumference}` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />

        {/* Fats segment (amber) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${fatsDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${fatsRotate} ${center} ${center})`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${fatsDash} ${circumference}` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        />

        {/* Carbs segment (emerald) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={`${carbsDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${carbsRotate} ${center} ${center})`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${carbsDash} ${circumference}` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <div className="text-xs font-black text-white/40 uppercase tracking-wider">КБЖУ</div>
          <div className="text-lg font-black text-white tabular-nums mt-0.5">
            {Math.round(total)}
          </div>
        </motion.div>
      </div>
    </div>
  )
}



