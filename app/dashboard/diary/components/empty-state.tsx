'use client'

import { motion } from 'framer-motion'
import { Plus, Target } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Target className="w-10 h-10 text-white/20" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/40 text-sm max-w-md mb-6">{description}</p>

      {/* Action Button */}
      {onAction && actionLabel && (
        <motion.button
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span>{actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  )
}

