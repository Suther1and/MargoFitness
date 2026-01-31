'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

const ACHIEVEMENT_ICONS = [
  'athlete.png', 'collector.png', 'consistency.png', 'energetic.png',
  'first-workout.png', 'goal-reached.png', 'hundred-percent.png',
  'iron-will.png', 'legend.png', 'marathon.png', 'perfect-day.png',
  'perfectionist.png', 'sport-master.png', 'stability.png',
  'veteran.png', 'weekly-cycle.png'
]

export function AchievementPattern() {
  const items = useMemo(() => {
    const positions = [
      // ЛЕВАЯ СТОРОНА
      { top: '10%', left: '5%', rotate: -15, scale: 0.8, type: 'edge' },
      { top: '50%', left: '8%', rotate: 10, scale: 0.7, type: 'edge' },
      { top: '80%', left: '4%', rotate: -25, scale: 0.9, type: 'edge' },
      
      // ПРАВАЯ СТОРОНА
      { top: '15%', left: '85%', rotate: 20, scale: 0.8, type: 'edge' },
      { top: '55%', left: '82%', rotate: -12, scale: 0.7, type: 'edge' },
      { top: '85%', left: '88%', rotate: 25, scale: 0.9, type: 'edge' },
      
      // ВНУТРЕННИЕ (разбросанные)
      { top: '25%', left: '20%', rotate: -5, scale: 0.4, type: 'inner' },
      { top: '70%', left: '25%', rotate: 12, scale: 0.3, type: 'inner' },
      { top: '20%', left: '75%', rotate: 8, scale: 0.4, type: 'inner' },
      { top: '65%', left: '70%', rotate: -15, scale: 0.3, type: 'inner' },
    ]

    return positions.map((pos, i) => ({
      id: i,
      icon: ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length],
      ...pos,
      opacity: pos.type === 'edge' ? 0.12 : 0.06,
      duration: 15 + (i % 5) * 2, // Более быстрая анимация
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute will-change-transform"
          style={{ 
            top: item.top, 
            left: item.left,
            opacity: item.opacity,
            scale: item.scale
          }}
          animate={{ 
            rotate: [item.rotate - 5, item.rotate + 5, item.rotate - 5],
            y: [0, -10, 0], // Добавляем покачивание по вертикали
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={`/achievements/${item.icon}`}
            alt=""
            width={120} // Немного уменьшим базовый размер
            height={120}
            className="grayscale brightness-[1.1] contrast-[1.1] mix-blend-screen"
          />
        </motion.div>
      ))}
    </div>
  )
}
