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
      className="flex flex-wrap items-center justify-center gap-3 py-1"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
        <Shield className="size-3" />
        Безопасная оплата
      </div>
      <div className="flex items-center gap-3">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-1.5"
          >
            <badge.icon className={`size-3 ${badge.color} opacity-80`} />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              {badge.text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

