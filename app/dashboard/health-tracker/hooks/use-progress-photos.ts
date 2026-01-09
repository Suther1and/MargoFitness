'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProgressPhotos, deleteProgressPhoto, uploadProgressPhoto } from '@/lib/actions/diary'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'

interface PhotoWithWeight {
  id: string
  date: string
  url: string
  weight: number | null
}

interface UseProgressPhotosOptions {
  userId: string | null
}

/**
 * Хук для работы с фото-прогресса
 * Получает фото из diary_entries и интегрирует с весом из metrics
 */
export function useProgressPhotos({ userId }: UseProgressPhotosOptions) {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Получение всех фото пользователя с весом
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['progress-photos', userId],
    queryFn: async () => {
      if (!userId) return []
      const result = await getProgressPhotos(userId)
      if (!result.success || !result.data) return []
      
      // Преобразуем данные: result.data содержит массив объектов { date, url, weight }
      const photosWithWeight: PhotoWithWeight[] = result.data.map((photo: any) => ({
        id: `${photo.date}_${photo.url}`,
        date: photo.date,
        url: photo.url,
        weight: photo.weight || null
      }))
      
      // Сортируем по дате (новые первыми)
      return photosWithWeight.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут
  })

  // Загрузка фото
  const uploadMutation = useMutation({
    mutationFn: async ({ file, date }: { file: File; date: string }) => {
      if (!userId) throw new Error('No user ID')
      
      setIsUploading(true)
      setUploadProgress(10)

      // Сжатие изображения
      const options = {
        maxSizeMB: 1, // Макс 1MB
        maxWidthOrHeight: 1920, // Макс размер стороны
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
      const result = await uploadProgressPhoto(userId, date, formData)
      
      setUploadProgress(100)
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.data
    },
    onSuccess: () => {
      // Обновляем список фото
      queryClient.invalidateQueries({ queryKey: ['progress-photos', userId] })
      // Обновляем запись дня
      queryClient.invalidateQueries({ queryKey: ['diary-entry', userId] })
      
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

  // Удаление фото
  const deleteMutation = useMutation({
    mutationFn: async ({ date, url }: { date: string; url: string }) => {
      if (!userId) throw new Error('No user ID')
      const result = await deleteProgressPhoto(userId, date, url)
      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }
      return result
    },
    onMutate: async ({ date, url }) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['progress-photos', userId] })

      // Сохраняем предыдущее состояние
      const previousPhotos = queryClient.getQueryData(['progress-photos', userId])

      // Оптимистично удаляем фото
      queryClient.setQueryData(['progress-photos', userId], (old: PhotoWithWeight[] = []) => 
        old.filter(photo => !(photo.date === date && photo.url === url))
      )

      return { previousPhotos }
    },
    onError: (err, variables, context) => {
      // Откатываем изменения в случае ошибки
      if (context?.previousPhotos) {
        queryClient.setQueryData(['progress-photos', userId], context.previousPhotos)
      }
    },
    onSuccess: () => {
      // Обновляем запись дня
      queryClient.invalidateQueries({ queryKey: ['diary-entry', userId] })
    },
  })

  return {
    photos,
    isLoading,
    uploadPhoto: uploadMutation.mutate,
    deletePhoto: deleteMutation.mutate,
    isUploading,
    uploadProgress,
    isDeleting: deleteMutation.isPending,
  }
}
