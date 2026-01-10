'use client'

import { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Trophy, Eye, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HealthTrackerCard } from './health-tracker-card'
import { AchievementsPopup } from './achievements-popup'
import { useRecentAchievements, useAchievementStats } from '../hooks/use-achievements'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

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
  const error = !userId ? 'Необходимо авторизоваться' : null

  const handlePopupClose = () => {
    setIsPopupOpen(false)
  }

  return (
    <>
      <HealthTrackerCard
        title="Достижения"
        subtitle="Твои победы"
        icon={Award}
        iconColor="text-green-400"
        iconBg="bg-green-500/10"
        className="gap-4 cursor-pointer"
        onClick={() => setIsPopupOpen(true)}
        rightAction={
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsPopupOpen(true)
            }}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Посмотреть все достижения"
          >
            <Eye className="w-4 h-4 text-white/60 hover:text-white/80 transition-colors" />
          </button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {recentAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-white/40">Пока нет достижений</p>
                  <p className="text-[9px] text-white/30 mt-1">
                    Заполняй дневник, чтобы получить первое достижение!
                  </p>
                </div>
              ) : (
                recentAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.unlockedAt ? `${achievement.unlockedAt}-${idx}` : idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {achievement.title}
                        </h4>
                        {achievement.reward_amount && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                            +{achievement.reward_amount} 👟
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-white/40 uppercase tracking-tight truncate">
                        {achievement.description}
                      </p>
                      {achievement.unlockedAt && (
                        <p className="text-[8px] text-green-400 mt-0.5">
                          Получено {format(new Date(achievement.unlockedAt), 'd MMM', { locale: ru })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/10 relative overflow-hidden">
              <Trophy className="absolute -right-2 -bottom-2 w-12 h-12 text-white/5 rotate-12" />
              <div className="relative z-10">
                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">
                  Прогресс
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <div className="text-lg font-oswald font-black text-white leading-none">
                      {stats?.unlocked || 0} / {stats?.total || 0}
                    </div>
                    <div className="text-[7px] text-white/40 uppercase font-bold">
                      Получено достижений
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <div className="text-lg font-oswald font-black text-green-400 leading-none">
                      {stats?.percentage || 0}%
                    </div>
                    <div className="text-[7px] text-white/40 uppercase font-bold">
                      Завершено
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </HealthTrackerCard>

      <AchievementsPopup isOpen={isPopupOpen} onClose={handlePopupClose} />
    </>
  )
})
