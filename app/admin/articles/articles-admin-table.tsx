'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArticleAdminRow } from './article-admin-row'
import { BookOpen, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { Article } from '@/types/database'
import { reorderArticles } from '@/lib/actions/admin-articles'
import { useToast } from '@/contexts/toast-context'

interface ArticlesAdminTableProps {
  initialArticles: Article[]
}

export function ArticlesAdminTable({ initialArticles }: ArticlesAdminTableProps) {
  const [articles, setArticles] = useState(initialArticles)
  
  // Синхронизируем локальное состояние при изменении пропсов (после revalidatePath)
  useEffect(() => {
    setArticles(initialArticles)
  }, [initialArticles])

  const [sortField, setSortField] = useState<keyof Article>('sort_order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { showSuccess, showError } = useToast()

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1
      
      const comparison = valA < valB ? -1 : 1
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [articles, sortField, sortOrder])

  const toggleSort = (field: keyof Article) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = articles.findIndex(a => a.id === id)
    if (currentIndex === -1) return

    const newArticles = [...articles].sort((a, b) => a.sort_order - b.sort_order)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex < 0 || targetIndex >= newArticles.length) return

    // Меняем местами sort_order
    const currentArticle = newArticles[currentIndex]
    const targetArticle = newArticles[targetIndex]
    
    const tempOrder = currentArticle.sort_order
    currentArticle.sort_order = targetArticle.sort_order
    targetArticle.sort_order = tempOrder

    setArticles([...newArticles])

    const result = await reorderArticles([
      { id: currentArticle.id, sort_order: currentArticle.sort_order },
      { id: targetArticle.id, sort_order: targetArticle.sort_order }
    ])

    if (result.success) {
      showSuccess('Успех', 'Порядок изменен')
    } else {
      showError('Ошибка', 'Ошибка при изменении порядка')
      setArticles(initialArticles)
    }
  }

  const SortIcon = ({ field }: { field: keyof Article }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 opacity-20" />
    return sortOrder === 'asc' ? <ChevronUp className="size-3 text-orange-400" /> : <ChevronDown className="size-3 text-orange-400" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b border-white/5 bg-white/[0.02]">
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-16">
              Порядок
            </th>
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleSort('title')}
            >
              <div className="flex items-center gap-2">
                Статья
                <SortIcon field="title" />
              </div>
            </th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Теги
            </th>
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleSort('access_level')}
            >
              <div className="flex items-center gap-2">
                Доступ
                <SortIcon field="access_level" />
              </div>
            </th>
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleSort('display_status')}
            >
              <div className="flex items-center gap-2">
                Видимость
                <SortIcon field="display_status" />
              </div>
            </th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-center">
              Бейджи
            </th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedArticles.map((article, index) => (
            <ArticleAdminRow 
              key={article.id} 
              article={article} 
              onMoveUp={() => handleMove(article.id, 'up')}
              onMoveDown={() => handleMove(article.id, 'down')}
              isFirst={index === 0}
              isLast={index === sortedArticles.length - 1}
            />
          ))}
          {sortedArticles.length === 0 && (
            <tr>
              <td colSpan={7} className="p-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
                    <BookOpen className="size-8 text-white/20" />
                  </div>
                  <p className="text-white/80 font-medium">Статьи не найдены</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
