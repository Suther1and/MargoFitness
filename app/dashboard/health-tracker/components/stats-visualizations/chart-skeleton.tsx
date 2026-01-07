"use client"

import { motion } from "framer-motion"

interface ChartSkeletonProps {
  width?: number
  height?: number
  type?: 'line' | 'bar' | 'circle'
}

export function ChartSkeleton({ 
  width = 300, 
  height = 120,
  type = 'line'
}: ChartSkeletonProps) {
  if (type === 'circle') {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-white/10 border-t-white/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (type === 'bar') {
    return (
      <div className="flex items-end gap-2 h-full">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-white/5 rounded-t"
            initial={{ height: 0 }}
            animate={{ height: `${30 + Math.random() * 70}%` }}
            transition={{ 
              duration: 0.8,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        className="w-3/4 h-1 bg-white/10 rounded-full overflow-hidden"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className="h-full w-1/3 bg-white/20"
          initial={{ x: '-100%' }}
          animate={{ x: '300%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  )
}

