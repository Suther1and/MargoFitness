'use client'

import { UserBonus, CashbackLevel, calculateLevelProgress } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BonusCardProps {
  account: UserBonus
  levelData: CashbackLevel
  progress: ReturnType<typeof calculateLevelProgress>
}

export function BonusCard({ account, levelData, progress }: BonusCardProps) {
  return (
    <Card className={`overflow-hidden border-0 bg-gradient-to-br ${levelData.color} text-white`}>
      <CardContent className="p-8">
        {/* Уровень и иконка */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm opacity-90 mb-1">Ваш уровень</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span>{levelData.icon}</span>
              <span>{levelData.name}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Кешбек</div>
            <div className="text-3xl font-bold">{levelData.percent}%</div>
          </div>
        </div>

        {/* Баланс */}
        <div className="mb-6">
          <div className="text-sm opacity-90 mb-2">Баланс шагов</div>
          <div className="text-4xl font-bold">{account.balance.toLocaleString('ru-RU')} 👟</div>
        </div>

        {/* Прогресс до следующего уровня */}
        {progress.nextLevel !== null && (
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>До следующего уровня</span>
              <span className="font-semibold">{progress.remaining.toLocaleString('ru-RU')} ₽</span>
            </div>
            <Progress value={progress.progress} className="h-2 bg-white/30" />
            <div className="text-xs opacity-75 mt-2">
              {progress.progress}% до уровня {progress.nextLevel}
            </div>
          </div>
        )}

        {progress.nextLevel === null && (
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm text-center">
            <div className="text-sm font-semibold">🎉 Максимальный уровень достигнут!</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

