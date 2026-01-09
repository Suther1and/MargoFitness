"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Camera, Scale, TrendingDown, Calendar, TrendingUp, Trash2, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useProgressPhotos } from "../../hooks/use-progress-photos"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { WeeklyPhotoSet, PhotoType } from "@/types/database"

interface StatsPhotosProps {
  dateRange: { start: Date; end: Date }
  userId: string | null
}

export function StatsPhotos({ dateRange, userId }: StatsPhotosProps) {
  const { weeklyPhotoSets, isLoading, deletePhoto, isDeleting } = useProgressPhotos({ userId })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [lightboxData, setLightboxData] = useState<{
    photoUrl: string
    weekSet: WeeklyPhotoSet
    photoType: PhotoType
  } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [displayedWeeks, setDisplayedWeeks] = useState(12) // Начинаем с 12 недель
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Блокируем скролл страницы когда lightbox открыт
  useEffect(() => {
    if (lightboxData) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [lightboxData])

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedWeeks < weeklyPhotoSets.length) {
          setDisplayedWeeks(prev => Math.min(prev + 8, weeklyPhotoSets.length))
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => observer.disconnect()
  }, [displayedWeeks, weeklyPhotoSets.length])

  // Фильтруем фото по диапазону дат
  const filteredWeeks = weeklyPhotoSets.filter(weekSet => {
    const weekDate = new Date(weekSet.week_key)
    return weekDate >= dateRange.start && weekDate <= dateRange.end
  })

  // Берем только нужное количество для отображения
  const displayedWeeksSets = filteredWeeks.slice(0, displayedWeeks)

  // Статистика по весу
  const weightsWithValues = filteredWeeks.filter(w => w.weight).map(w => w.weight!)
  const firstWeight = weightsWithValues.length > 0 ? weightsWithValues[weightsWithValues.length - 1] : null
  const lastWeight = weightsWithValues.length > 0 ? weightsWithValues[0] : null
  const weightChange = firstWeight && lastWeight ? lastWeight - firstWeight : 0

  const handleDelete = (weekKey: string, photoType: PhotoType) => {
    const confirmKey = `${weekKey}_${photoType}`
    
    if (deleteConfirm === confirmKey) {
      deletePhoto({ weekKey, photoType })
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(confirmKey)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/60">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (filteredWeeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Camera className="w-16 h-16 text-white/10" />
        <div className="text-center">
          <div className="text-white/60 font-medium mb-2">Фото еще нет</div>
          <div className="text-white/40 text-sm">Добавьте первое фото прогресса в дневнике</div>
        </div>
      </div>
    )
  }

  const lightboxContent = lightboxData && mounted && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
        onClick={() => setLightboxData(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full md:w-auto md:h-auto md:max-w-[95vw] md:max-h-[95vh] md:rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={lightboxData.photoUrl}
            alt="Full size photo"
            className="w-full h-full md:max-w-[95vw] md:max-h-[95vh] md:w-auto md:h-auto object-contain md:rounded-3xl"
          />
          
          {/* Крестик закрытия */}
          <button
            onClick={() => setLightboxData(null)}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-zinc-800/95 hover:bg-zinc-900 backdrop-blur-sm transition-all z-[100] touch-manipulation shadow-lg border border-white/10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* Метаданные */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 z-20"
          >
            <motion.div 
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-xl"
            >
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm font-black uppercase tracking-wider text-white/90">
                {lightboxData.weekSet.week_label}
              </span>
            </motion.div>
            
            {lightboxData.weekSet.weight && (
              <motion.div 
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-400/20 shadow-xl"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black text-white tabular-nums">
                  {lightboxData.weekSet.weight.toFixed(1)} кг
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )

  return (
    <>
      {lightboxContent}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start"
      >
        {/* Левая колонка - Статистика (5 колонок) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Общая статистика */}
          <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-pink-500/20 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <Camera className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогресс</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-white/60 font-medium mb-1">Недель</div>
                <div className="text-3xl font-black text-white">{filteredWeeks.length}</div>
              </div>
              {firstWeight && (
                <div>
                  <div className="text-sm text-white/60 font-medium mb-1">Было</div>
                  <div className="text-xl font-black text-white tabular-nums">{firstWeight.toFixed(1)} кг</div>
                </div>
              )}
              {lastWeight && (
                <div>
                  <div className="text-sm text-white/60 font-medium mb-1">Стало</div>
                  <div className="text-xl font-black text-white tabular-nums">{lastWeight.toFixed(1)} кг</div>
                </div>
              )}
            </div>

            {weightChange !== 0 && (
              <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-sm text-white/70 font-medium">Изменение веса</span>
                <div className="flex items-center gap-2">
                  {weightChange < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  )}
                  <span className={cn(
                    "text-lg font-black tabular-nums",
                    weightChange < 0 ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} кг
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Правая колонка - Галерея по неделям (7 колонок) */}
        <div className="lg:col-span-7 space-y-4">
          {displayedWeeksSets.map((weekSet, weekIndex) => {
            const photoTypes: PhotoType[] = ['front', 'side', 'back']
            
            return (
              <motion.div
                key={weekSet.week_key}
                variants={item}
                className="p-5 rounded-2xl bg-white/5 border border-white/5"
              >
                {/* Заголовок недели */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      {weekSet.week_label}
                    </span>
                  </div>
                  {weekSet.weight && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 self-start sm:self-auto">
                      <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      <span className="text-xs sm:text-sm font-black text-amber-400 tabular-nums">
                        {weekSet.weight.toFixed(1)} кг
                      </span>
                    </div>
                  )}
                </div>

                {/* Сетка из 3 фото */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {photoTypes.map((photoType) => {
                    const photo = weekSet.photos[photoType]
                    const hasPhoto = !!photo
                    const confirmKey = `${weekSet.week_key}_${photoType}`
                    const isConfirming = deleteConfirm === confirmKey
                    
                    const labels: Record<PhotoType, string> = {
                      front: 'Профиль',
                      side: 'Бок',
                      back: 'Спина'
                    }

                    return (
                      <div key={photoType} className="space-y-1.5 sm:space-y-2">
                        <div className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider text-center">
                          {labels[photoType]}
                        </div>
                        
                        {hasPhoto ? (
                          <motion.div
                            layoutId={`photo-${weekSet.week_key}-${photoType}`}
                            className="relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-white/5 group cursor-pointer"
                            onClick={() => setLightboxData({
                              photoUrl: photo.url,
                              weekSet,
                              photoType
                            })}
                          >
                            <Image
                              src={photo.url}
                              alt={`${labels[photoType]} ${weekSet.week_label}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            
                            {/* Градиент overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Кнопка удаления */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(weekSet.week_key, photoType)
                              }}
                              disabled={isDeleting}
                              className={cn(
                                "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded-md sm:rounded-lg backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100",
                                isConfirming 
                                  ? "bg-red-500/90 scale-110 opacity-100" 
                                  : "bg-black/40 hover:bg-black/60",
                                isDeleting && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <Trash2 className={cn(
                                "w-2.5 h-2.5 sm:w-3 sm:h-3",
                                isConfirming ? "text-white" : "text-white/70"
                              )} />
                            </button>
                          </motion.div>
                        ) : (
                          <div className="aspect-[3/4] rounded-lg sm:rounded-xl bg-white/5 border border-dashed border-white/5 flex items-center justify-center opacity-30">
                            <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

          {/* Observer target для infinite scroll */}
          {displayedWeeks < filteredWeeks.length && (
            <div ref={observerTarget} className="py-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Сообщение о конце списка */}
          {displayedWeeks >= filteredWeeks.length && filteredWeeks.length > 12 && (
            <div className="py-4 text-center text-sm text-white/40">
              Все недели загружены
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
