"use client"

import { motion } from "framer-motion"
import { Frown, Meh, Smile, Laugh } from "lucide-react"
import { MoodRating } from "../../types"

interface MoodDataPoint {
  date: string
  mood: MoodRating
}

interface MoodTimelineProps {
  data: MoodDataPoint[]
  width?: number
  height?: number
}

const MOOD_ICONS = {
  1: Frown,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Laugh
}

const MOOD_COLORS = {
  1: "#ef4444",
  2: "#f97316",
  3: "#facc15",
  4: "#22c55e",
  5: "#ec4899"
}

export function MoodTimeline({ 
  data, 
  width = 300, 
  height = 80
}: MoodTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
        Нет данных
      </div>
    )
  }

  const padding = { left: 15, right: 15, top: 20, bottom: 20 }
  const chartWidth = width - padding.left - padding.right
  const itemWidth = chartWidth / data.length
  const centerY = height / 2

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        {Object.entries(MOOD_COLORS).map(([mood, color]) => (
          <linearGradient key={mood} id={`moodGradient${mood}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        ))}
      </defs>

      {/* Connecting line */}
      <motion.path
        d={`M ${padding.left} ${centerY} L ${width - padding.right} ${centerY}`}
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Mood points */}
      {data.map((point, i) => {
        const x = padding.left + i * itemWidth + itemWidth / 2
        const y = centerY
        const Icon = MOOD_ICONS[point.mood]
        const color = MOOD_COLORS[point.mood]

        return (
          <motion.g key={i}>
            {/* Background circle */}
            <motion.circle
              cx={x}
              cy={y}
              r="12"
              fill={`url(#moodGradient${point.mood})`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="cursor-pointer hover:scale-110 transition-transform"
            />
            
            {/* Icon */}
            <motion.foreignObject
              x={x - 8}
              y={y - 8}
              width="16"
              height="16"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
            >
              <div className="flex items-center justify-center w-full h-full pointer-events-none">
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </motion.foreignObject>
          </motion.g>
        )
      })}
    </svg>
  )
}


