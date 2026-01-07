"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface StepsDataPoint {
  date: string
  value: number
  goal: number
}

interface StepsBarChartProps {
  data: StepsDataPoint[]
  width?: number
  height?: number
}

export function StepsBarChart({ 
  data, 
  width = 300, 
  height = 120
}: StepsBarChartProps) {
  const { bars, maxValue, goalLine } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [], maxValue: 0, goalLine: 0 }
    }

    const values = data.map(d => d.value)
    const goals = data.map(d => d.goal)
    const max = Math.max(...values, ...goals)
    const avgGoal = goals.reduce((a, b) => a + b, 0) / goals.length

    const padding = { top: 10, bottom: 20, left: 10, right: 10 }
    const chartHeight = height - padding.top - padding.bottom
    const barWidth = (width - padding.left - padding.right) / data.length
    const barGap = barWidth * 0.2
    const actualBarWidth = barWidth - barGap

    const barsArray = data.map((point, i) => {
      const barHeight = (point.value / max) * chartHeight
      const x = padding.left + i * barWidth + barGap / 2
      const y = padding.top + (chartHeight - barHeight)
      const reachedGoal = point.value >= point.goal

      return {
        x,
        y,
        width: actualBarWidth,
        height: barHeight,
        value: point.value,
        date: point.date,
        reachedGoal
      }
    })

    const goalY = padding.top + (chartHeight - (avgGoal / max) * chartHeight)

    return {
      bars: barsArray,
      maxValue: max,
      goalLine: goalY
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
        <linearGradient id="stepsBarSuccess" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="stepsBarMissed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Goal line */}
      <motion.line
        x1="10"
        y1={goalLine}
        x2={width - 10}
        y2={goalLine}
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* Bars */}
      {bars.map((bar, i) => (
        <motion.g key={i}>
          <motion.rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.reachedGoal ? "url(#stepsBarSuccess)" : "url(#stepsBarMissed)"}
            rx="2"
            initial={{ height: 0, y: height - 20 }}
            animate={{ height: bar.height, y: bar.y }}
            transition={{ 
              duration: 0.6, 
              delay: i * 0.05,
              ease: "easeOut"
            }}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </motion.g>
      ))}
    </svg>
  )
}

