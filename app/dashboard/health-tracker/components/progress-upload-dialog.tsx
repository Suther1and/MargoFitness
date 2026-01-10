'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, X, Sun, MapPin, Shirt, Clock, Ruler, Upload, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { PhotoType, WeeklyPhotoSet, WeeklyMeasurements } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProgressUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  weekKey: string
  weekLabel: string
  currentPhotos: WeeklyPhotoSet | null
  onUploadPhoto: (file: File, type: PhotoType) => void
  onDeletePhoto: (type: PhotoType) => void
  onSaveMeasurements: (measurements: WeeklyMeasurements) => void
  isUploading: boolean
  uploadProgress: number
}

const PHOTO_SLOTS: { type: PhotoType; label: string }[] = [
  { type: 'front', label: 'Профиль' },
  { type: 'side', label: 'Сбоку' },
  { type: 'back', label: 'Спина' },
]

export function ProgressUploadDialog({
  open,
  onOpenChange,
  userId,
  weekKey,
  weekLabel,
  currentPhotos,
  onUploadPhoto,
  onDeletePhoto,
  onSaveMeasurements,
  isUploading,
  uploadProgress
}: ProgressUploadDialogProps) {
  const [measurements, setMeasurements] = useState<WeeklyMeasurements>({
    chest: currentPhotos?.measurements?.chest,
    waist: currentPhotos?.measurements?.waist,
    hips: currentPhotos?.measurements?.hips
  })
  
  const fileInputRefs = useRef<Record<PhotoType, HTMLInputElement | null>>({
    front: null,
    side: null,
    back: null
  })

  const handleFileSelect = (photoType: PhotoType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Выберите изображение')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой (макс 10MB)')
      return
    }

    onUploadPhoto(file, photoType)
    
    // Сброс input
    if (fileInputRefs.current[photoType]) {
      fileInputRefs.current[photoType]!.value = ''
    }
  }

  const handleSave = () => {
    // Сохраняем замеры если они изменились
    const hasChanges = 
      measurements.chest !== currentPhotos?.measurements?.chest ||
      measurements.waist !== currentPhotos?.measurements?.waist ||
      measurements.hips !== currentPhotos?.measurements?.hips

    if (hasChanges) {
      onSaveMeasurements(measurements)
    }
    
    onOpenChange(false)
  }

  const handleMeasurementChange = (field: keyof WeeklyMeasurements, value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    setMeasurements(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full overflow-y-auto rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95 text-white/40"
          >
            <X className="size-5" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent pointer-events-none rounded-[2.5rem]" />
          
          <DialogHeader className="relative z-10 mb-6">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-wider flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-pink-500" />
              </div>
              Фото и замеры • {weekLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="relative z-10 space-y-6">
            {/* Секция 1: Фото */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-white/60 tracking-widest flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Фото прогресса
              </h3>
              
              {isUploading && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
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

              <div className="grid grid-cols-3 gap-4">
                {PHOTO_SLOTS.map((slot) => {
                  const photo = currentPhotos?.photos[slot.type]
                  const hasPhoto = !!photo

                  return (
                    <div key={slot.type} className="space-y-2">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider block px-1">
                        {slot.label}
                      </span>

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
                            alt={slot.label} 
                            fill
                            className="object-cover" 
                            unoptimized
                          />
                          
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                          
                          {/* Кнопка удаления */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeletePhoto(slot.type)
                            }}
                            disabled={isUploading}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          </button>

                          {/* Кнопка замены */}
                          <button
                            onClick={() => fileInputRefs.current[slot.type]?.click()}
                            disabled={isUploading}
                            className="absolute bottom-2 left-2 right-2 py-1.5 px-3 rounded-lg bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-xs font-bold text-white uppercase">Заменить</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => fileInputRefs.current[slot.type]?.click()}
                          disabled={isUploading}
                          className={cn(
                            "w-full aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 transition-all",
                            isUploading 
                              ? "opacity-50 cursor-not-allowed" 
                              : "hover:bg-white/10 hover:border-white/20 active:scale-95"
                          )}
                        >
                          <Upload className="w-6 h-6 text-white/20" />
                          <span className="text-xs font-bold text-white/40 uppercase">
                            Загрузить
                          </span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Инструкция по фото */}
              <div className="rounded-2xl bg-[#22222e] border border-white/5 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                      <Sun className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-tight">Свет</p>
                      <p className="text-[9px] text-[#8b8b93] leading-tight">Мягкий, спереди</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                      <MapPin className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-tight">Ракурс</p>
                      <p className="text-[9px] text-[#8b8b93] leading-tight">На уровне пупка</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                      <Shirt className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-tight">Одежда</p>
                      <p className="text-[9px] text-[#8b8b93] leading-tight">Одинаковая</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2a2a36] flex items-center justify-center flex-shrink-0 border border-white/5">
                      <Clock className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-tight">Время</p>
                      <p className="text-[9px] text-[#8b8b93] leading-tight">Утром натощак</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Секция 2: Замеры */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-white/60 tracking-widest flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Замеры тела
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider block px-1">
                    Грудь (см)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    step="0.5"
                    value={measurements.chest || ''}
                    onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                    placeholder="95"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider block px-1">
                    Талия (см)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    step="0.5"
                    value={measurements.waist || ''}
                    onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                    placeholder="75"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider block px-1">
                    Бедра (см)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    step="0.5"
                    value={measurements.hips || ''}
                    onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Инструкция по замерам */}
              <div className="rounded-2xl bg-[#22222e] border border-white/5 p-4">
                <p className="text-xs text-[#8b8b93] leading-relaxed">
                  <span className="text-white/60 font-bold">Совет:</span> Измеряй в самой широкой части, стой ровно, не затягивай ленту
                </p>
              </div>
            </div>

            {/* Кнопка сохранения */}
            <button
              onClick={handleSave}
              disabled={isUploading}
              className={cn(
                "group relative w-full h-13 md:h-14 rounded-2xl overflow-hidden transition-all",
                isUploading ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"
              )}
            >
              <div className="absolute inset-0 bg-[#ff2d78]" />
              <div className="relative flex items-center justify-center gap-2.5 text-white font-bold text-sm uppercase tracking-widest font-oswald">
                <Camera className="w-5 h-5" />
                Сохранить
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
