'use client'

import { useState, useMemo } from 'react'
import { AchievementRow } from './achievement-row'
import { Trophy, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { Achievement } from '@/types/database'
import { ACHIEVEMENT_CATEGORIES } from '@/types/database'

type SortField = 'title' | 'category' | 'userCount' | 'reward_amount'
type SortOrder = 'asc' | 'desc'

interface AchievementsTableProps {
  initialAchievements: (Achievement & { userCount: number })[]
}

export function AchievementsTable({ initialAchievements }: AchievementsTableProps) {
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sortedAchievements = useMemo(() => {
    return [...initialAchievements].sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a]
      let valB: any = b[sortField as keyof typeof b]

      // Специальная обработка для категории, чтобы сортировать по названию для пользователя
      if (sortField === 'category') {
        valA = ACHIEVEMENT_CATEGORIES[a.category as keyof typeof ACHIEVEMENT_CATEGORIES]?.label || a.category
        valB = ACHIEVEMENT_CATEGORIES[b.category as keyof typeof ACHIEVEMENT_CATEGORIES]?.label || b.category
      }

      if (valA === valB) return 0
      
      const comparison = valA < valB ? -1 : 1
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [initialAchievements, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 opacity-20" />
    return sortOrder === 'asc' ? <ChevronUp className="size-3 text-orange-400" /> : <ChevronDown className="size-3 text-orange-400" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b border-white/5 bg-white/[0.02]">
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleSort('title')}
            >
              <div className="flex items-center gap-2">
                Название / Иконка
                <SortIcon field="title" />
              </div>
            </th>
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleSort('category')}
            >
              <div className="flex items-center gap-2">
                Категория
                <SortIcon field="category" />
              </div>
            </th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Описание и логика
            </th>
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors text-center"
              onClick={() => toggleSort('userCount')}
            >
              <div className="flex items-center justify-center gap-2">
                Статистика
                <SortIcon field="userCount" />
              </div>
            </th>
            <th 
              className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/30 cursor-pointer hover:bg-white/5 transition-colors text-right"
              onClick={() => toggleSort('reward_amount')}
            >
              <div className="flex items-center justify-end gap-2">
                Награда
                <SortIcon field="reward_amount" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedAchievements.map((achievement) => (
            <AchievementRow key={achievement.id} achievement={achievement} />
          ))}
          {sortedAchievements.length === 0 && (
            <tr>
              <td colSpan={5} className="p-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
                    <Trophy className="size-8 text-white/20" />
                  </div>
                  <p className="text-white/80 font-medium">Достижения не найдены</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
