'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BonusTransaction } from '@/types/database'
import { getBonusTransactions } from '@/lib/actions/bonuses'

interface BonusHistoryProps {
  transactions: BonusTransaction[]
  userId: string
}

export function BonusHistory({ transactions: initialTransactions, userId }: BonusHistoryProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    const result = await getBonusTransactions(userId, 50)
    if (result.success && result.data) {
      setTransactions(result.data)
      setShowAll(true)
    }
    setLoading(false)
  }

  const getTypeLabel = (type: BonusTransaction['type']) => {
    const labels = {
      welcome: 'Приветственный бонус',
      cashback: 'Кешбек',
      referral_bonus: 'Реферальный бонус',
      referral_first: 'Бонус за реферала',
      spent: 'Списание',
      admin_adjustment: 'Корректировка',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: BonusTransaction['type']) => {
    if (type === 'spent') return 'text-red-600 dark:text-red-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>История операций</CardTitle>
        <CardDescription>
          Последние {showAll ? transactions.length : Math.min(10, transactions.length)} операций
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Пока нет операций
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{tx.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className={`text-lg font-bold ${getTypeColor(tx.type)}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU')} 👟
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAll && transactions.length >= 10 && (
          <Button
            onClick={loadMore}
            variant="outline"
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Показать все'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

