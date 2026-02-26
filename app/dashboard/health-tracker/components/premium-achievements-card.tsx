'use client'

import { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, ChevronRight, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementsPopup } from './achievements-popup'
import { useRecentAchievements, useAchievementStats } from '../hooks/use-achievements'
import { createClient } from '@/lib/supabase/client'

export const PremiumAchievementsCard = memo(function PremiumAchievementsCard() {
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
  const { data: allAchievements = [] } = useAllAchievements(userId)

  const hasMentorAchievement = allAchievements.some(a => 
    a.isUnlocked && 
    (a.metadata as any)?.type === 'referral_mentor'
  )

  const isLoading = loadingRecent || loadingStats

  return (
    <>
      <div 
        onClick={() => setIsPopupOpen(true)}
        className="w-full relative group cursor-pointer active:scale-[0.99] transition-all duration-500"
      >
        {/* Professional Premium Styles */}
        <style jsx>{`
          .premium-container {
            background: linear-gradient(165deg, #121212 0%, #0a0a0a 40%, #000000 100%);
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.05);
          }
          .premium-contour {
            position: absolute;
            inset: 0;
            opacity: 0.05;
            background-image: url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100 M0 200 Q 100 150 200 200 T 400 200 M0 300 Q 100 250 200 300 T 400 300' stroke='%2310b981' fill='none' stroke-width='1'/%3E%3C/svg%3E");
            background-size: 100% 100%;
            z-index: 1;
          }
          .premium-glow-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
            pointer-events: none;
            z-index: 2;
          }
          .premium-container::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 2.5rem;
            padding: 1px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 40%, transparent);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 5;
          }
          .glow-point {
            position: absolute;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
            pointer-events: none;
            z-index: 2;
          }
        `}</style>

        <div className="premium-container w-full rounded-[2.5rem] flex flex-col min-h-[340px] overflow-hidden">
          <div className="premium-contour" />
          <div className="premium-glow-center" />
          <div className="glow-point -top-10 -right-10" />
          <div className="glow-point -bottom-20 -left-10" />

          {/* Header Area */}
          <div className="p-6 pb-4 relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Trophy className="w-5 h-5 text-emerald-500/80" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 font-montserrat leading-none mb-1">
                  Личные успехи
                </span>
                <h2 className="text-xl font-black font-oswald text-white uppercase tracking-tight leading-none italic">
                  Достижения
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-black font-oswald text-white leading-none tracking-tighter">
                {stats?.unlocked || 0}<span className="text-white/20 ml-0.5 text-sm">/</span><span className="text-white/20 text-sm font-bold">{stats?.total || 0}</span>
              </span>
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">
                разблокировано
              </span>
            </div>
          </div>

          {/* Achievements List - Vertical (3 in 3 rows) */}
          <div className="px-6 flex-1 flex flex-col gap-2 relative z-10 mt-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/[0.02] animate-pulse border border-white/5" />
              ))
            ) : (
              recentAchievements.length > 0 ? (
                recentAchievements.map((achievement, idx) => (
                  <div 
                    key={idx}
                    className="group/item flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10"
                  >
                    <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110">
                      {achievement.icon_url ? (
                        <img 
                          src={achievement.icon_url} 
                          alt={achievement.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{achievement.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-white/90 truncate font-montserrat tracking-tight leading-none mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-[10px] text-white/30 font-medium truncate font-montserrat uppercase tracking-wider">
                        {achievement.description || 'Выполнено'}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                       <Award className="w-3.5 h-3.5 text-emerald-500/40" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-8">
                  <Target className="w-12 h-12 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Нет достижений</span>
                </div>
              )
            )}
          </div>

          {/* Mastership Progress - Integrated at the bottom */}
          <div className="p-6 pt-4 mt-auto relative z-10">
            <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 font-montserrat">
                    Общий прогресс
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black font-oswald text-white leading-none">
                    {stats?.percentage || 0}
                  </span>
                  <span className="text-[10px] font-black font-oswald text-emerald-500">%</span>
                </div>
              </div>

              <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.percentage || 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 relative rounded-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                </motion.div>
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-1.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors group/more">
                <span>Подробная статистика</span>
                <ChevronRight className="w-3 h-3 transition-transform group-hover/more:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

        <AchievementsPopup 
          isOpen={isPopupOpen} 
          onClose={() => {
            setIsPopupOpen(false)
          }} 
        />
    </>
  )
})
