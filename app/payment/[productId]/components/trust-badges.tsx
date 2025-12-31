'use client'

import { motion } from 'framer-motion'
import { Shield, CreditCard, Lock } from 'lucide-react'

export function TrustBadges() {
  // Компонент скрыт на мобильных через parent component
  const badges = [
    {
      icon: Shield,
      text: 'SSL',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      ringColor: 'ring-green-500/20'
    },
    {
      icon: CreditCard,
      text: 'ЮКасса',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      ringColor: 'ring-blue-500/20'
    },
    {
      icon: Lock,
      text: 'Безопасно',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      ringColor: 'ring-purple-500/20'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center gap-6 py-2 border-t border-white/5 mt-4"
    >
      <div className="flex items-center gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default"
          >
            <badge.icon className="size-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">
              {badge.text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

