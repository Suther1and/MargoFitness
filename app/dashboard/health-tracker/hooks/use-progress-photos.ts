'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getProgressPhotos, 
  deleteProgressPhoto, 
  uploadProgressPhoto,
  getWeekPhotos,
  getComparisonPhotos,
  updateProgressPhoto,
  updateWeeklyMeasurements
} from '@/lib/actions/diary'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { WeeklyPhotoSet, PhotoType, getWeekKey, WeeklyMeasurements } from '@/types/database'

interface UseProgressPhotosOptions {
  userId: string | null
  selectedDate?: Date // Опциональный параметр для конкретной недели
  dateRange?: { start: Date; end: Date } // Опциональный параметр для статистики
}

/**
 * Хук для работы с недельными фото-прогресса
 */
export function useProgressPhotos({ userId, selectedDate, dateRange }: UseProgressPhotosOptions) {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Вычисляем weekKey из выбранной даты (если передана)
  const weekKey = selectedDate ? getWeekKey(selectedDate) : null

  // Создаем уникальный ключ для кеша на основе dateRange
  const dateRangeKey = dateRange 
    ? `${dateRange.start.getTime()}-${dateRange.end.getTime()}`
    : 'all'

  // Получение всех недельных сетов фото
  const { data: weeklyPhotoSets = [], isLoading } = useQuery({
    queryKey: ['progress-photos', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return []
      const result = await getProgressPhotos(userId)
      if (!result.success || !result.data) return []
      return result.data as WeeklyPhotoSet[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут
    refetchOnMount: 'always', // Всегда обновлять при монтировании компонента
  })

  // Получение фото выбранной недели (только если selectedDate передан)
  const { data: currentWeekPhotos } = useQuery({
    queryKey: ['week-photos', userId, weekKey],
    queryFn: async () => {
      if (!userId || !weekKey) return null
      const result = await getWeekPhotos(userId, weekKey)
      if (!result.success || !result.data) return null
      return result.data as WeeklyPhotoSet
    },
    enabled: !!userId && !!weekKey,
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

  // Загрузка фото (на выбранную неделю, если selectedDate передан)
  const uploadMutation = useMutation({
    mutationFn: async ({ file, photoType }: { file: File; photoType: PhotoType }) => {
      if (!userId) throw new Error('No user ID')
      if (!weekKey) throw new Error('No week key - selectedDate is required')
      
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
      
      // Загружаем на сервер с weekKey выбранной недели
      const result = await uploadProgressPhoto(userId, photoType, formData, weekKey)
      
      setUploadProgress(100)
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.data
    },
    onSuccess: () => {
      // Обновляем список фото
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      if (weekKey) {
        queryClient.invalidateQueries({ queryKey: ['week-photos', userId, weekKey] })
      }
      
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
      if (!weekKey) throw new Error('No week key - selectedDate is required')
      
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
      
      // Заменяем фото с weekKey выбранной недели
      const result = await updateProgressPhoto(userId, photoType, formData, weekKey)
      
      setUploadProgress(100)
      
      if (!result.success) {
        throw new Error(result.error || 'Replace failed')
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      if (weekKey) {
        queryClient.invalidateQueries({ queryKey: ['week-photos', userId, weekKey] })
      }
      
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
      await queryClient.cancelQueries({ queryKey: ['week-photos', userId, weekKey] })

      // Сохраняем предыдущее состояние
      const previousPhotos = queryClient.getQueryData(['progress-photos', userId])
      const previousWeekPhotos = queryClient.getQueryData(['week-photos', userId, weekKey])

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
        }).filter(set => set.hasPhotos || set.hasMeasurements)
      )

      // Обновляем выбранную неделю
      queryClient.setQueryData(['week-photos', userId, weekKey], (old: WeeklyPhotoSet | null) => {
        if (!old) return null
        const updatedPhotos = { ...old.photos }
        delete updatedPhotos[photoType]
        return {
          ...old,
          photos: updatedPhotos,
          hasPhotos: !!(updatedPhotos.front || updatedPhotos.side || updatedPhotos.back)
        }
      })

      return { previousPhotos, previousWeekPhotos }
    },
    onError: (err, variables, context) => {
      // Откатываем изменения в случае ошибки
      if (context?.previousPhotos) {
        queryClient.setQueryData(['progress-photos', userId], context.previousPhotos)
      }
      if (context?.previousWeekPhotos) {
        queryClient.setQueryData(['week-photos', userId, variables.weekKey], context.previousWeekPhotos)
      }
    },
    onSuccess: (data, variables) => {
      // Финальное обновление данных
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      queryClient.invalidateQueries({ queryKey: ['week-photos', userId, variables.weekKey] })
    },
  })

  // Обновление замеров
  const updateMeasurementsMutation = useMutation({
    mutationFn: async ({ 
      measurements 
    }: { 
      measurements: WeeklyMeasurements 
    }) => {
      if (!userId) throw new Error('No user ID')
      if (!weekKey) throw new Error('No week key - selectedDate is required')
      const result = await updateWeeklyMeasurements(userId, weekKey, measurements)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      if (weekKey) {
        queryClient.invalidateQueries({ queryKey: ['week-photos', userId, weekKey] })
      }
    }
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
    updateMeasurements: updateMeasurementsMutation.mutate,
    isUpdatingMeasurements: updateMeasurementsMutation.isPending,
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
