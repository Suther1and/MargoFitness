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
import { ACHIEVEMENT_CATEGORIES } from '@/types/database'

const getUnitLabel = (type: string) => {
  switch (type) {
    case 'water_daily':
    case 'water_total':
    case 'water_goal_streak':
      return 'мл'
    case 'steps_daily':
    case 'steps_total':
      return 'шагов'
    case 'streak_days':
    case 'perfect_streak':
    case 'weight_streak':
    case 'mood_great_streak':
    case 'sleep_streak':
      return 'дней'
    case 'total_entries':
    case 'monthly_entries':
      return 'записей'
    case 'habits_created':
      return 'привычек'
    case 'habit_completions':
      return 'раз'
    case 'achievement_count':
      return 'дост.'
    case 'weight_recorded':
    case 'weight_down_streak':
      return 'раз'
    case 'profile_complete':
      return 'пунктов'
    case 'sleep_daily':
      return 'ч'
    default:
      return ''
  }
}

const getTierName = (level: number) => {
  const names = ['Free', 'Basic', 'Pro', 'Elite']
  return names[level] || 'Free'
}

const getTierStyles = (level: number) => {
  switch (level) {
    case 1: // Basic - Бронзовый
      return {
        bar: 'bg-gradient-to-r from-amber-800 to-amber-600',
        shadow: 'shadow-[0_0_15px_rgba(146,64,14,0.5)]',
        color: 'text-amber-700',
        bg: 'bg-amber-900/10'
      }
    case 2: // Pro - Фиолетовый
      return {
        bar: 'bg-gradient-to-r from-purple-600 to-fuchsia-500',
        shadow: 'shadow-[0_0_15px_rgba(147,51,234,0.5)]',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
      }
    case 3: // Elite - Желтый
      return {
        bar: 'bg-gradient-to-r from-yellow-500 to-yellow-300',
        shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10'
      }
    default: // Free - Светло-серый
      return {
        bar: 'bg-gradient-to-r from-slate-400 to-slate-300',
        shadow: 'shadow-[0_0_10px_rgba(148,163,184,0.3)]',
        color: 'text-slate-400',
        bg: 'bg-slate-400/10'
      }
  }
}

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'common':
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'bg-emerald-500',
        bar: 'bg-gradient-to-r from-emerald-600 to-teal-400',
        shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]'
      }
    case 'rare':
      return {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        glow: 'bg-blue-500',
        bar: 'bg-gradient-to-r from-blue-600 to-cyan-400',
        shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]'
      }
    case 'epic':
      return {
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        glow: 'bg-purple-500',
        bar: 'bg-gradient-to-r from-purple-600 to-fuchsia-400',
        shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]'
      }
    case 'legendary':
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        glow: 'bg-orange-500',
        bar: 'bg-gradient-to-r from-orange-600 to-amber-400',
        shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]'
      }
    case 'absolute':
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        glow: 'bg-yellow-500',
        bar: 'bg-gradient-to-r from-yellow-600 to-amber-300',
        shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]'
      }
    default:
      return {
        color: 'text-white/60',
        bg: 'bg-white/10',
        border: 'border-white/10',
        glow: 'bg-white',
        bar: 'bg-white/40',
        shadow: ''
      }
  }
}

interface AchievementsPopupProps {
  isOpen: boolean
  onClose: () => void
  initialAchievementId?: string | null
}

function getGlowFromColorClass(colorClass: string | null): string {
  if (!colorClass) return 'rgba(255, 255, 255, 0.05)';
  const colorMap: Record<string, string> = {
    'text-green-500': 'rgba(16, 185, 129, 0.3)',
    'text-blue-500': 'rgba(59, 130, 246, 0.3)',
    'text-purple-500': 'rgba(168, 85, 247, 0.3)',
    'text-purple-400': 'rgba(192, 132, 252, 0.3)',
    'text-orange-500': 'rgba(249, 115, 22, 0.3)',
    'text-amber-500': 'rgba(245, 158, 11, 0.3)',
    'text-amber-400': 'rgba(251, 191, 36, 0.3)',
    'text-amber-600': 'rgba(217, 119, 6, 0.3)',
    'text-rose-500': 'rgba(244, 63, 94, 0.3)',
    'text-rose-400': 'rgba(251, 113, 133, 0.3)',
    'text-sky-500': 'rgba(14, 165, 233, 0.3)',
    'text-indigo-500': 'rgba(99, 102, 241, 0.3)',
    'text-indigo-400': 'rgba(129, 140, 248, 0.3)',
    'text-yellow-400': 'rgba(250, 204, 21, 0.3)',
    'text-red-500': 'rgba(239, 68, 68, 0.3)',
    'text-pink-500': 'rgba(236, 72, 153, 0.3)',
    'text-cyan-500': 'rgba(6, 182, 212, 0.3)',
    'text-cyan-400': 'rgba(34, 211, 238, 0.3)',
    'text-emerald-500': 'rgba(16, 185, 129, 0.3)',
    'text-slate-400': 'rgba(148, 163, 184, 0.3)',
    'text-gray-500': 'rgba(107, 114, 128, 0.3)',
  };
  return colorMap[colorClass] || 'rgba(255, 255, 255, 0.1)';
}

