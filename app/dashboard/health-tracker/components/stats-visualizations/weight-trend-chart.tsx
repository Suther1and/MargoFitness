"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface WeightDataPoint {
  date: string
  value: number
}

interface WeightTrendChartProps {
  data: WeightDataPoint[]
  width?: number
  height?: number
  showArea?: boolean
}

export function WeightTrendChart({ 
  data, 
  width = 300, 
  height = 120,
  showArea = true 
}: WeightTrendChartProps) {
  const { path, areaPath, points, minValue, maxValue, valueRange } = useMemo(() => {
    if (data.length === 0) {
      return { path: "", areaPath: "", points: [], minValue: 0, maxValue: 0, valueRange: 0 }
    }

    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const padding = 10
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const pointsArray = data.map((point, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((point.value - min) / range) * chartHeight
      return { x, y, value: point.value, date: point.date }
    })

    // Create smooth curve path using quadratic bezier curves
    let linePath = `M ${pointsArray[0].x} ${pointsArray[0].y}`
    
    for (let i = 1; i < pointsArray.length; i++) {
      const prev = pointsArray[i - 1]
      const curr = pointsArray[i]
      const cpx = (prev.x + curr.x) / 2
      linePath += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`
    }

    // Area path (filled below the line)
    let area = linePath + ` L ${pointsArray[pointsArray.length - 1].x} ${height} L ${pointsArray[0].x} ${height} Z`

    return {
      path: linePath,
      areaPath: area,
      points: pointsArray,
      minValue: min,
      maxValue: max,
      valueRange: range
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
      <defs>
        <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <motion.path
          d={areaPath}
          fill="url(#weightGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}

      {/* Main line */}
      <motion.path
        d={path}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Data points */}
      {points.map((point, i) => {
        const isMin = point.value === minValue
        const isMax = point.value === maxValue
        const isKeyPoint = isMin || isMax || i === 0 || i === points.length - 1

        return (
          <motion.g key={i}>
            {isKeyPoint && (
              <>
                {/* Outer glow circle */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#10b981"
                  opacity="0.2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.5 + i * 0.05 }}
                />
                {/* Main point */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill="#10b981"
                  stroke="#09090b"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.5 + i * 0.05 }}
                  className="cursor-pointer hover:r-4 transition-all"
                />
              </>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}



