'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Award, Loader2, Target, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAllAchievements } from '../hooks/use-achievements'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface AchievementsPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function AchievementsPopup({ isOpen, onClose }: AchievementsPopupProps) {
  const [statusFilter, setStatusFilter] = useState<'completed' | 'uncompleted'>('uncompleted')
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const loadUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id || null)
      }
      loadUser()
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const { data: achievements = [], isLoading } = useAllAchievements(userId)

  const filteredAchievements = achievements
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
        className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        <style jsx>{`
          .premium-popup {
            background: linear-gradient(165deg, #161618 0%, #0a0a0b 40%, #000000 100%);
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.05);
          }
          @media (max-width: 640px) {
            .premium-popup {
              background: #0a0a0c;
            }
          }
          .premium-mesh {
            position: absolute;
            inset: 0;
            opacity: 0.02;
            background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0);
            background-size: 32px 32px;
            z-index: 1;
          }
          .premium-contour {
            position: absolute;
            inset: 0;
            opacity: 0.03;
            background-image: url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100 M0 200 Q 100 150 200 200 T 400 200 M0 300 Q 100 250 200 300 T 400 300' stroke='%2310b981' fill='none' stroke-width='1'/%3E%3C/svg%3E");
            background-size: 100% 100%;
            z-index: 2;
          }
          .premium-popup::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 2.5rem;
            padding: 1px;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.2), rgba(255, 255, 255, 0.02) 40%, transparent);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 10;
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="premium-popup relative w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-[2.5rem] border-x-0 sm:border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="premium-mesh" />
          <div className="premium-contour" />
          
          {/* Header */}
          <div className="p-8 pb-6 relative z-20">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                  <Trophy className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50 font-montserrat leading-none mb-1.5">
                    Личная эволюция
                  </span>
                  <h2 className="text-3xl font-black font-oswald text-white uppercase tracking-tight leading-none italic">
                    Достижения
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95"
              >
                <X className="w-5 h-5 text-white/40 group-hover:text-white" />
              </button>
            </div>

            {/* Status Filter Tabs - Minimalist */}
            <div className="flex p-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl">
              <button
                onClick={() => setStatusFilter('uncompleted')}
                className={cn(
                  'flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative',
                  statusFilter === 'uncompleted' ? 'text-white' : 'text-white/20 hover:text-white/40'
                )}
              >
                {statusFilter === 'uncompleted' && (
                  <motion.div 
                    layoutId="popupTab" 
                    className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-xl -z-10" 
                  />
                )}
                В процессе ({totalCount - unlockedCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={cn(
                  'flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative',
                  statusFilter === 'completed' ? 'text-white' : 'text-white/20 hover:text-white/40'
                )}
              >
                {statusFilter === 'completed' && (
                  <motion.div 
                    layoutId="popupTab" 
                    className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-xl -z-10" 
                  />
                )}
                Выполненные ({unlockedCount})
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar relative z-20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Синхронизация данных...</span>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Target className="w-16 h-16 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Список пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredAchievements.map((achievement) => {
                  const isSecret = achievement.is_secret && !achievement.isUnlocked
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group/item"
                    >
                      <div className={cn(
                        'aspect-square rounded-[1.8rem] flex flex-col items-center justify-center p-3 transition-all duration-500 border relative overflow-hidden group/item',
                        achievement.isUnlocked
                          ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/20'
                          : 'bg-black/20 border-white/[0.02] opacity-50'
                      )}>
                        {/* Hidden Glow */}
                        {achievement.isUnlocked && (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                        )}

                        <div className={cn(
                          'text-3xl sm:text-4xl mb-1.5 transition-all duration-700 ease-out z-10',
                          !achievement.isUnlocked && 'grayscale brightness-0 opacity-10'
                        )}>
                          {isSecret ? '🔒' : achievement.icon}
                        </div>
                        
                        <span className={cn(
                          'text-[8px] font-black uppercase tracking-tight text-center line-clamp-1 px-1 z-10 font-oswald transition-colors',
                          achievement.isUnlocked ? 'text-white/80 group-hover/item:text-white' : 'text-white/20'
                        )}>
                          {isSecret ? '???' : achievement.title}
                        </span>

                        {/* Reward Badge */}
                        {achievement.reward_amount && achievement.isUnlocked && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 z-10">
                            <span className="text-[8px] font-black text-emerald-400">+{achievement.reward_amount}</span>
                          </div>
                        )}

                        {/* Active Indicator */}
                        {achievement.isUnlocked && (
                          <div className="absolute bottom-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] z-10 animate-pulse" />
                        )}
                      </div>
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
