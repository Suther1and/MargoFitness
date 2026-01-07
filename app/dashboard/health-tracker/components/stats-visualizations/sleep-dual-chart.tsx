"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface SleepDataPoint {
  date: string
  hours: number
  quality: number // 0-100
}

interface SleepDualChartProps {
  data: SleepDataPoint[]
  width?: number
  height?: number
}

export function SleepDualChart({ 
  data, 
  width = 300, 
  height = 100
}: SleepDualChartProps) {
  const { hoursPath, qualityPath, points } = useMemo(() => {
    if (data.length === 0) {
      return { hoursPath: "", qualityPath: "", points: [] }
    }

    const padding = { top: 10, bottom: 10, left: 5, right: 5 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const maxHours = Math.max(...data.map(d => d.hours), 10)
    
    const pointsArray = data.map((point, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const hoursY = padding.top + chartHeight - (point.hours / maxHours) * chartHeight
      const qualityY = padding.top + chartHeight - (point.quality / 100) * chartHeight
      
      return { 
        x, 
        hoursY, 
        qualityY,
        hours: point.hours,
        quality: point.quality,
        date: point.date 
      }
    })

    // Hours line (primary)
    let hoursLine = `M ${pointsArray[0].x} ${pointsArray[0].hoursY}`
    for (let i = 1; i < pointsArray.length; i++) {
      const prev = pointsArray[i - 1]
      const curr = pointsArray[i]
      const cpx = (prev.x + curr.x) / 2
      hoursLine += ` Q ${cpx} ${prev.hoursY}, ${curr.x} ${curr.hoursY}`
    }

    // Quality line (secondary)
    let qualityLine = `M ${pointsArray[0].x} ${pointsArray[0].qualityY}`
    for (let i = 1; i < pointsArray.length; i++) {
      const prev = pointsArray[i - 1]
      const curr = pointsArray[i]
      const cpx = (prev.x + curr.x) / 2
      qualityLine += ` Q ${cpx} ${prev.qualityY}, ${curr.x} ${curr.qualityY}`
    }

    return {
      hoursPath: hoursLine,
      qualityPath: qualityLine,
      points: pointsArray
    }
  }, [data, width, height])

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
        Нет данных
      </div>
    )
  }

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {/* Quality line (background, lighter) */}
      <motion.path
        d={qualityPath}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />

      {/* Hours line (main, prominent) */}
      <motion.path
        d={hoursPath}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Data points for hours */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.hoursY}
          r="2.5"
          fill="#6366f1"
          stroke="#09090b"
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.5 + i * 0.05 }}
          className="cursor-pointer hover:r-4 transition-all"
        />
      ))}
    </svg>
  )
}

