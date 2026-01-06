"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface StatsEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function StatsEmptyState({ icon: Icon, title, description }: StatsEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-black text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 text-center max-w-sm">{description}</p>
    </motion.div>
  )
}

