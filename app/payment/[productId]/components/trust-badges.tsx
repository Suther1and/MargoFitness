'use client'

import { motion } from 'framer-motion'
import { Shield, CreditCard, Lock } from 'lucide-react'

export function TrustBadges() {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5"
    >
      {/* Фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-green-400" />
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Безопасная оплата</span>
        </div>

        {/* Бейджи */}
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.6 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${badge.bgColor} ring-1 ${badge.ringColor} transition-all`}
            >
              <badge.icon className={`size-4 ${badge.color}`} />
              <span className={`text-xs font-medium ${badge.color}`}>
                {badge.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <ul className="space-y-2 text-xs text-white/50">
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Защищенное SSL соединение</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Оплата через ЮКасса</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Данные карты не хранятся</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}

