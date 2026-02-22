'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { ArticleAdminRow } from './article-admin-row'
import { BookOpen, ArrowUpDown, ChevronUp, ChevronDown, Search, X } from 'lucide-react'
import { Article } from '@/types/database'
import { reorderArticles, bulkUpdateArticles } from '@/lib/actions/admin-articles'
import { useToast } from '@/contexts/toast-context'
import debounce from 'lodash.debounce'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface ArticlesAdminTableProps {
  initialArticles: Article[]
}

export function ArticlesAdminTable({ initialArticles }: ArticlesAdminTableProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string | null>(null)
  const [selectedVisibility, setSelectedVisibility] = useState<string | null>(null)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Синхронизируем локальное состояние при изменении пропсов (после revalidatePath)
  useEffect(() => {
    setArticles(initialArticles)
  }, [initialArticles])

  const [sortField, setSortField] = useState<keyof Article>('sort_order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const { showSuccess, showError } = useToast()

  const ACCESS_LEVEL_ORDER: Record<string, number> = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'elite': 3
  }

  const TAG_COLORS: Record<string, string> = {
    'БИОХАКИНГ': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    'ТРЕНИРОВКИ': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'ОСНОВЫ': 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    'ПИТАНИЕ': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    'МЕТОДИКА': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  }

  // Дебаунс для поиска
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value)
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSetSearch(searchQuery)
  }, [searchQuery, debouncedSetSearch])

  // Получаем все уникальные теги
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    articles.forEach(article => {
      (article.tags || []).forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [articles])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortedArticles = useMemo(() => {
    // Фильтрация
    let filtered = articles.filter(article => {
      // Поиск по title, description, tags
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase()
        const matchTitle = article.title.toLowerCase().includes(search)
        const matchDesc = article.description?.toLowerCase().includes(search)
        const matchTags = (article.tags || []).some(tag => tag.toLowerCase().includes(search))
        
        if (!matchTitle && !matchDesc && !matchTags) {
          return false
        }
      }

      // Фильтр по тегам
      if (selectedTags.length > 0) {
        const articleTags = article.tags || []
        const hasSelectedTag = selectedTags.some(tag => articleTags.includes(tag))
        if (!hasSelectedTag) return false
      }

      // Фильтр по access level
      if (selectedAccessLevel && article.access_level !== selectedAccessLevel) {
        return false
      }

      // Фильтр по visibility
      if (selectedVisibility && article.display_status !== selectedVisibility) {
        return false
      }

      return true
    })

    // Сортировка
    if (!sortOrder) return filtered

    return filtered.sort((a, b) => {
      let valA: any = a[sortField]
      let valB: any = b[sortField]

      // Специальная обработка для уровней доступа
      if (sortField === 'access_level') {
        valA = ACCESS_LEVEL_ORDER[valA as string] ?? 99
        valB = ACCESS_LEVEL_ORDER[valB as string] ?? 99
      }

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1
      
      const comparison = valA < valB ? -1 : 1
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [articles, sortField, sortOrder, debouncedSearch, selectedTags, selectedAccessLevel, selectedVisibility])

  if (!mounted) return null

  const toggleSort = (field: keyof Article) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        // Сброс на дефолтную сортировку по порядку
        setSortField('sort_order')
        setSortOrder('asc')
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = articles.findIndex((a) => a.id === active.id)
    const newIndex = articles.findIndex((a) => a.id === over.id)

    const newArticles = arrayMove(articles, oldIndex, newIndex)
    
    // Обновляем sort_order для всех затронутых статей
    const updates = newArticles.map((article, index) => ({
      id: article.id,
      sort_order: index + 1
    }))

    // Optimistic update
    setArticles(newArticles.map((a, i) => ({ ...a, sort_order: i + 1 })))

    const result = await reorderArticles(updates)

    if (result.success) {
      showSuccess('Успех', 'Порядок изменен')
    } else {
      showError('Ошибка', 'Ошибка при изменении порядка')
      setArticles(initialArticles)
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

  const toggleSelectAll = () => {
    if (selectedArticles.length === sortedArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(sortedArticles.map(a => a.id))
    }
  }

  const toggleSelectArticle = (id: string) => {
    setSelectedArticles(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    )
  }

  const handleBulkUpdate = async (patch: Partial<Article>) => {
    if (selectedArticles.length === 0) return

    const result = await bulkUpdateArticles(selectedArticles, patch)
    
    if (result.success) {
      showSuccess('Успех', `Обновлено ${selectedArticles.length} статей`)
      setSelectedArticles([])
    } else {
      showError('Ошибка', 'Ошибка при массовом обновлении')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
    <div className="space-y-4 p-4 md:p-6">
        {/* Поиск и фильтры */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Поиск */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="Поиск по статьям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="size-4 text-white/40" />
              </button>
            )}
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Теги */}
            <div className="flex flex-wrap gap-1.5 mr-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    )
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${
                    selectedTags.includes(tag)
                      ? TAG_COLORS[tag.toUpperCase()] || 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                      : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Access Level фильтр */}
              <select
                value={selectedAccessLevel || ''}
                onChange={(e) => setSelectedAccessLevel(e.target.value || null)}
                className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase text-white/60 focus:outline-none focus:border-orange-500/50 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <option value="" className="bg-[#1a1a24]">Все уровни</option>
                <option value="free" className="bg-[#1a1a24]">Free</option>
                <option value="basic" className="bg-[#1a1a24]">Basic</option>
                <option value="pro" className="bg-[#1a1a24]">Pro</option>
                <option value="elite" className="bg-[#1a1a24]">Elite</option>
              </select>

              {/* Visibility фильтр */}
              <select
                value={selectedVisibility || ''}
                onChange={(e) => setSelectedVisibility(e.target.value || null)}
                className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase text-white/60 focus:outline-none focus:border-orange-500/50 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <option value="" className="bg-[#1a1a24]">Вся видимость</option>
                <option value="all" className="bg-[#1a1a24]">Видно всем</option>
                <option value="admins_only" className="bg-[#1a1a24]">Только админам</option>
                <option value="hidden" className="bg-[#1a1a24]">Скрыто</option>
              </select>

              {/* Сброс фильтров */}
              {(selectedTags.length > 0 || selectedAccessLevel || selectedVisibility || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTags([])
                    setSelectedAccessLevel(null)
                    setSelectedVisibility(null)
                  }}
                  className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-all"
                  title="Сбросить фильтры"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Счетчик результатов */}
        {(debouncedSearch || selectedTags.length > 0 || selectedAccessLevel || selectedVisibility) && (
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
            Найдено: <span className="text-white/60">{sortedArticles.length}</span> из {articles.length}
          </div>
        )}

        {/* Панель массовых операций */}
        {selectedArticles.length > 0 && (
          <div className="sticky top-4 z-10 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-orange-400">
                  Выбрано: {selectedArticles.length}
                </span>
                <button
                  onClick={() => setSelectedArticles([])}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Снять выделение
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkUpdate({ display_status: e.target.value })
                      e.target.value = ''
                    }
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                >
                  <option value="">Изменить видимость</option>
                  <option value="all">Видно всем</option>
                  <option value="admins_only">Только админам</option>
                  <option value="hidden">Скрыто</option>
                </select>

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkUpdate({ access_level: e.target.value as any })
                      e.target.value = ''
                    }
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                >
                  <option value="">Изменить доступ</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>

                <button
                  onClick={() => handleBulkUpdate({ is_new: true, is_updated: false })}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all"
                >
                  NEW
                </button>

                <button
                  onClick={() => handleBulkUpdate({ is_updated: true, is_new: false })}
                  className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all"
                >
                  UPD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Таблица */}
        <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left border-b border-white/5 bg-white/[0.02] relative">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 w-12 border-b border-white/5">
                <input
                  type="checkbox"
                  checked={selectedArticles.length === sortedArticles.length && sortedArticles.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
                />
              </th>
              <th 
                className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors w-24 border-b border-white/5"
                onClick={() => toggleSort('sort_order')}
              >
                <div className="flex items-center gap-2">
                  Порядок
                  <SortIcon field="sort_order" />
                </div>
              </th>
              <th 
                className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
                onClick={() => toggleSort('title')}
              >
                <div className="flex items-center gap-2">
                  Статья
                  <SortIcon field="title" />
                </div>
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                Теги
              </th>
              <th 
                className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
                onClick={() => toggleSort('access_level')}
              >
                <div className="flex items-center gap-2">
                  Доступ
                  <SortIcon field="access_level" />
                </div>
              </th>
              <th 
                className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
                onClick={() => toggleSort('display_status')}
              >
                <div className="flex items-center gap-2">
                  Видимость
                  <SortIcon field="display_status" />
                </div>
              </th>
              <th 
                className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
                onClick={() => toggleSort('view_count')}
              >
                <div className="flex items-center gap-2">
                  Просмотры
                  <SortIcon field="view_count" />
                </div>
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right border-b border-white/5">
                Бейджи
              </th>
            </tr>
          </thead>
          <SortableContext
            items={sortedArticles.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="divide-y divide-white/5">
              {sortedArticles.map((article, index) => (
                <ArticleAdminRow 
                  key={article.id} 
                  article={article} 
                  onMoveUp={() => handleMove(article.id, 'up')}
                  onMoveDown={() => handleMove(article.id, 'down')}
                  isFirst={index === 0}
                  isLast={index === sortedArticles.length - 1}
                  isSelected={selectedArticles.includes(article.id)}
                  onToggleSelect={() => toggleSelectArticle(article.id)}
                />
              ))}
              {sortedArticles.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
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
          </SortableContext>
        </table>
      </div>
      </div>
    </DndContext>
  )
}
