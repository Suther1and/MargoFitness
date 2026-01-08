"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface HabitDay {
  date: string
  completed: boolean
  value: number // 0-100 completion percentage
}

interface HabitsHeatmapProps {
  data: HabitDay[]
  width?: number
  height?: number
  columns?: number
}

export function HabitsHeatmap({ 
  data, 
  width = 280, 
  height = 140,
  columns = 7
}: HabitsHeatmapProps) {
  const { cells, rows } = useMemo(() => {
    if (data.length === 0) {
      return { cells: [], rows: 0 }
    }

    const cellSize = 16
    const gap = 3
    const totalCellWidth = cellSize + gap

    const rowCount = Math.ceil(data.length / columns)
    const cellsArray = data.map((day, i) => {
      const row = Math.floor(i / columns)
      const col = i % columns
      const x = col * totalCellWidth
      const y = row * totalCellWidth

      // Color intensity based on completion
      const getColor = (val: number) => {
        if (val === 0) return "#ffffff10"
        if (val < 30) return "#f59e0b40"
        if (val < 60) return "#f59e0b80"
        if (val < 90) return "#f59e0bcc"
        return "#f59e0b"
      }

      return {
        x,
        y,
        size: cellSize,
        value: day.value,
        completed: day.completed,
        date: day.date,
        color: getColor(day.value)
      }
    })

    return {
      cells: cellsArray,
      rows: rowCount
    }
  }, [data, columns])

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
      {/* Day labels (top) */}
      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].slice(0, columns).map((day, i) => (
        <text
          key={day}
          x={i * 19 + 8}
          y={12}
          fontSize="9"
          fontWeight="700"
          fill="currentColor"
          className="text-white/30 uppercase"
          textAnchor="middle"
        >
          {day[0]}
        </text>
      ))}

      {/* Cells */}
      <g transform="translate(0, 20)">
        {cells.map((cell, i) => (
          <motion.g key={i}>
            <motion.rect
              x={cell.x}
              y={cell.y}
              width={cell.size}
              height={cell.size}
              rx="3"
              fill={cell.color}
              stroke={cell.value > 0 ? "#f59e0b" : "transparent"}
              strokeWidth="0.5"
              strokeOpacity="0.3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.2, 
                delay: i * 0.02,
                ease: "easeOut"
              }}
              className="cursor-pointer hover:stroke-amber-500 hover:stroke-2 transition-all"
            />
            
            {/* Checkmark for completed days */}
            {cell.completed && (
              <motion.path
                d={`M ${cell.x + 4} ${cell.y + 8} L ${cell.x + 7} ${cell.y + 11} L ${cell.x + 12} ${cell.y + 5}`}
                stroke="#09090b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: i * 0.02 + 0.2,
                  ease: "easeOut"
                }}
              />
            )}
          </motion.g>
        ))}
      </g>

      {/* Legend */}
      <g transform={`translate(0, ${height - 15})`}>
        <text
          x="0"
          y="10"
          fontSize="8"
          fontWeight="700"
          fill="currentColor"
          className="text-white/20 uppercase tracking-wider"
        >
          Меньше
        </text>
        {[0, 30, 60, 90].map((val, i) => {
          const color = val === 0 ? "#ffffff10" : 
                       val === 30 ? "#f59e0b40" : 
                       val === 60 ? "#f59e0b80" : "#f59e0bcc"
          return (
            <rect
              key={i}
              x={45 + i * 12}
              y="2"
              width="10"
              height="10"
              rx="2"
              fill={color}
            />
          )
        })}
        <text
          x={45 + 4 * 12 + 5}
          y="10"
          fontSize="8"
          fontWeight="700"
          fill="currentColor"
          className="text-white/20 uppercase tracking-wider"
        >
          Больше
        </text>
      </g>
    </svg>
  )
}



