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
      // ЛЕВАЯ СТОРОНА (внешний радиус)
      { top: '5%', left: '2%', rotate: -15, scale: 0.85, type: 'edge' },
      { top: '35%', left: '-1%', rotate: 10, scale: 0.7, type: 'edge' },
      { top: '65%', left: '1%', rotate: -5, scale: 0.8, type: 'edge' },
      { top: '92%', left: '3%', rotate: -20, scale: 0.9, type: 'edge' },
      
      // ЛЕВАЯ СТОРОНА (внутренний радиус - поддержка)
      { top: '20%', left: '12%', rotate: 15, scale: 0.5, type: 'inner' },
      { top: '50%', left: '15%', rotate: -8, scale: 0.45, type: 'inner' },
      { top: '80%', left: '14%', rotate: 12, scale: 0.55, type: 'inner' },
      
      // ПРАВАЯ СТОРОНА (внешний радиус)
      { top: '8%', left: '88%', rotate: 20, scale: 0.85, type: 'edge' },
      { top: '38%', left: '92%', rotate: -12, scale: 0.7, type: 'edge' },
      { top: '68%', left: '90%', rotate: 15, scale: 0.8, type: 'edge' },
      { top: '95%', left: '86%', rotate: 25, scale: 0.9, type: 'edge' },
      
      // ПРАВАЯ СТОРОНА (внутренний радиус - поддержка)
      { top: '22%', left: '78%', rotate: -15, scale: 0.5, type: 'inner' },
      { top: '52%', left: '75%', rotate: 8, scale: 0.45, type: 'inner' },
      { top: '82%', left: '76%', rotate: -10, scale: 0.55, type: 'inner' },
      
      // АКЦЕНТЫ СВЕРХУ И СНИЗУ (разнесены от центра)
      { top: '2%', left: '30%', rotate: -10, scale: 0.4, type: 'inner' },
      { top: '4%', left: '70%', rotate: 15, scale: 0.4, type: 'inner' },
      { top: '94%', left: '25%', rotate: 10, scale: 0.4, type: 'inner' },
      { top: '96%', left: '65%', rotate: -12, scale: 0.4, type: 'inner' },
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
