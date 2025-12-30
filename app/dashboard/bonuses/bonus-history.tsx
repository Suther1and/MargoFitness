'use client'

import { useState } from 'react'
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

  const getTypeIcon = (type: BonusTransaction['type'], amount: number) => {
    if (amount < 0) {
      // Списание
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
          <path d="M12 5v14"></path>
          <path d="m19 12-7 7-7-7"></path>
        </svg>
      )
    }
    
    switch (type) {
      case 'cashback':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"></path>
            <path d="M16 2v6"></path>
            <path d="M13 5h6"></path>
          </svg>
        )
      case 'referral_bonus':
      case 'referral_first':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      case 'welcome':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"></path>
            <path d="M16 2v6"></path>
            <path d="M13 5h6"></path>
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        )
    }
  }

  const getTypeColor = (amount: number): string => {
    if (amount < 0) return 'text-red-400'
    return 'text-emerald-400'
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Заголовок */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
            <h2 className="text-xl md:text-2xl font-semibold text-white">История операций</h2>
          </div>
          <p className="text-sm text-white/60">
            {transactions.length === 0 
              ? 'Пока нет операций'
              : `Последние ${showAll ? transactions.length : Math.min(10, transactions.length)} операций`
            }
          </p>
        </div>

        {/* Список транзакций */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
            </div>
            <p className="text-sm text-white/60">Пока нет операций</p>
            <p className="text-xs text-white/40 mt-1">Ваша история начислений появится здесь</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 hover:bg-white/[0.06] hover:ring-white/15 transition-all"
              >
                {/* Иконка */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  {getTypeIcon(tx.type, tx.amount)}
                </div>

                {/* Описание и дата */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{tx.description}</div>
                  <div className="text-xs text-white/60">
                    {new Date(tx.created_at).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Сумма */}
                <div className={`flex-shrink-0 text-right ${getTypeColor(tx.amount)}`}>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-lg font-bold font-oswald">
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU')}
                    </span>
                    <span className="text-base">👟</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Кнопка "Показать все" */}
        {!showAll && transactions.length >= 10 && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 ring-1 ring-blue-400/30 px-4 py-3 transition-all hover:from-blue-500/20 hover:to-indigo-500/20 hover:ring-blue-400/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex items-center justify-between pointer-events-none">
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-white">
                  {loading ? 'Загрузка...' : 'Показать все'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-200">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                )}
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

