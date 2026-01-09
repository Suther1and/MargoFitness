'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getProgressPhotos, 
  deleteProgressPhoto, 
  uploadProgressPhoto,
  getCurrentWeekPhotos,
  getComparisonPhotos,
  updateProgressPhoto
} from '@/lib/actions/diary'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { WeeklyPhotoSet, PhotoType, getCurrentWeekKey } from '@/types/database'

interface UseProgressPhotosOptions {
  userId: string | null
}

/**
 * Хук для работы с недельными фото-прогресса
 */
export function useProgressPhotos({ userId }: UseProgressPhotosOptions) {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Получение всех недельных сетов фото
  const { data: weeklyPhotoSets = [], isLoading } = useQuery({
    queryKey: ['progress-photos', userId],
    queryFn: async () => {
      if (!userId) return []
      const result = await getProgressPhotos(userId)
      if (!result.success || !result.data) return []
      return result.data as WeeklyPhotoSet[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут
  })

  // Получение фото текущей недели
  const { data: currentWeekPhotos } = useQuery({
    queryKey: ['current-week-photos', userId],
    queryFn: async () => {
      if (!userId) return null
      const result = await getCurrentWeekPhotos(userId)
      if (!result.success || !result.data) return null
      return result.data as WeeklyPhotoSet
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 минуты
  })

  // Проверка, можно ли загрузить фото на этой неделе
  const canUploadThisWeek = (photoType: PhotoType): boolean => {
    if (!currentWeekPhotos) return true
    return !currentWeekPhotos.photos[photoType]
  }

  // Получить количество загруженных фото за текущую неделю
  const getCurrentWeekPhotoCount = (): number => {
    if (!currentWeekPhotos) return 0
    const photos = currentWeekPhotos.photos
    let count = 0
    if (photos.front) count++
    if (photos.side) count++
    if (photos.back) count++
    return count
  }

  // Загрузка фото
  const uploadMutation = useMutation({
    mutationFn: async ({ file, photoType }: { file: File; photoType: PhotoType }) => {
      if (!userId) throw new Error('No user ID')
      
      setIsUploading(true)
      setUploadProgress(10)

      // Сжатие изображения
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
      }

      setUploadProgress(30)
      const compressedFile = await imageCompression(file, options)
      
      setUploadProgress(50)
      
      // Создаем FormData
      const formData = new FormData()
      formData.append('file', compressedFile)

      setUploadProgress(70)
      
      // Загружаем на сервер
      const result = await uploadProgressPhoto(userId, photoType, formData)
      
      setUploadProgress(100)
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.data
    },
    onSuccess: () => {
      // Обновляем список фото
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      queryClient.invalidateQueries({ queryKey: ['current-week-photos', userId] })
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    },
    onError: (error) => {
      console.error('Error uploading photo:', error)
      setIsUploading(false)
      setUploadProgress(0)
    },
  })

  // Замена фото
  const replaceMutation = useMutation({
    mutationFn: async ({ file, photoType }: { file: File; photoType: PhotoType }) => {
      if (!userId) throw new Error('No user ID')
      
      setIsUploading(true)
      setUploadProgress(10)

      // Сжатие изображения
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
      }

      setUploadProgress(30)
      const compressedFile = await imageCompression(file, options)
      
      setUploadProgress(50)
      
      // Создаем FormData
      const formData = new FormData()
      formData.append('file', compressedFile)

      setUploadProgress(70)
      
      // Заменяем фото
      const result = await updateProgressPhoto(userId, photoType, formData)
      
      setUploadProgress(100)
      
      if (!result.success) {
        throw new Error(result.error || 'Replace failed')
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      queryClient.invalidateQueries({ queryKey: ['current-week-photos', userId] })
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    },
    onError: (error) => {
      console.error('Error replacing photo:', error)
      setIsUploading(false)
      setUploadProgress(0)
    },
  })

  // Удаление фото
  const deleteMutation = useMutation({
    mutationFn: async ({ weekKey, photoType }: { weekKey: string; photoType: PhotoType }) => {
      if (!userId) throw new Error('No user ID')
      const result = await deleteProgressPhoto(userId, weekKey, photoType)
      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }
      return result
    },
    onMutate: async ({ weekKey, photoType }) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['progress-photos', userId] })
      await queryClient.cancelQueries({ queryKey: ['current-week-photos', userId] })

      // Сохраняем предыдущее состояние
      const previousPhotos = queryClient.getQueryData(['progress-photos', userId])
      const previousCurrentWeek = queryClient.getQueryData(['current-week-photos', userId])

      // Оптимистично удаляем фото
      queryClient.setQueryData(['progress-photos', userId], (old: WeeklyPhotoSet[] = []) => 
        old.map(set => {
          if (set.week_key === weekKey) {
            const updatedPhotos = { ...set.photos }
            delete updatedPhotos[photoType]
            return {
              ...set,
              photos: updatedPhotos,
              hasPhotos: !!(updatedPhotos.front || updatedPhotos.side || updatedPhotos.back)
            }
          }
          return set
        }).filter(set => set.hasPhotos)
      )

      // Обновляем текущую неделю если это она
      if (weekKey === getCurrentWeekKey()) {
        queryClient.setQueryData(['current-week-photos', userId], (old: WeeklyPhotoSet | null) => {
          if (!old) return null
          const updatedPhotos = { ...old.photos }
          delete updatedPhotos[photoType]
          return {
            ...old,
            photos: updatedPhotos,
            hasPhotos: !!(updatedPhotos.front || updatedPhotos.side || updatedPhotos.back)
          }
        })
      }

      return { previousPhotos, previousCurrentWeek }
    },
    onError: (err, variables, context) => {
      // Откатываем изменения в случае ошибки
      if (context?.previousPhotos) {
        queryClient.setQueryData(['progress-photos', userId], context.previousPhotos)
      }
      if (context?.previousCurrentWeek) {
        queryClient.setQueryData(['current-week-photos', userId], context.previousCurrentWeek)
      }
    },
    onSuccess: () => {
      // Финальное обновление данных
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      queryClient.invalidateQueries({ queryKey: ['current-week-photos', userId] })
    },
  })

  return {
    weeklyPhotoSets,
    currentWeekPhotos,
    isLoading,
    uploadPhoto: uploadMutation.mutate,
    replacePhoto: replaceMutation.mutate,
    deletePhoto: deleteMutation.mutate,
    isUploading,
    uploadProgress,
    isDeleting: deleteMutation.isPending,
    canUploadThisWeek,
    getCurrentWeekPhotoCount,
  }
}

/**
 * Хук для получения фото для сравнения
 */
export function useComparisonPhotos(
  userId: string | null, 
  startDate: string, 
  endDate: string
) {
  const { data, isLoading } = useQuery({
    queryKey: ['comparison-photos', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return null
      const result = await getComparisonPhotos(userId, startDate, endDate)
      if (!result.success) return null
      return result.data
    },
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  })

  return {
    comparisonData: data,
    isLoading
  }
}
