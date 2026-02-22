'use client'

import React, { useState, useTransition } from 'react'
import { Article } from '@/types/database'
import { updateArticle, ArticleWithStats } from '@/lib/actions/admin-articles'
import { useToast } from '@/contexts/toast-context'
import { cn } from '@/lib/utils'
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Activity, 
  Check, 
  X, 
  Plus, 
  Tag as TagIcon,
  GripVertical
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ArticleAdminRowProps {
  article: ArticleWithStats
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  isSelected: boolean
  onToggleSelect: () => void
}

const DISPLAY_STATUSES = [
  { value: 'all', label: 'Видна всем', icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'admins_only', label: 'Только админам', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { value: 'hidden', label: 'Скрыта', icon: EyeOff, color: 'text-rose-400', bg: 'bg-rose-500/10' },
]

const ACCESS_LEVELS = [
  { value: 'free', label: 'Free', color: 'text-white/40', bg: 'bg-white/5', ring: 'ring-white/10' },
  { value: 'basic', label: 'Basic', color: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/30' },
  { value: 'pro', label: 'Pro', color: 'text-purple-400', bg: 'bg-purple-500/10', ring: 'ring-purple-500/30' },
  { value: 'elite', label: 'Elite', color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30' },
]

const PRESET_TAGS = ['Методика', 'Питание', 'Тренировки', 'Основы', 'Биохакинг']

export function ArticleAdminRow({ article, onMoveUp, onMoveDown, isFirst, isLast, isSelected, onToggleSelect }: ArticleAdminRowProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const { showSuccess, showError } = useToast()

  // Локальное состояние для optimistic UI
  const [optimisticArticle, setOptimisticArticle] = useState(article)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Синхронизируем optimistic article при изменении пропса
  React.useEffect(() => {
    setOptimisticArticle(article)
  }, [article])

  const handleUpdate = async (patch: Partial<Article>) => {
    // Optimistic update
    setOptimisticArticle(prev => ({ ...prev, ...patch }))
    
    setIsUpdating(true)
    
    // Если меняем is_new, выключаем is_updated и наоборот
    const finalPatch = { ...patch }
    if (patch.is_new) finalPatch.is_updated = false
    if (patch.is_updated) finalPatch.is_new = false
    
    startTransition(async () => {
      const result = await updateArticle(article.id, finalPatch)
      setIsUpdating(false)

      if (result.error) {
        showError('Ошибка', 'Ошибка при обновлении')
        // Откатываем optimistic update
        setOptimisticArticle(article)
      } else {
        showSuccess('Успех', 'Обновлено')
      }
    })
  }

  const toggleTag = (tag: string) => {
    const tags = article.tags || []
    let newTags: string[]
    
    if (tags.includes(tag)) {
      newTags = tags.filter(t => t !== tag)
    } else {
      if (tags.length >= 3) {
        showError('Лимит', 'Максимум 3 тега')
        return
      }
      newTags = [...tags, tag]
    }
    
    handleUpdate({ tags: newTags })
    // Закрываем окно после выбора тега
    setShowTagInput(false)
  }

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.trim()) return
    toggleTag(newTag.trim())
    setNewTag('')
  }

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={cn(
        "group hover:bg-white/[0.02] transition-colors",
        isUpdating && "opacity-50 pointer-events-none",
        isDragging && "opacity-50 z-50 bg-white/[0.05]",
        isSelected && "bg-orange-500/5"
      )}
    >
      {/* Чекбокс */}
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
        />
      </td>

      {/* Порядок + Drag Handle */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors"
          >
            <GripVertical className="size-4 text-white/40 hover:text-white" />
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <button 
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-0.5 rounded hover:bg-white/10 disabled:opacity-0 transition-all"
            >
              <ChevronUp className="size-4 text-white/40 hover:text-white" />
            </button>
            <span className="text-xs font-bold font-oswald text-white/20">{article.sort_order}</span>
            <button 
              onClick={onMoveDown}
              disabled={isLast}
              className="p-0.5 rounded hover:bg-white/10 disabled:opacity-0 transition-all"
            >
              <ChevronDown className="size-4 text-white/40 hover:text-white" />
            </button>
          </div>
        </div>
      </td>

      {/* Статья */}
      <td className="p-4">
        <div className="space-y-1 max-w-md">
          <h4 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">
            {optimisticArticle.title}
          </h4>
          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
            {optimisticArticle.description}
          </p>
          <div className="text-[10px] text-white/20 font-mono">
            slug: {optimisticArticle.slug} | {optimisticArticle.reading_time} мин
          </div>
        </div>
      </td>

      {/* Теги */}
      <td className="p-4">
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {(optimisticArticle.tags || []).map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="bg-white/5 text-white/60 border-white/10 text-[9px] font-bold uppercase py-0 px-1.5 cursor-pointer hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              onClick={() => toggleTag(tag)}
            >
              {tag} <X className="size-2 ml-1" />
            </Badge>
          ))}
          
          <div className="relative">
            <button 
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Plus className="size-3 text-white/40" />
            </button>

            {showTagInput && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowTagInput(false)}
                />
                {/* Popup */}
                <div className="absolute top-full left-0 mt-2 z-50 p-3 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl min-w-[200px]">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Выберите тег</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PRESET_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "text-[9px] font-bold uppercase px-2 py-1 rounded-md border transition-all",
                        (optimisticArticle.tags || []).includes(tag)
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleAddCustomTag} className="flex gap-2">
                    <input 
                      autoFocus
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Свой тег..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white focus:outline-none focus:border-orange-500/50"
                    />
                    <button type="submit" className="p-1 rounded-md bg-orange-500 text-black hover:bg-orange-400 transition-colors">
                      <Check className="size-3" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </td>

      {/* Доступ */}
      <td className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95 ring-1",
                ACCESS_LEVELS.find(l => l.value === optimisticArticle.access_level)?.bg || 'bg-white/5',
                ACCESS_LEVELS.find(l => l.value === optimisticArticle.access_level)?.color || 'text-white/40',
                ACCESS_LEVELS.find(l => l.value === optimisticArticle.access_level)?.ring || 'ring-white/10'
              )}
              disabled={isUpdating}
            >
              {ACCESS_LEVELS.find(l => l.value === optimisticArticle.access_level)?.label || optimisticArticle.access_level}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1a1a24] border-white/10 text-white">
            {ACCESS_LEVELS.map(level => (
              <DropdownMenuItem 
                key={level.value}
                onClick={() => handleUpdate({ access_level: level.value as any })}
                className={cn(
                  "cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-colors",
                  level.color
                )}
              >
                {level.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      {/* Видимость */}
      <td className="p-4">
        <div className="flex flex-col gap-1 w-fit">
          {DISPLAY_STATUSES.map(status => (
            <button
              key={status.value}
              onClick={() => handleUpdate({ display_status: status.value })}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border w-full justify-start",
                optimisticArticle.display_status === status.value
                  ? cn(status.bg, "border-white/10", status.color)
                  : "bg-transparent border-transparent text-white/20 hover:text-white/40"
              )}
            >
              <status.icon className="size-3 shrink-0" />
              <span className="truncate">{status.label}</span>
            </button>
          ))}
        </div>
      </td>

      {/* Просмотры */}
      <td className="p-4">
        <div className="flex items-center justify-center">
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-baseline gap-1.5" title="Просмотры / Уникальных / Прочитали">
            <span className="text-sm font-bold text-blue-400 font-oswald">
              {optimisticArticle.view_count || 0}
            </span>
            <span className="text-white/15 text-xs">/</span>
            <span className="text-sm font-bold text-yellow-400 font-oswald">
              {optimisticArticle.unique_view_count || 0}
            </span>
            <span className="text-white/15 text-xs">/</span>
            <span className="text-sm font-bold text-emerald-400 font-oswald">
              {optimisticArticle.read_count || 0}
            </span>
          </div>
        </div>
      </td>

      {/* Бейджи */}
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <label className="flex items-center gap-2 cursor-pointer group/label">
            <div className={cn(
              "w-7 h-3.5 rounded-full border border-white/10 relative transition-all",
              optimisticArticle.is_new ? "bg-emerald-500/20 border-emerald-500/50" : "bg-white/5"
            )}>
              <div className={cn(
                "absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all",
                optimisticArticle.is_new ? "right-0.5 bg-emerald-400" : "left-0.5 bg-white/20"
              )} />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={optimisticArticle.is_new} 
              onChange={() => handleUpdate({ is_new: !optimisticArticle.is_new })}
            />
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-widest",
              optimisticArticle.is_new ? "text-emerald-400" : "text-white/20 group-hover/label:text-white/40"
            )}>NEW</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group/label">
            <div className={cn(
              "w-7 h-3.5 rounded-full border border-white/10 relative transition-all",
              optimisticArticle.is_updated ? "bg-blue-500/20 border-blue-500/50" : "bg-white/5"
            )}>
              <div className={cn(
                "absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all",
                optimisticArticle.is_updated ? "right-0.5 bg-blue-400" : "left-0.5 bg-white/20"
              )} />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={optimisticArticle.is_updated} 
              onChange={() => handleUpdate({ is_updated: !optimisticArticle.is_updated })}
            />
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-widest",
              optimisticArticle.is_updated ? "text-blue-400" : "text-white/20 group-hover/label:text-white/40"
            )}>UPD</span>
          </label>
        </div>
      </td>
    </tr>
  )
}
