'use client'

import { Camera, Plus, Trash2, Loader2, RefreshCw, HelpCircle } from 'lucide-react'
import { useProgressPhotos } from '../hooks/use-progress-photos'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { PhotoType, getWeekKey, getWeekLabel } from '@/types/database'
import { ProgressUploadDialog } from './progress-upload-dialog'

interface DailyPhotosCardProps {
  userId: string | null
  selectedDate: Date
}

const PHOTO_SLOTS: { type: PhotoType; label: string }[] = [
  { type: 'front', label: 'Профиль' },
  { type: 'side', label: 'Сбоку' },
  { type: 'back', label: 'Спина' },
]

export function DailyPhotosCard({ userId, selectedDate }: DailyPhotosCardProps) {
  const { 
    currentWeekPhotos, 
    uploadPhoto, 
    replacePhoto,
    deletePhoto, 
    isUploading, 
    uploadProgress, 
    isDeleting,
    getCurrentWeekPhotoCount,
    updateMeasurements,
    isUpdatingMeasurements
  } = useProgressPhotos({ userId, selectedDate })
  
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const weekKey = getWeekKey(selectedDate)
  const weekLabel = getWeekLabel(weekKey)
  const photoCount = getCurrentWeekPhotoCount()

  // Подсчет замеров
  const measurementCount = currentWeekPhotos ? 
    [currentWeekPhotos.measurements?.chest, currentWeekPhotos.measurements?.waist, currentWeekPhotos.measurements?.hips]
      .filter(m => m !== undefined).length 
    : 0

  const handleDelete = (photoType: PhotoType) => {
    const confirmKey = `${weekKey}_${photoType}`
    
    if (deleteConfirm === confirmKey) {
      deletePhoto({ weekKey, photoType })
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(confirmKey)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleCardClick = () => {
    setDialogOpen(true)
  }

  return (
    <>
      <ProgressUploadDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        weekKey={weekKey}
        weekLabel={weekLabel}
        currentPhotos={currentWeekPhotos ?? null}
        onUploadPhoto={(file, type) => uploadPhoto({ file, photoType: type })}
        onDeletePhoto={(type) => deletePhoto({ weekKey, photoType: type })}
        onSaveMeasurements={(measurements) => updateMeasurements({ measurements })}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
      
      <div 
        className="rounded-[2.5rem] border border-white/5 bg-[#121214]/90 md:bg-[#121214]/40 md:backdrop-blur-xl p-5 md:p-6 hover:border-white/10 transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Фото прогресса</h3>
              <span className="text-[10px] md:text-xs text-white/40 font-medium">{weekLabel}</span>
            </div>
          </div>
        </div>

        {/* Индикатор прогресса */}
        <div className="mb-4 space-y-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Фото
              </span>
              <span className="text-sm font-black text-white tabular-nums">
                {photoCount}/3
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(photoCount / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Замеры
              </span>
              <span className="text-sm font-black text-white tabular-nums">
                {measurementCount}/3
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(measurementCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-xs text-red-400 font-medium">{error}</div>
          </div>
        )}

        {isUploading && (
          <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
              <span className="text-xs text-white/60 font-medium">Загрузка {uploadProgress}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-pink-400 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Слоты для фото */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {PHOTO_SLOTS.map((slot) => {
            const photo = currentWeekPhotos?.photos[slot.type]
            const hasPhoto = !!photo
            const confirmKey = `${weekKey}_${slot.type}`
            const isConfirming = deleteConfirm === confirmKey

            return (
              <div key={slot.type} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                    {slot.label}
                  </span>
                </div>

                {hasPhoto ? (
                  <div 
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image 
                      src={photo.url} 
                      alt={`${slot.label} photo`} 
                      fill
                      className="object-cover" 
                      unoptimized
                    />
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                    
                    {/* Кнопка удаления в правом верхнем углу */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(slot.type)
                      }}
                      disabled={isDeleting}
                      className={cn(
                        "absolute top-2 right-2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                        isConfirming
                          ? "bg-red-500/90 scale-110"
                          : "bg-red-500/70 hover:bg-red-500/90",
                        isDeleting && "opacity-50 cursor-not-allowed"
                      )}
                      title="Удалить фото"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "w-full aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 transition-all",
                      "hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <Camera className="w-8 h-8 text-white/20" />
                    <span className="text-xs font-bold text-white/40 uppercase">
                      Добавить
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Подсказка */}
        {photoCount === 0 && measurementCount === 0 && (
          <div className="mt-4 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <p className="text-xs text-pink-300 text-center">
              Нажми на карточку, чтобы добавить фото и замеры
            </p>
          </div>
        )}
      </div>
    </>
  )
}
