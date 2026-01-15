'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Loader2, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementsPopup } from './achievements-popup'
import { useRecentAchievements, useAchievementStats } from '../hooks/use-achievements'
import { createClient } from '@/lib/supabase/client'

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

export function AchievementsCard() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    loadUser()
  }, [])

  const { data: recentAchievements = [], isLoading: loadingRecent } = useRecentAchievements(userId, 3)
  const { data: stats, isLoading: loadingStats } = useAchievementStats(userId)

  const isLoading = loadingRecent || loadingStats

  const handleOpenPopup = (achievementId?: string) => {
    setSelectedAchievementId(achievementId || null)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedAchievementId(null)
  }

  return (
    <>
      <div 
        onClick={() => handleOpenPopup()}
        className="group relative cursor-pointer active:scale-[0.99] transition-all duration-300 w-full"
      >
        {/* Glow behind the card */}
        <div className="absolute -inset-[2px] bg-gradient-to-b from-green-500/20 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md" />
        
        {/* Main Glass Container */}
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0c] p-5 shadow-2xl transition-all duration-300 group-hover:border-white/20 group-hover:bg-[#0d0d0f]">
          
          {/* Decorative Mesh Gradient Background - Адаптивный от последнего достижения */}
          <div 
            className="absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-all duration-1000"
            style={{ 
              backgroundColor: recentAchievements[0]?.isUnlocked 
                ? getGlowFromColorClass(recentAchievements[0].color_class).replace('0.3', '0.05') 
                : 'rgba(255, 255, 255, 0.02)' 
            }}
          />
          <div 
            className="absolute -bottom-10 -left-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none transition-all duration-1000"
            style={{ 
              backgroundColor: recentAchievements[0]?.isUnlocked 
                ? getGlowFromColorClass(recentAchievements[0].color_class).replace('0.3', '0.02') 
                : 'rgba(255, 255, 255, 0.01)' 
            }}
          />
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              {/* Trophy Icon with dynamic glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 p-[1px] shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <div className="w-full h-full rounded-[15px] bg-[#0d0d0f] flex items-center justify-center relative overflow-hidden">
                    <Trophy className="w-6 h-6 text-white/40 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-white font-oswald uppercase tracking-tight leading-none mb-1.5 italic">
                  Достижения
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] font-sans">Level Mastery</span>
                </div>
              </div>
            </div>

            {/* Stats Badge */}
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1 bg-white/5 rounded-xl px-3 py-1 border border-white/5">
                <span className="text-xl font-oswald font-black text-white leading-none tracking-tighter">
                  {stats?.unlocked || 0}
                </span>
                <span className="text-xs font-oswald font-bold text-white/20">/</span>
                <span className="text-xs font-oswald font-bold text-white/30">
                  {stats?.total || 0}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">{stats?.percentage || 0}%</span>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
            </div>
          </div>

          {/* Achievements Grid - 3 Premium Slots */}
          <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-[24px] bg-white/[0.02] animate-pulse border border-white/5" />
              ))
            ) : (
              <>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const achievement = recentAchievements[idx]
                  const isSecret = achievement?.is_secret && !achievement?.isUnlocked
                  const hasReward = !!achievement?.reward_amount

                  return (
                    <div 
                      key={idx}
                      onClick={(e) => {
                        if (achievement) {
                          e.stopPropagation()
                          handleOpenPopup(achievement.id)
                        }
                      }}
                      className={cn(
                        "group/slot relative aspect-square transition-all duration-500",
                        achievement 
                          ? "hover:scale-105"
                          : "rounded-[24px] bg-white/[0.05] border border-dashed border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-full h-full flex flex-col items-center justify-center transition-all duration-500 relative",
                        !achievement && "bg-[#0d0d0f]/50 rounded-[23px]"
                      )}>
                        {achievement ? (
                          <>
                            <div className="w-full h-full filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover/slot:-translate-y-1 transition-transform duration-500 relative flex items-center justify-center">
                              {/* Background / Unfilled */}
                              <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-all duration-700 grayscale brightness-[0.8]",
                                isSecret && "opacity-10 blur-[3px]",
                                !isSecret && "opacity-20"
                              )}>
                                {achievement.icon_url ? (
                                  <img 
                                    src={achievement.icon_url} 
                                    alt={achievement.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-8xl flex items-center justify-center">
                                    {achievement.icon}
                                  </span>
                                )}
                              </div>

                              {/* Question Mark for Secret */}
                              {isSecret && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                  <span className="text-2xl font-black text-white/20 font-oswald">?</span>
                                </div>
                              )}

                              {/* Shine Effect for COMPLETED Achievements only - Contained in a circle to avoid corners */}
                              {achievement.isUnlocked && (
                                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
                                  <div className="absolute inset-0 w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine -top-[50%]" />
                                </div>
                              )}

                              {/* Unlocked / Colored */}
                              {achievement.isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 z-10">
                                  {/* Мягкое адаптивное свечение */}
                                  <div 
                                    className="absolute inset-0 blur-2xl opacity-40 scale-150 rounded-full transition-all duration-1000"
                                    style={{ backgroundColor: getGlowFromColorClass(achievement.color_class) }}
                                  />
                                  
                                  {achievement.icon_url ? (
                                    <img 
                                      src={achievement.icon_url} 
                                      alt={achievement.title}
                                      className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.05)]"
                                    />
                                  ) : (
                                    <span className="text-8xl flex items-center justify-center">
                                      {achievement.icon}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 justify-center w-full">
                              {achievement.isUnlocked && (
                                <div className="relative flex items-center justify-center shrink-0">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                  <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
                                </div>
                              )}
                              <span className="text-[10px] text-white/40 font-black uppercase text-center font-oswald tracking-tight px-2 line-clamp-1">
                                {achievement.title}
                              </span>
                            </div>
                          </>
                        ) : (
                          <Award className="w-8 h-8 text-white/[0.03] group-hover/slot:scale-110 transition-transform" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* Sophisticated Progress Bar */}
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-end px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-white/20" />
                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Evolution Track</span>
              </div>
              <span className="text-[10px] font-oswald font-black text-white/40 tracking-wider">{stats?.percentage || 0}%</span>
            </div>
            
            <div className="relative h-2.5 w-full bg-[#121215] rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.percentage || 0}%` }}
                transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                className="h-full bg-gradient-to-r from-white/40 via-white/20 to-white/40 relative rounded-full"
              >
                {/* Moving Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                {/* Edge Glow */}
                <div className="absolute top-0 bottom-0 right-0 w-6 bg-white/5 blur-sm" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AchievementsPopup 
        isOpen={isPopupOpen} 
        onClose={handleClosePopup}
        initialAchievementId={selectedAchievementId}
      />
    </>
  )
}
