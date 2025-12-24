'use client'

import { UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BonusCardProps {
  account: UserBonus
  levelData: CashbackLevel
  progress: ReturnType<typeof calculateLevelProgress>
}

export function BonusCard({ account, levelData, progress }: BonusCardProps) {
  return (
    <Card className={`overflow-hidden border-0 bg-gradient-to-br ${levelData.color} text-white shadow-lg`}>
      <div className="p-6 space-y-6">
        {/* Хедер с логотипом */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <span className="text-2xl">{levelData.icon}</span>
            </div>
            <div>
              <div className="text-xs opacity-80">Уровень</div>
              <div className="font-bold text-lg">{levelData.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">Кешбек</div>
            <div className="text-2xl font-bold">{levelData.percent}%</div>
          </div>
        </div>

        {/* Баланс - крупно по центру */}
        <div className="py-4">
          <div className="text-sm opacity-80 mb-1">Баланс</div>
          <div className="text-5xl font-bold tracking-tight">
            {account.balance.toLocaleString('ru-RU')} <span className="text-3xl">👟</span>
          </div>
        </div>

        {/* Прогресс */}
        {progress.nextLevel !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">До {levelData.level === 1 ? 'Silver' : levelData.level === 2 ? 'Gold' : 'Platinum'}</span>
              <span className="font-semibold">{progress.remaining.toLocaleString('ru-RU')} ₽</span>
            </div>
            <Progress value={progress.progress} className="h-2 bg-white/20" />
          </div>
        ) : (
          <div className="text-center py-2 text-sm opacity-90">
            🎉 Максимальный уровень!
          </div>
        )}
      </div>
    </Card>
  )
}

