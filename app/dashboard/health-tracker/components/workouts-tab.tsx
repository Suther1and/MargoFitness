'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, BookOpen, Zap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type WorkoutSubTab = 'workouts' | 'materials' | 'intensives'

export function WorkoutsTab() {
  const [activeSubTab, setActiveSubTab] = useState<WorkoutSubTab>('workouts')

  const tabs = [
    { id: 'workouts' as WorkoutSubTab, label: 'Тренировки', icon: Dumbbell, color: 'bg-cyan-500', shadow: 'shadow-cyan-500/20' },
    { id: 'materials' as WorkoutSubTab, label: 'Материалы', icon: BookOpen, color: 'bg-slate-400', shadow: 'shadow-slate-400/20' },
    { id: 'intensives' as WorkoutSubTab, label: 'Интенсивы', icon: Zap, color: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
  ]

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      {/* Tabs переключатель */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider",
                activeSubTab === tab.id
                  ? `${tab.color} text-black shadow-lg ${tab.shadow}`
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Разделитель */}
      <div className="h-px bg-white/5 mb-4" />

      {/* Контент */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'workouts' && (
            <EmptyState
              icon={Dumbbell}
              title="Тренировки скоро появятся"
              description="Мы готовим для тебя персональные программы тренировок с видео и подробными инструкциями"
              gradient="from-amber-500 to-orange-500"
            />
          )}
          
          {activeSubTab === 'materials' && (
            <EmptyState
              icon={BookOpen}
              title="Материалы в разработке"
              description="Здесь будут полезные статьи, гайды по питанию, технике выполнения упражнений и многое другое"
              gradient="from-blue-500 to-indigo-500"
            />
          )}
          
          {activeSubTab === 'intensives' && (
            <EmptyState
              icon={Zap}
              title="Интенсивы готовятся"
              description="Скоро запустим специальные программы для быстрого достижения конкретных целей"
              gradient="from-purple-500 to-pink-500"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
}

function EmptyState({ icon: Icon, title, description, gradient }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 rounded-[3rem] bg-white/[0.03] backdrop-blur-md border border-white/10 relative overflow-hidden min-h-[400px]">
      {/* Фоновый градиент */}
      <div 
        className={cn(
          "absolute inset-0 opacity-5 bg-gradient-to-br",
          gradient
        )} 
      />
      
      {/* Иконка */}
      <div className="relative mb-6">
        <div 
          className={cn(
            "absolute inset-0 blur-2xl opacity-20 bg-gradient-to-br rounded-full",
            gradient
          )}
        />
        <div 
          className={cn(
            "relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br",
            gradient
          )}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Текст */}
      <h3 className="text-2xl font-oswald font-black text-white/90 mb-3 text-center uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-sm text-white/40 text-center max-w-[320px] leading-relaxed font-medium mb-8">
        {description}
      </p>

      {/* Дополнительный индикатор */}
      <div className="flex items-center gap-2 text-xs text-white/20 font-black uppercase tracking-widest">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Скоро запуск
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  )
}
