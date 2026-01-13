'use client'

import { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Loader2, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementsPopup } from './achievements-popup'
import { useRecentAchievements, useAchievementStats } from '../hooks/use-achievements'
import { createClient } from '@/lib/supabase/client'

export const AchievementsCard = memo(function AchievementsCard() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
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

  return (
    <>
      <div 
        onClick={() => setIsPopupOpen(true)}
        className="group relative cursor-pointer active:scale-[0.99] transition-all duration-300 w-full"
      >
        {/* Glow behind the card */}
        <div className="absolute -inset-[2px] bg-gradient-to-b from-green-500/20 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md" />
        
        {/* Main Glass Container */}
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0c] p-5 shadow-2xl transition-all duration-300 group-hover:border-white/20 group-hover:bg-[#0d0d0f]">
          
          {/* Decorative Mesh Gradient Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/[0.04] blur-[80px] rounded-full pointer-events-none group-hover:bg-green-500/[0.08] transition-colors duration-700" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/[0.03] blur-[60px] rounded-full pointer-events-none" />
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              {/* Trophy Icon with dynamic glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 p-[1px] shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <div className="w-full h-full rounded-[15px] bg-[#0d0d0f] flex items-center justify-center relative overflow-hidden">
                    <Trophy className="w-6 h-6 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-white font-oswald uppercase tracking-tight leading-none mb-1.5 italic">
                  Достижения
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
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
                <span className="text-[9px] text-green-400 font-black uppercase tracking-widest">{stats?.percentage || 0}%</span>
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
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "group/slot relative aspect-square rounded-[24px] p-[1.5px] transition-all duration-500",
                        achievement 
                          ? "bg-gradient-to-b from-white/20 via-transparent to-transparent hover:scale-105"
                          : "bg-white/[0.05] border border-dashed border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-full h-full rounded-[23px] flex flex-col items-center justify-center transition-all duration-500",
                        achievement 
                          ? "bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[inset_0_4px_12px_rgba(255,255,255,0.05)] backdrop-blur-md"
                          : "bg-[#0d0d0f]/50"
                      )}>
                        {achievement ? (
                          <>
                            <div className="text-3xl mb-1.5 filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover/slot:-translate-y-1 transition-transform duration-500">
                              {achievement.icon}
                            </div>
                            <span className="text-[8px] text-white/40 font-black uppercase text-center font-oswald tracking-tight px-2 line-clamp-1">
                              {achievement.title}
                            </span>
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
                <Sparkles className="w-3.5 h-3.5 text-green-500/40" />
                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Evolution Track</span>
              </div>
              <span className="text-[10px] font-oswald font-black text-green-400 tracking-wider">{stats?.percentage || 0}%</span>
            </div>
            
            <div className="relative h-2.5 w-full bg-[#121215] rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.percentage || 0}%` }}
                transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 relative rounded-full"
              >
                {/* Moving Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                {/* Edge Glow */}
                <div className="absolute top-0 bottom-0 right-0 w-6 bg-white/10 blur-sm" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AchievementsPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  )
})
