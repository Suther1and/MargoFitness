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
  initialAchievementId?: string | null
}

export function AchievementsPopup({ isOpen, onClose, initialAchievementId }: AchievementsPopupProps) {
  const [statusFilter, setStatusFilter] = useState<'completed' | 'uncompleted'>('uncompleted')
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: achievements = [], isLoading } = useAllAchievements(userId)

  useEffect(() => {
    if (isOpen && initialAchievementId && achievements.length > 0) {
      console.log('Searching for achievement:', initialAchievementId);
      const achievement = achievements.find(a => a.id === initialAchievementId)
      if (achievement) {
        console.log('Found achievement:', achievement.title);
        setSelectedAchievement(achievement)
        setStatusFilter(achievement.isUnlocked ? 'completed' : 'uncompleted')
      }
    }
  }, [isOpen, initialAchievementId, achievements])

  useEffect(() => {
    if (isOpen || selectedAchievement) {
      const originalOverflow = document.body.style.overflow;
      const originalHTMLOverflow = document.documentElement.style.overflow;
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      if (isOpen && !userId) {
        const loadUser = async () => {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          setUserId(user?.id || null)
        }
        loadUser()
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHTMLOverflow;
        document.body.style.touchAction = 'auto';
      };
    }
  }, [isOpen, selectedAchievement, userId])

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
        className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/70 backdrop-blur-xl"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => {
                  const isSecret = achievement.is_secret && !achievement.isUnlocked
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group/item cursor-pointer"
                      onClick={() => !isSecret && setSelectedAchievement(achievement)}
                    >
                      <div className={cn(
                        'aspect-square rounded-[1.8rem] flex flex-col items-center justify-center p-3 transition-all duration-500 relative overflow-hidden group/item hover:scale-105 active:scale-95',
                        !achievement.isUnlocked && 'opacity-50'
                      )}>
                        {/* Hidden Glow */}
                        {achievement.isUnlocked && (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                        )}

                        <div className={cn(
                          'w-24 h-24 sm:w-32 sm:h-32 mb-4 transition-all duration-700 ease-out z-10 relative flex items-center justify-center',
                          !achievement.isUnlocked && 'grayscale brightness-0 opacity-10'
                        )}>
                          {isSecret ? (
                            <span className="text-5xl sm:text-6xl">🔒</span>
                          ) : achievement.icon_url ? (
                            <img 
                              src={achievement.icon_url} 
                              alt={achievement.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-5xl sm:text-6xl">{achievement.icon}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-2 w-full px-1 z-10">
                          <div className="flex items-center gap-1.5 justify-center w-full">
                            {achievement.isUnlocked && (
                              <div className="relative flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
                              </div>
                            )}
                            <span className={cn(
                              'text-[11px] font-black uppercase tracking-tight text-center font-oswald transition-colors leading-tight',
                              achievement.isUnlocked ? 'text-white/80 group-hover/item:text-white' : 'text-white/20'
                            )}>
                              {isSecret ? '???' : achievement.title}
                            </span>
                          </div>
                        </div>

                        {/* Reward Badge */}
                        {achievement.reward_amount && achievement.isUnlocked && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10">
                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                              +{achievement.reward_amount}
                              <span className="text-[8px]">👟</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievement Details Modal */}
        <AnimatePresence>
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0d0d0f] rounded-[2.5rem] border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>

                <div className="flex flex-col items-center text-center relative z-10 pt-4">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-48 h-48 mb-8 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  >
                    {selectedAchievement.icon_url ? (
                      <img 
                        src={selectedAchievement.icon_url} 
                        alt={selectedAchievement.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-8xl flex items-center justify-center h-full">
                        {selectedAchievement.icon}
                      </span>
                    )}
                  </motion.div>

                  <h3 className="text-2xl font-black font-oswald text-white uppercase tracking-tight leading-none italic mb-4">
                    {selectedAchievement.title}
                  </h3>
                  
                  <p className="text-sm text-white/50 font-medium leading-relaxed mb-8 px-4 font-montserrat tracking-wide">
                    {selectedAchievement.description || 'Условия получения не указаны'}
                  </p>

                  <div className="w-full space-y-3">
                    {selectedAchievement.reward_amount && (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Награда</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-black text-emerald-400 font-oswald">+{selectedAchievement.reward_amount}</span>
                          <span className="text-sm">👟</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Статус</span>
                      {selectedAchievement.isUnlocked ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            Разблокировано
                          </span>
                          {selectedAchievement.unlockedAt && (
                            <span className="text-[10px] text-white/20 font-bold">
                              {format(new Date(selectedAchievement.unlockedAt), 'd MMMM yyyy', { locale: ru })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          В процессе
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(popupContent, document.body)
}
