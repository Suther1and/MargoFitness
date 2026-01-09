"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Camera, Scale, TrendingDown, Calendar, TrendingUp, Trash2, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useProgressPhotos } from "../../hooks/use-progress-photos"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface StatsPhotosProps {
  dateRange: { start: Date; end: Date }
  userId: string | null
}

export function StatsPhotos({ dateRange, userId }: StatsPhotosProps) {
  const { photos, isLoading, deletePhoto, isDeleting } = useProgressPhotos({ userId })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    url: string
    date: string
    weight: number | null
  } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Блокируем скролл страницы когда lightbox открыт
  useEffect(() => {
    if (lightboxPhoto) {
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
  }, [lightboxPhoto])

  // Фильтруем фото по диапазону дат
  const filteredPhotos = photos.filter(photo => {
    const photoDate = parseISO(photo.date)
    return photoDate >= dateRange.start && photoDate <= dateRange.end
  })

  // Фото только с весом для расчета статистики
  const photosWithWeight = filteredPhotos.filter(p => p.weight !== null)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/40">Загрузка...</div>
      </div>
    )
  }

  if (filteredPhotos.length === 0) {
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

  const firstPhoto = photosWithWeight[photosWithWeight.length - 1]
  const lastPhoto = photosWithWeight[0]
  const weightChange = firstPhoto && lastPhoto ? lastPhoto.weight! - firstPhoto.weight! : 0
  const hasWeightData = photosWithWeight.length > 0

  const handleDelete = (date: string, url: string) => {
    if (deleteConfirm === `${date}_${url}`) {
      deletePhoto({ date, url })
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(`${date}_${url}`)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: ru })
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  }

  const lightboxContent = lightboxPhoto && mounted && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
        onClick={() => setLightboxPhoto(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full md:w-auto md:h-auto md:max-w-[95vw] md:max-h-[95vh] md:rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={lightboxPhoto.url}
            alt="Full size photo"
            className="w-full h-full md:max-w-[95vw] md:max-h-[95vh] md:w-auto md:h-auto object-contain md:rounded-3xl"
          />
          
          {/* Крестик закрытия */}
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-zinc-800/95 hover:bg-zinc-900 backdrop-blur-sm transition-all z-[100] touch-manipulation shadow-lg border border-white/10"
            style={{ touchAction: 'manipulation' }}
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-xl"
            >
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm font-black uppercase tracking-wider text-white/90">
                {formatDate(lightboxPhoto.date)}
              </span>
            </motion.div>
            
            {lightboxPhoto.weight !== null && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-400/20 shadow-xl"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black text-white tabular-nums">
                  {Number(lightboxPhoto.weight).toFixed(1)} кг
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
        className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
      >
      <div className="space-y-6">
        {/* Статистика изменений */}
        <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-pink-500/20 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
              <Camera className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогресс</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-white/60 font-medium mb-1">Всего фото</div>
              <div className="text-3xl font-black text-white">{filteredPhotos.length}</div>
            </div>
            {hasWeightData && firstPhoto && (
              <div>
                <div className="text-sm text-white/60 font-medium mb-1">Первое</div>
                <div className="text-xl font-black text-white tabular-nums">{firstPhoto.weight} кг</div>
              </div>
            )}
            {hasWeightData && lastPhoto && (
              <div>
                <div className="text-sm text-white/60 font-medium mb-1">Последнее</div>
                <div className="text-xl font-black text-white tabular-nums">{lastPhoto.weight} кг</div>
              </div>
            )}
          </div>

          {hasWeightData && weightChange !== 0 && (
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

        {/* Временная линия */}
        {photosWithWeight.length > 0 && (
          <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Scale className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">Динамика веса</span>
            </div>

            <div className="space-y-2">
              {photosWithWeight.slice().reverse().map((photo, index) => {
                const prevPhoto = index > 0 ? photosWithWeight[photosWithWeight.length - index] : null
                const diff = prevPhoto && photo.weight && prevPhoto.weight ? photo.weight - prevPhoto.weight : 0
                
                return (
                  <div key={photo.id} className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                      <Image src={photo.url} alt="" width={48} height={64} className="object-cover w-full h-full" unoptimized />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-white/60 font-medium">{formatDate(photo.date)}</div>
                      <div className="text-sm font-black text-white tabular-nums">{photo.weight} кг</div>
                    </div>
                    {index > 0 && diff !== 0 && (
                      <div className={cn(
                        "text-xs font-bold tabular-nums",
                        diff < 0 ? "text-emerald-400" : "text-amber-400"
                      )}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} кг
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        {/* Галерея фото */}
        <div className="grid grid-cols-2 gap-3">
          {filteredPhotos.map((photo, index) => {
            const isConfirming = deleteConfirm === `${photo.date}_${photo.url}`
            const firstWeightPhoto = photosWithWeight[photosWithWeight.length - 1]
            const weightDiff = photo.weight && firstWeightPhoto?.weight 
              ? photo.weight - firstWeightPhoto.weight 
              : null
            
            return (
              <motion.div
                key={photo.id}
                variants={item}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5 group cursor-pointer"
                onClick={() => setLightboxPhoto({
                  url: photo.url,
                  date: photo.date,
                  weight: photo.weight
                })}
              >
                <Image
                  src={photo.url}
                  alt={`Progress ${photo.date}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                
                {/* Градиент overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Кнопка удаления */}
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Предотвращаем открытие lightbox
                    handleDelete(photo.date, photo.url)
                  }}
                  disabled={isDeleting}
                  className={cn(
                    "absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all z-10",
                    isConfirming 
                      ? "bg-red-500/90 scale-110" 
                      : "bg-black/40 opacity-0 group-hover:opacity-100",
                    isDeleting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Trash2 className={cn(
                    "w-4 h-4",
                    isConfirming ? "text-white" : "text-white/80"
                  )} />
                </button>

                {/* Информация */}
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white/60 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {formatDate(photo.date)}
                  </div>
                  <div className="flex items-center justify-between">
                    {photo.weight !== null ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-amber-400" />
                          <span className="text-xl font-black text-white tabular-nums">
                            {photo.weight} <span className="text-sm text-white/40">кг</span>
                          </span>
                        </div>
                        {weightDiff !== null && weightDiff !== 0 && (
                          <div className={cn(
                            "px-2 py-0.5 rounded-full border",
                            weightDiff < 0 
                              ? "bg-emerald-500/20 border-emerald-500/30" 
                              : "bg-amber-500/20 border-amber-500/30"
                          )}>
                            <span className={cn(
                              "text-xs font-black tabular-nums",
                              weightDiff < 0 ? "text-emerald-400" : "text-amber-400"
                            )}>
                              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-white/40">Вес не указан</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
    </>
  )
}

