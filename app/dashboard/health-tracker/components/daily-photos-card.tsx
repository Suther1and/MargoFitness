'use client'

import { Camera, Plus, Trash2, Loader2, RefreshCw, HelpCircle } from 'lucide-react'
import { useProgressPhotos } from '../hooks/use-progress-photos'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { PhotoType, getWeekKey, getWeekLabel } from '@/types/database'
import { PhotoGuideDialog } from './photo-guide-dialog'

interface DailyPhotosCardProps {
  userId: string | null
  selectedDate: Date
}

const PHOTO_SLOTS: { type: PhotoType; label: string }[] = [
  { type: 'front', label: 'Профиль' },
  { type: 'side', label: 'Бок' },
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
    getCurrentWeekPhotoCount
  } = useProgressPhotos({ userId, selectedDate })
  
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [showGuideHint, setShowGuideHint] = useState(true)
  
  const fileInputRefs = useRef<Record<PhotoType, HTMLInputElement | null>>({
    front: null,
    side: null,
    back: null
  })

  const weekKey = getWeekKey(selectedDate)
  const weekLabel = getWeekLabel(weekKey)
  const photoCount = getCurrentWeekPhotoCount()

  const handleFileSelect = async (photoType: PhotoType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Валидация
    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс 10MB)')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setError(null)
      
      // Проверяем, есть ли уже фото этого типа
      const existingPhoto = currentWeekPhotos?.photos[photoType]
      
      if (existingPhoto) {
        // Заменяем существующее
        replacePhoto({ file, photoType })
      } else {
        // Загружаем новое
        uploadPhoto({ file, photoType })
      }
    } catch (err) {
      setError('Ошибка загрузки')
      setTimeout(() => setError(null), 3000)
    }

    // Сброс input
    if (fileInputRefs.current[photoType]) {
      fileInputRefs.current[photoType]!.value = ''
    }
  }

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

  const handleSlotClick = (photoType: PhotoType) => {
    // При первом клике показываем гайд
    if (showGuideHint && photoCount === 0) {
      setGuideOpen(true)
      setShowGuideHint(false)
    } else {
      fileInputRefs.current[photoType]?.click()
    }
  }

  return (
    <>
      <PhotoGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
      
      <div 
        className="rounded-[2.5rem] border border-white/5 bg-[#121214]/90 md:bg-[#121214]/40 md:backdrop-blur-xl p-5 md:p-6 hover:border-white/10 transition-all duration-300"
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
          
          <button
            onClick={() => setGuideOpen(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Как делать фото?"
          >
            <HelpCircle className="w-4 h-4 text-white/40 hover:text-white/60" />
          </button>
        </div>

        {/* Индикатор прогресса */}
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
              На этой неделе
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
                  {hasPhoto && (
                    <button
                      onClick={() => handleDelete(slot.type)}
                      disabled={isDeleting}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        isConfirming
                          ? "bg-red-500/90 scale-110"
                          : "bg-white/5 hover:bg-white/10",
                        isDeleting && "opacity-50 cursor-not-allowed"
                      )}
                      title="Удалить фото"
                    >
                      <Trash2 className={cn(
                        "w-3 h-3",
                        isConfirming ? "text-white" : "text-white/40"
                      )} />
                    </button>
                  )}
                </div>

                <input
                  ref={(el) => {fileInputRefs.current[slot.type] = el}}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(slot.type, e)}
                  className="hidden"
                  disabled={isUploading}
                />

                {hasPhoto ? (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group">
                    <Image 
                      src={photo.url} 
                      alt={`${slot.label} photo`} 
                      fill
                      className="object-cover" 
                      unoptimized
                    />
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                    
                    {/* Кнопка замены */}
                    <button
                      onClick={() => fileInputRefs.current[slot.type]?.click()}
                      disabled={isUploading || isDeleting}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="p-3 rounded-xl bg-black/80 backdrop-blur-sm">
                        <RefreshCw className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSlotClick(slot.type)}
                    disabled={isUploading}
                    className={cn(
                      "w-full aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 transition-all",
                      isUploading 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-white/10 hover:border-white/20 active:scale-95"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-white/20" />
                        <span className="text-xs font-bold text-white/40 uppercase">
                          Добавить
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Подсказка для первого использования */}
        {showGuideHint && photoCount === 0 && (
          <div className="mt-4 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <p className="text-xs text-pink-300 text-center">
              👆 Нажмите на любой слот, чтобы увидеть гайд по фото
            </p>
          </div>
        )}
      </div>
    </>
  )
}
