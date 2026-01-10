"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Camera, Scale, TrendingDown, Calendar, TrendingUp, Trash2, X, Ruler } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useProgressPhotos } from "../../hooks/use-progress-photos"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { WeeklyPhotoSet, PhotoType } from "@/types/database"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StatsPhotosProps {
  dateRange: { start: Date; end: Date }
  userId: string | null
}

export function StatsPhotos({ dateRange, userId }: StatsPhotosProps) {
  const { weeklyPhotoSets, isLoading, deletePhoto, isDeleting } = useProgressPhotos({ userId, dateRange })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [lightboxData, setLightboxData] = useState<{
    photoUrl: string
    weekSet: WeeklyPhotoSet
    photoType: PhotoType
  } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [displayedWeeks, setDisplayedWeeks] = useState(4) // Начинаем с 4 недель
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Блокируем скролл страницы когда lightbox открыт
  useEffect(() => {
    if (lightboxData) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxData])

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedWeeks < weeklyPhotoSets.length) {
          setDisplayedWeeks(prev => Math.min(prev + 4, weeklyPhotoSets.length))
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => observer.disconnect()
  }, [displayedWeeks, weeklyPhotoSets.length])

  // Фильтруем фото по диапазону дат (проверяем пересечение недели с диапазоном)
  const filteredWeeks = weeklyPhotoSets.filter(weekSet => {
    // Парсим weekKey как локальную дату (понедельник недели)
    const [year, month, day] = weekSet.week_key.split('-').map(Number)
    const weekStart = new Date(year, month - 1, day)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Воскресенье
    
    // Неделя попадает в диапазон, если есть пересечение
    // Неделя начинается до конца диапазона И заканчивается после начала диапазона
    return weekStart <= dateRange.end && weekEnd >= dateRange.start
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
            
            {lightboxData.weekSet.hasMeasurements && (
              <motion.div 
                className="hidden sm:flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-violet-500/20 shadow-xl"
              >
                <Ruler className="w-5 h-5 text-violet-400" />
                <div className="flex items-center gap-6">
                  {lightboxData.weekSet.measurements?.chest && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1.5">Грудь</span>
                      <span className="text-xl font-black text-white tabular-nums leading-none">{lightboxData.weekSet.measurements.chest}</span>
                    </div>
                  )}
                  {lightboxData.weekSet.measurements?.waist && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1.5">Талия</span>
                      <span className="text-xl font-black text-white tabular-nums leading-none">{lightboxData.weekSet.measurements.waist}</span>
                    </div>
                  )}
                  {lightboxData.weekSet.measurements?.hips && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1.5">Бедра</span>
                      <span className="text-xl font-black text-white tabular-nums leading-none">{lightboxData.weekSet.measurements.hips}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
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
        className="space-y-6"
      >
        {/* Верхняя строка: График + Статистика */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* График замеров */}
          {filteredWeeks.some(w => w.hasMeasurements) ? (
            <motion.div variants={item} className="lg:col-span-8 rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">График замеров</h3>
                  <p className="text-xs text-white/40">Изменение объемов тела по неделям</p>
                </div>
              </div>

              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredWeeks
                      .filter(w => w.hasMeasurements)
                      .reverse()
                      .map(w => ({
                        week: w.week_label.split(' ').slice(0, 2).join(' '),
                        chest: w.measurements?.chest,
                        waist: w.measurements?.waist,
                        hips: w.measurements?.hips
                      }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#ffffff40"
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke="#ffffff40"
                      style={{ fontSize: '11px' }}
                      label={{ value: 'см', angle: -90, position: 'insideLeft', style: { fill: '#ffffff40', fontSize: '10px' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a24',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(value) => {
                        const labels: Record<string, string> = { chest: 'Грудь', waist: 'Талия', hips: 'Бедра' }
                        return labels[value] || value
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="chest" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', r: 4 }}
                      connectNulls
                    />
                    <Line 
                      type="monotone" 
                      dataKey="waist" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7', r: 4 }}
                      connectNulls
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hips" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ) : (
            <div className="lg:col-span-8 hidden lg:block" />
          )}

          {/* Общая статистика (Карточка прогресса) */}
          <motion.div variants={item} className="lg:col-span-4 p-6 rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-pink-500/20 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                  <Camera className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогресс</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Недель</div>
                  <div className="text-2xl font-black text-white">{filteredWeeks.length}</div>
                </div>
                {firstWeight && (
                  <div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Было</div>
                    <div className="text-lg font-black text-white tabular-nums">{firstWeight.toFixed(1)}</div>
                  </div>
                )}
                {lastWeight && (
                  <div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Стало</div>
                    <div className="text-lg font-black text-white tabular-nums">{lastWeight.toFixed(1)}</div>
                  </div>
                )}
              </div>
            </div>

            {weightChange !== 0 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Изменение</span>
                <div className="flex items-center gap-2">
                  {weightChange < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  )}
                  <span className={cn(
                    "text-xl font-black tabular-nums",
                    weightChange < 0 ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} кг
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Сетка фото: 2 в ряд на десктопе */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedWeeksSets.map((weekSet) => {
            const photoTypes: PhotoType[] = ['front', 'side', 'back']
            
            return (
              <motion.div
                key={weekSet.week_key}
                variants={item}
                className="p-5 rounded-[2.5rem] bg-[#121214]/60 border border-white/10 hover:border-white/20 transition-colors"
              >
                {/* Заголовок недели */}
                <div className="flex items-center justify-between gap-2 mb-5 flex-nowrap">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-tight truncate">
                      {weekSet.week_label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {weekSet.weight && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-black text-amber-400 tabular-nums">
                          {weekSet.weight.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {weekSet.hasMeasurements && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <Ruler className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[11px] font-black text-violet-400 tabular-nums uppercase tracking-tight whitespace-nowrap">
                          {weekSet.measurements?.chest && `Г:${weekSet.measurements.chest}`}
                          {weekSet.measurements?.waist && ` Т:${weekSet.measurements.waist}`}
                          {weekSet.measurements?.hips && ` Б:${weekSet.measurements.hips}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Сетка из 3 фото */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {photoTypes.map((photoType) => {
                    const photo = weekSet.photos[photoType]
                    const hasPhoto = !!photo
                    const confirmKey = `${weekSet.week_key}_${photoType}`
                    const isConfirming = deleteConfirm === confirmKey
                    
                    const labels: Record<PhotoType, string> = {
                      front: 'Профиль',
                      side: 'Сбоку',
                      back: 'Спина'
                    }

                    return (
                      <div key={photoType} className="space-y-2">
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] text-center">
                          {labels[photoType]}
                        </div>
                        
                        {hasPhoto ? (
                          <motion.div
                            layoutId={`photo-${weekSet.week_key}-${photoType}`}
                            className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-white/5 group cursor-pointer"
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
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                                "absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all z-10 opacity-0 group-hover:opacity-100",
                                isConfirming 
                                  ? "bg-red-500/90 scale-110 opacity-100" 
                                  : "bg-black/40 hover:bg-black/60",
                                isDeleting && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <Trash2 className={cn(
                                "w-3 h-3",
                                isConfirming ? "text-white" : "text-white/70"
                              )} />
                            </button>
                          </motion.div>
                        ) : (
                          <div className="aspect-[3/4] rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center opacity-30">
                            <Camera className="w-5 h-5 text-white/10" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Навигация и сообщения */}
        <div className="space-y-4">
          {/* Observer target для infinite scroll */}
          {displayedWeeks < filteredWeeks.length && (
            <div ref={observerTarget} className="py-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Сообщение о конце списка */}
          {displayedWeeks >= filteredWeeks.length && filteredWeeks.length > 4 && (
            <div className="py-4 text-center text-sm text-white/40 font-medium">
              Все недели загружены
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
