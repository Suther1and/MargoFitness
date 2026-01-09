'use client'

import { Camera, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { useProgressPhotos } from '../hooks/use-progress-photos'
import { format } from 'date-fns'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface DailyPhotosCardProps {
  photos: string[]
  currentDate?: Date
  userId: string | null
}

export function DailyPhotosCard({ photos, currentDate = new Date(), userId }: DailyPhotosCardProps) {
  const { photos: allPhotos, uploadPhoto, deletePhoto, isUploading, uploadProgress, isDeleting } = useProgressPhotos({ 
    userId 
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  
  // Находим фото за текущую дату
  const todayPhoto = allPhotos.find(p => p.date === dateStr)
  const hasPhotoToday = !!todayPhoto

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Валидация
    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('Файл слишком большой (макс 10MB)')
      setTimeout(() => setError(null), 3000)
      return
    }

    // Если уже есть фото за сегодня - сначала удаляем старое
    if (todayPhoto) {
      await deletePhoto({ date: dateStr, url: todayPhoto.url })
    }

    try {
      setError(null)
      uploadPhoto({ file, date: dateStr })
    } catch (err) {
      setError('Ошибка загрузки')
      setTimeout(() => setError(null), 3000)
    }

    // Сброс input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = () => {
    if (!todayPhoto) return
    
    if (deleteConfirm === todayPhoto.url) {
      deletePhoto({ date: dateStr, url: todayPhoto.url })
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(todayPhoto.url)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div 
      className="rounded-[2.5rem] border border-white/5 bg-[#121214]/90 md:bg-[#121214]/40 md:backdrop-blur-xl p-5 md:p-6 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-400" />
          </div>
          <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Фото прогресса</h3>
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

      {hasPhotoToday ? (
        // Показываем загруженное фото
        <div className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group">
          <Image 
            src={todayPhoto.url} 
            alt="Progress photo" 
            fill
            className="object-cover" 
            unoptimized
          />
          
          {/* Кнопки управления */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                "p-2 rounded-lg backdrop-blur-sm transition-all",
                deleteConfirm === todayPhoto.url
                  ? "bg-red-500/90 scale-110"
                  : "bg-black/60 hover:bg-black/80",
                isDeleting && "opacity-50 cursor-not-allowed"
              )}
            >
              <Trash2 className={cn(
                "w-3.5 h-3.5",
                deleteConfirm === todayPhoto.url ? "text-white" : "text-white/90"
              )} />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="p-2 rounded-lg backdrop-blur-sm bg-black/60 hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white/90" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      ) : (
        // Показываем кнопку добавления
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "w-full aspect-square rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 transition-all",
              isUploading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-white/10 hover:border-white/20"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-white/20" />
                <span className="text-xs font-bold text-white/40 uppercase">
                  Добавить фото
                </span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}