export function AchievementsPopup({ isOpen, onClose, initialAchievementId }: AchievementsPopupProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'uncompleted'>('all')
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: achievements = [], isLoading, isError, error } = useAllAchievements(userId)

  useEffect(() => {
    if (isError) {
      console.error('[AchievementsPopup] Query error:', error)
    }
  }, [isError, error])

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
    .filter(a => {
      if (statusFilter === 'all') return true
      return statusFilter === 'uncompleted' ? !a.isUnlocked : a.isUnlocked
    })
    .sort((a, b) => {
      if (statusFilter === 'all') {
        return 0 // Оставляем стандартный порядок
      }
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
            z-index: 2;
          }
          .premium-popup::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 2.5rem;
            padding: 1px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02) 40%, transparent);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 10;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
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
          <div className="relative z-30">
            <div className="p-6 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center shadow-inner transition-colors duration-500",
                    getCategoryStyles(selectedAchievement?.category || 'common').bg,
                    getCategoryStyles(selectedAchievement?.category || 'common').border
                  )}>
                    <Trophy className={cn(
                      "w-6 h-6 transition-colors duration-500",
                      selectedAchievement ? getCategoryStyles(selectedAchievement.category).color : "text-emerald-400"
                    )} />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] font-montserrat leading-none mb-1 transition-colors duration-500",
                      selectedAchievement ? getCategoryStyles(selectedAchievement.category).color : "text-emerald-500/50"
                    )}>
                      Личная эволюция
                    </span>
                    <h2 className="text-xl font-black font-oswald text-white uppercase tracking-tight leading-none italic">
                      Достижения
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all active:scale-95"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>
          </div>

          {/* Floating Tabs - Safari Style */}
          <div className="flex justify-center relative z-40 px-6">
            <div className="flex p-1 bg-[#1a1a1c]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.6)] w-full max-w-sm">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 relative whitespace-nowrap',
                  statusFilter === 'all' ? 'text-white' : 'text-white/30 hover:text-white/50'
                )}
              >
                {statusFilter === 'all' && (
                  <motion.div 
                    layoutId="safariTab" 
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-full -z-10 shadow-inner" 
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Все ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('uncompleted')}
                className={cn(
                  'flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 relative whitespace-nowrap',
                  statusFilter === 'uncompleted' ? 'text-white' : 'text-white/30 hover:text-white/50'
                )}
              >
                {statusFilter === 'uncompleted' && (
                  <motion.div 
                    layoutId="safariTab" 
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-full -z-10 shadow-inner" 
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Процесс ({totalCount - unlockedCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={cn(
                  'flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 relative whitespace-nowrap',
                  statusFilter === 'completed' ? 'text-white' : 'text-white/30 hover:text-white/50'
                )}
              >
                {statusFilter === 'completed' && (
                  <motion.div 
                    layoutId="safariTab" 
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-full -z-10 shadow-inner" 
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Готово ({unlockedCount})
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-8 custom-scrollbar relative z-20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Синхронизация данных...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 px-10 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm text-white/60">Не удалось загрузить данные достижений. Пожалуйста, попробуйте позже.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Обновить страницу
                </button>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Target className="w-16 h-16 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Список пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-16">
                {filteredAchievements.map((achievement) => {
                  const isSecret = achievement.is_secret && !achievement.isUnlocked
                  const progress = achievement.progress || 0
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group/item cursor-pointer"
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <div className="flex flex-col items-center gap-2 transition-all duration-500 relative group/item hover:scale-105 active:scale-95">
                        <div className="aspect-square w-[75%] sm:w-[80%] flex items-center justify-center relative z-10">
                          {/* Main Icon Container */}
                          <div className={cn(
                            "absolute inset-0 flex items-center justify-center transition-all duration-700 grayscale",
                            achievement.isUnlocked ? "opacity-0 scale-90" : "opacity-100",
                            isSecret ? "brightness-[0.1] contrast-[1.5]" : "brightness-[0.8] opacity-20 group-hover/item:opacity-30"
                          )}>
                            {achievement.icon_url ? (
                              <img 
                                src={achievement.icon_url} 
                                alt={achievement.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl sm:text-5xl">{achievement.icon}</span>
                            )}
                          </div>

                          {/* Premium Glass Overlay for Secret */}
                          {isSecret && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-40 rounded-[2rem] z-20" />
                              <div className="absolute inset-0 flex items-center justify-center z-30">
                                <span className="text-[7px] sm:text-[10px] font-black text-white/20 font-oswald uppercase tracking-[0.2em] italic mt-12 sm:mt-16">Секретное</span>
                              </div>
                              {/* Edge Shine */}
                              <div className="absolute inset-0 border border-white/5 rounded-[2rem] z-20" />
                            </>
                          )}

                          {/* Адаптивное свечение за иконкой в ленте */}
                          {achievement.isUnlocked && (
                            <div 
                              className="absolute inset-0 blur-3xl opacity-40 scale-125 rounded-full transition-all duration-1000"
                              style={{ backgroundColor: getGlowFromColorClass(achievement.color_class) }}
                            />
                          )}

                          {/* Shine Effect for COMPLETED Achievements only - Contained in a circle to avoid corners */}
                          {achievement.isUnlocked && (
                            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
                              <div className="absolute inset-0 w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine -top-[50%]" />
                            </div>
                          )}

                          {/* Progress Fill Part (Colored) - Hidden for Secret */}
                          {!achievement.isUnlocked && progress > 0 && !isSecret && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center transition-all duration-700 opacity-60 group-hover/item:opacity-90 z-10"
                              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                            >
                              {achievement.icon_url ? (
                                <img 
                                  src={achievement.icon_url} 
                                  alt={achievement.title}
                                  className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                                />
                              ) : (
                                <span className="text-3xl sm:text-5xl">{achievement.icon}</span>
                              )}
                            </div>
                          )}

                          {/* Fully Unlocked Part (Colored) */}
                          {achievement.isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 z-10">
                              {/* Мягкое адаптивное свечение от цвета иконки */}
                              <div 
                                className="absolute inset-0 blur-3xl opacity-30 scale-125 rounded-full"
                                style={{ backgroundColor: getGlowFromColorClass(achievement.color_class) }}
                              />
                              
                              {achievement.icon_url ? (
                                <img 
                                  src={achievement.icon_url} 
                                  alt={achievement.title}
                                  className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
                                />
                              ) : (
                                <span className="text-3xl sm:text-5xl">{achievement.icon}</span>
                              )}
                            </div>
                          )}

                          {/* Reward Badge */}
                          {achievement.reward_amount && (
                            <div className={cn(
                              "absolute -top-1 -right-1 px-2 py-0.5 rounded-full backdrop-blur-xl border z-20 transition-all duration-500",
                              achievement.isUnlocked 
                                ? "bg-white/10 border-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                                : "bg-white/5 border-white/10 opacity-40 group-hover/item:opacity-70"
                            )}>
                              <span className={cn(
                                "text-[9px] font-bold flex items-center gap-1 transition-colors font-oswald tracking-wider",
                                achievement.isUnlocked ? "text-white" : "text-white/40"
                              )}>
                                +{achievement.reward_amount}
                                <span className="text-[10px] filter grayscale-[0.5]">👟</span>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-1 w-full px-1 z-10 mt-1">
                          <div className="flex items-center gap-2 justify-center w-full">
                            {achievement.isUnlocked && (
                              <div className="relative flex items-center justify-center shrink-0 mr-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
                              </div>
                            )}
                            <span className={cn(
                              'text-[10px] sm:text-[14px] font-black uppercase tracking-tight text-center font-oswald transition-colors leading-tight',
                              achievement.isUnlocked ? 'text-white/90 group-hover/item:text-white' : 'text-white/20 group-hover/item:text-white/40'
                            )}>
                              {achievement.title}
                            </span>
                          </div>
                        </div>
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
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAchievement(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0d0d0f] rounded-[2.5rem] border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background Glow - Адаптивный от иконки */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 blur-[100px] rounded-full pointer-events-none transition-all duration-1000"
                  style={{ 
                    backgroundColor: selectedAchievement.is_secret && !selectedAchievement.isUnlocked 
                      ? 'rgba(99, 102, 241, 0.05)' 
                      : getGlowFromColorClass(selectedAchievement.color_class).replace('0.3', '0.15') 
                  }}
                />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAchievement(null)
                  }}
                  className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all z-50"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>

                <div className="flex flex-col items-center text-center relative z-10 pt-4">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-48 h-48 mb-8 relative"
                  >
                    {/* Background / Unfilled Part (Grayscale) */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-700 grayscale",
                      selectedAchievement.isUnlocked ? "opacity-0 scale-90" : "opacity-20",
                      selectedAchievement.is_secret && !selectedAchievement.isUnlocked && "brightness-[0.1] contrast-[1.5]"
                    )}>
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
                    </div>

                    {/* Premium Glass Overlay for Secret - Detail View */}
                    {selectedAchievement.is_secret && !selectedAchievement.isUnlocked && (
                      <div className="absolute inset-0 z-20 overflow-hidden rounded-[3rem]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-40 rounded-[3rem] z-20" />
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                          <span className="text-sm font-black text-white/20 font-oswald uppercase tracking-[0.3em] italic mt-32">Секретное</span>
                        </div>
                        <div className="absolute inset-0 border border-white/5 rounded-[3rem] z-20" />
                      </div>
                    )}

                    {/* Shine Effect for COMPLETED achievements only */}
                    {selectedAchievement.isUnlocked && (
                      <div className="absolute inset-0 z-20 overflow-hidden rounded-full pointer-events-none">
                        <div className="absolute inset-0 w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine -top-[50%]" />
                      </div>
                    )}

                    {/* Progress Fill Part (Colored) */}
                    {!selectedAchievement.isUnlocked && (selectedAchievement.progress || 0) > 0 && !selectedAchievement.is_secret && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center transition-all duration-700 z-10"
                        style={{ clipPath: `inset(0 ${100 - (selectedAchievement.progress || 0)}% 0 0)` }}
                      >
                        {selectedAchievement.icon_url ? (
                          <img 
                            src={selectedAchievement.icon_url} 
                            alt={selectedAchievement.title}
                            className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                          />
                        ) : (
                          <span className="text-8xl flex items-center justify-center h-full">
                            {selectedAchievement.icon}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Fully Unlocked Part (Colored) */}
                    {selectedAchievement.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 z-10">
                        {/* Мягкое адаптивное свечение от цвета иконки */}
                        <div 
                          className="absolute inset-0 blur-[60px] opacity-40 scale-125 rounded-full animate-pulse"
                          style={{ backgroundColor: getGlowFromColorClass(selectedAchievement.color_class) }}
                        />
                        {selectedAchievement.icon_url ? (
                          <img 
                            src={selectedAchievement.icon_url} 
                            alt={selectedAchievement.title}
                            className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(16,185,129,0.4)]"
                          />
                        ) : (
                          <span className="text-8xl flex items-center justify-center h-full">
                            {selectedAchievement.icon}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>

                  <div className="flex flex-col items-center gap-4 mb-8">
                    <div className={cn(
                      "px-5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] font-montserrat shadow-xl backdrop-blur-md transition-all duration-500",
                      "bg-white/[0.03]",
                      getCategoryStyles(selectedAchievement.category).color,
                      getCategoryStyles(selectedAchievement.category).border
                    )}>
                      {ACHIEVEMENT_CATEGORIES[selectedAchievement.category as keyof typeof ACHIEVEMENT_CATEGORIES]?.label}
                    </div>
                    <h3 className={cn(
                      "text-3xl font-black font-oswald text-white uppercase tracking-tight leading-none italic",
                      selectedAchievement.is_secret && !selectedAchievement.isUnlocked && "text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/60"
                    )}>
                      {selectedAchievement.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-white/50 font-medium leading-relaxed mb-8 px-4 font-montserrat tracking-wide">
                    {selectedAchievement.is_secret && !selectedAchievement.isUnlocked 
                      ? (selectedAchievement.secret_hint || 'Тайное становится явным для тех, кто ищет...')
                      : (selectedAchievement.metadata?.type === 'profile_complete' 
                        ? 'Заполните данные вашего профиля' 
                        : (selectedAchievement.description || 'Условия получения не указаны'))}
                  </p>

                  {/* Health Passport, Mentor & Weekly Discipline Fields List */}
                  {!(selectedAchievement.is_secret && !selectedAchievement.isUnlocked) && 
                   (selectedAchievement.metadata?.type === 'profile_complete' || 
                    selectedAchievement.metadata?.type === 'referral_mentor' || 
                    ((selectedAchievement.metadata?.type === 'perfect_streak' || selectedAchievement.metadata?.type === 'streak_days') && selectedAchievement.metadata?.value === 7)
                   ) && selectedAchievement.progressData?.fields && (
                    <div className="w-full grid grid-cols-3 gap-2 mb-8 px-2">
                      {selectedAchievement.progressData.fields.map((field: any, idx: number) => (
                        <div 
                          key={idx}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300",
                            field.done 
                              ? "bg-emerald-500/10 border-emerald-500/20" 
                              : "bg-white/[0.02] border-white/5 opacity-40"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                            field.done ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/10"
                          )}>
                            {field.done && <Sparkles className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-tight text-center leading-tight",
                            field.done ? "text-emerald-400" : "text-white/40"
                          )}>
                            {field.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

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

                    {!selectedAchievement.is_secret && 
                     selectedAchievement.metadata?.type !== 'profile_complete' && 
                     selectedAchievement.metadata?.type !== 'referral_mentor' && 
                     !((selectedAchievement.metadata?.type === 'perfect_streak' || selectedAchievement.metadata?.type === 'streak_days') && selectedAchievement.metadata?.value === 7) && (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden relative group/status">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 relative z-10">Статус</span>
                        {selectedAchievement.isUnlocked ? (
                          <div className="flex flex-col items-end relative z-10">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                              Разблокировано
                            </span>
                            {selectedAchievement.unlockedAt && (
                              <span className="text-[10px] text-white/20 font-bold">
                                {format(new Date(selectedAchievement.unlockedAt), 'd MMMM yyyy', { locale: ru })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-end w-2/3 relative z-10">
                            <div className="flex items-baseline gap-1 mb-1.5">
                              {selectedAchievement.metadata?.type === 'subscription_tier' ? (
                                <>
                                  <span className={cn(
                                    "text-sm font-black italic font-oswald",
                                    getTierStyles(selectedAchievement.currentValue || 0).color
                                  )}>
                                    {getTierName(selectedAchievement.currentValue || 0)}
                                  </span>
                                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter mx-1">
                                    →
                                  </span>
                                  <span className={cn(
                                    "text-sm font-black italic font-oswald",
                                    getTierStyles(selectedAchievement.targetValue || 0).color
                                  )}>
                                    {getTierName(selectedAchievement.targetValue || 0)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-black text-white italic font-oswald">
                                    {selectedAchievement.currentValue?.toLocaleString() || 0}
                                  </span>
                                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                                    из {selectedAchievement.targetValue?.toLocaleString() || 0} {getUnitLabel(selectedAchievement.metadata?.type)}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <div className={cn(
                              "w-full h-1.5 rounded-full overflow-hidden relative",
                              selectedAchievement.metadata?.type === 'subscription_tier' 
                                ? getTierStyles(selectedAchievement.targetValue || 0).bg
                                : getCategoryStyles(selectedAchievement.category).bg
                            )}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedAchievement.progress || 0}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={cn(
                                  "h-full relative rounded-full",
                                  selectedAchievement.metadata?.type === 'subscription_tier'
                                    ? getTierStyles(selectedAchievement.targetValue || 0).bar
                                    : getCategoryStyles(selectedAchievement.category).bar,
                                  selectedAchievement.metadata?.type === 'subscription_tier'
                                    ? getTierStyles(selectedAchievement.targetValue || 0).shadow
                                    : getCategoryStyles(selectedAchievement.category).shadow
                                )}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_3s_infinite]" 
                                     style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                              </motion.div>
                            </div>
                          </div>
                        )}
                        
                        {/* Background category subtle glow */}
                        {!selectedAchievement.isUnlocked && (
                          <div className={cn(
                            "absolute right-0 top-0 w-32 h-full blur-3xl opacity-5 transition-opacity group-hover/status:opacity-10",
                            selectedAchievement.metadata?.type === 'subscription_tier'
                              ? getTierStyles(selectedAchievement.targetValue || 0).bar.split(' ')[1]
                              : getCategoryStyles(selectedAchievement.category).bar.split(' ')[1]
                          )} />
                        )}
                      </div>
                    )}
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

/**
 * Helper to extract glow color from color_class
 */
function getGlowColor(colorClass: string | null): string {
  if (!colorClass) return 'bg-emerald-500/10'
  
  // Extract color name from text-XXXX-500
  const match = colorClass.match(/text-([a-z]+)-\d+/)
  if (match && match[1]) {
    const color = match[1]
    return `bg-${color}-500/10`
  }
  
  return 'bg-emerald-500/10'
}
