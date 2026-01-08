"use client"

import { motion } from "framer-motion"

interface EnergyGaugeProps {
  value: number // 0-10
  size?: number
}

export function EnergyGauge({ 
  value, 
  size = 120 
}: EnergyGaugeProps) {
  const safeValue = Math.max(0, Math.min(10, value))
  const percentage = (safeValue / 10) * 100

  const center = size / 2
  const radius = (size - 30) / 2
  const strokeWidth = 10

  // Calculate angles (180 degree gauge, -90 to 90)
  const startAngle = -90
  const endAngle = 90
  const totalAngle = endAngle - startAngle
  
  const valueAngle = startAngle + (percentage / 100) * totalAngle

  // Calculate circumference and dash
  const circumference = Math.PI * radius // Half circle
  const dashLength = (percentage / 100) * circumference

  // Color based on value
  const getColor = (val: number) => {
    if (val >= 8) return "#22c55e" // green
    if (val >= 6) return "#facc15" // yellow
    if (val >= 4) return "#f97316" // orange
    return "#ef4444" // red
  }

  const color = getColor(safeValue)

  return (
    <div className="relative" style={{ width: size, height: size / 1.5 }}>
      <svg 
        width={size} 
        height={size / 1.5} 
        viewBox={`0 0 ${size} ${size / 1.5}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-white/5"
        />

        {/* Value arc */}
        <motion.path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dashLength }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />

        {/* Glow effect */}
        <motion.path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          opacity="0.2"
          filter="blur(4px)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dashLength }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <div className="text-4xl font-black tabular-nums" style={{ color }}>
            {safeValue.toFixed(1)}
          </div>
          <div className="text-[10px] font-black text-white/30 uppercase tracking-wider mt-1">
            /10
          </div>
        </motion.div>
      </div>
    </div>
  )
}


