'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAllAchievements } from '../hooks/use-achievements'
import { createClient } from '@/lib/supabase/client'
import { AchievementCategory, ACHIEVEMENT_CATEGORIES } from '@/types/database'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface AchievementsPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function AchievementsPopup({ isOpen, onClose }: AchievementsPopupProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'uncompleted' | 'completed'>('uncompleted')
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const loadUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id || null)
      }
      loadUser()
    }
  }, [isOpen])

  const { data: achievements = [], isLoading } = useAllAchievements(userId)

  const filteredAchievements = achievements
    .filter(a => selectedCategory === 'all' ? true : a.category === selectedCategory)
    .filter(a => statusFilter === 'uncompleted' ? !a.isUnlocked : a.isUnlocked)
    .sort((a, b) => {
      if (statusFilter === 'completed' && a.unlockedAt && b.unlockedAt) {
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      }
      return 0
    })

  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const totalCount = achievements.length
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  if (!isOpen || !mounted) return null

  const popupContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#121214] rounded-3xl border border-white/10 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-oswald font-black uppercase tracking-tight text-white">
                    Достижения
                  </h2>
                  <p className="text-xs text-white/40">Твои награды и прогресс</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white/60">
                  Получено {unlockedCount} из {totalCount}
                </span>
                <span className="text-xs font-bold text-green-400">{percentage}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setStatusFilter('uncompleted')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                  statusFilter === 'uncompleted'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                )}
              >
                Невыполненные ({achievements.filter(a => !a.isUnlocked).length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                  statusFilter === 'completed'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                )}
              >
                Выполненные ({unlockedCount})
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                )}
              >
                Все
              </button>
              {(Object.keys(ACHIEVEMENT_CATEGORIES) as AchievementCategory[]).map((category) => {
                const catData = ACHIEVEMENT_CATEGORIES[category]
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                      selectedCategory === category
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    )}
                  >
                    <span>{catData.icon}</span>
                    <span>{catData.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40">Нет достижений в этой категории</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => {
                  const isSecret = achievement.is_secret && !achievement.isUnlocked
                  const catData = ACHIEVEMENT_CATEGORIES[achievement.category as AchievementCategory]

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'relative p-4 rounded-2xl border transition-all',
                        achievement.isUnlocked
                          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:from-white/15 hover:to-white/10'
                          : isSecret
                          ? 'bg-black/50 border-white/5 opacity-60'
                          : 'bg-white/[0.03] border-white/5 opacity-40 hover:opacity-60'
                      )}
                    >
                      {/* Reward Badge */}
                      {achievement.reward_amount && (
                        <div className={cn(
                          "absolute top-2 right-2 px-2 py-1 rounded-lg",
                          achievement.isUnlocked 
                            ? "bg-amber-500/20 border border-amber-500/30"
                            : "bg-white/5 border border-white/10"
                        )}>
                          <span className={cn(
                            "text-[10px] font-bold",
                            achievement.isUnlocked ? "text-amber-400" : "text-white/40"
                          )}>
                            +{achievement.reward_amount} 👟
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="text-4xl mb-3">
                        {isSecret ? '❓' : achievement.icon}
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          'font-bold mb-1 truncate',
                          achievement.isUnlocked ? 'text-white' : 'text-white/60',
                          isSecret && 'text-sm'
                        )}
                      >
                        {isSecret ? achievement.title : achievement.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={cn(
                          'text-xs mb-2 line-clamp-2',
                          achievement.isUnlocked ? 'text-white/60' : 'text-white/40'
                        )}
                      >
                        {isSecret ? '???' : achievement.description}
                      </p>

                      {/* Category Badge */}
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide',
                            achievement.isUnlocked
                              ? 'bg-white/10 text-white/60'
                              : 'bg-white/5 text-white/30'
                          )}
                        >
                          {catData.icon} {catData.label}
                        </span>
                      </div>

                      {/* Unlock Date */}
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <p className="text-[10px] text-green-400 font-bold">
                            ✓ Получено {format(new Date(achievement.unlockedAt), 'd MMMM yyyy', { locale: ru })}
                          </p>
                        </div>
                      )}

                      {/* Secret Badge */}
                      {achievement.is_secret && !achievement.isUnlocked && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <p className="text-[10px] text-purple-400 font-bold">
                            🔒 Секретное достижение
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(popupContent, document.body)
}

