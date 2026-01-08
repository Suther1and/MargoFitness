"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface WaterWaveChartProps {
  percentage: number
  width?: number
  height?: number
}

export function WaterWaveChart({ 
  percentage, 
  width = 120, 
  height = 120 
}: WaterWaveChartProps) {
  const safePercentage = Math.max(0, Math.min(100, percentage))
  const fillHeight = (safePercentage / 100) * height

  // Create wave path
  const wavePath = useMemo(() => {
    const amplitude = 6
    const frequency = 2
    const wavePoints = []
    
    for (let x = 0; x <= width; x += 2) {
      const y = height - fillHeight + Math.sin((x / width) * Math.PI * frequency) * amplitude
      wavePoints.push(`${x},${y}`)
    }
    
    return `M 0,${height} L ${wavePoints.join(' L ')} L ${width},${height} Z`
  }, [width, height, fillHeight])

  return (
    <div className="relative" style={{ width, height }}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-hidden rounded-2xl"
      >
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
          <clipPath id="waterClip">
            <rect x="0" y="0" width={width} height={height} rx="16" />
          </clipPath>
        </defs>

        {/* Background */}
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill="#1e293b" 
          opacity="0.3"
          rx="16"
        />

        {/* Water fill with wave */}
        <g clipPath="url(#waterClip)">
          <motion.path
            d={wavePath}
            fill="url(#waterGradient)"
            initial={{ y: height }}
            animate={{ y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Animated wave overlay */}
          <motion.path
            d={wavePath}
            fill="#3b82f6"
            opacity="0.2"
            initial={{ y: height }}
            animate={{ 
              y: [0, -3, 0],
            }}
            transition={{ 
              duration: 2,
              delay: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </g>

        {/* Border */}
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeOpacity="0.2"
          rx="16"
        />
      </svg>

      {/* Percentage text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <div className="text-3xl font-black text-white tabular-nums">
            {Math.round(safePercentage)}%
          </div>
        </motion.div>
      </div>
    </div>
  )
}


