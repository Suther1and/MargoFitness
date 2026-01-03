'use client'

import { motion } from 'framer-motion'
import { Droplets, Moon, Scale, Footprints, Smile, Zap } from 'lucide-react'
import { MetricCard } from './metric-card'
import { DailyMetrics } from '../types'

interface Zone1MetricsProps {
  data: DailyMetrics
  onMetricUpdate: (metric: string, value: number) => void
}

export function Zone1Metrics({ data, onMetricUpdate }: Zone1MetricsProps) {
  const metrics = [
    {
      label: 'Вода',
      value: data.waterIntake,
      unit: 'мл',
      icon: Droplets,
      color: 'bg-blue-500',
      progress: data.waterIntake,
      max: data.waterGoal,
      key: 'waterIntake'
    },
    {
      label: 'Сон',
      value: data.sleepHours,
      unit: 'ч',
      icon: Moon,
      color: 'bg-purple-500',
      progress: data.sleepHours,
      max: 9,
      key: 'sleepHours'
    },
    {
      label: 'Вес',
      value: data.weight,
      unit: 'кг',
      icon: Scale,
      color: 'bg-pink-500',
      key: 'weight'
    },
    {
      label: 'Шаги',
      value: data.steps,
      unit: '',
      icon: Footprints,
      color: 'bg-green-500',
      progress: data.steps,
      max: data.stepsGoal,
      key: 'steps'
    },
    {
      label: 'Настроение',
      value: data.mood || '—',
      unit: '/5',
      icon: Smile,
      color: 'bg-yellow-500',
      key: 'mood'
    },
    {
      label: 'Энергия',
      value: data.energyLevel,
      unit: '/10',
      icon: Zap,
      color: 'bg-orange-500',
      key: 'energyLevel'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <MetricCard
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
            icon={metric.icon}
            color={metric.color}
            progress={metric.progress}
            max={metric.max}
            onValueChange={(value) => onMetricUpdate(metric.key, value)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

