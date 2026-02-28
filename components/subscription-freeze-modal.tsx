'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Profile, SubscriptionFreeze } from '@/types/database'
import { Snowflake, Shield, Clock, Pause, Play, AlertTriangle } from 'lucide-react'
import { freezeSubscription, unfreezeSubscription, getFreezeInfo } from '@/lib/actions/freeze-actions'
import { cn } from '@/lib/utils'

interface FreezeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  userId: string
}

function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs > 10 && abs < 20) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}

export function SubscriptionFreezeModal({ open, onOpenChange, profile, userId }: FreezeModalProps) {
  const [history, setHistory] = useState<SubscriptionFreeze[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const info = useMemo(() => {
    const tokensTotal = profile.freeze_tokens_total || 0
    const tokensUsed = profile.freeze_tokens_used || 0
    const daysTotal = profile.freeze_days_total || 0
    const daysUsed = profile.freeze_days_used || 0
    const daysRemaining = daysTotal - daysUsed

    let frozenDaysElapsed = 0
    let frozenDaysLeft = 0

    if (profile.is_frozen && profile.frozen_at) {
      const now = new Date()
      const frozenAt = new Date(profile.frozen_at)
      frozenDaysElapsed = Math.max(0, Math.floor((now.getTime() - frozenAt.getTime()) / (1000 * 60 * 60 * 24)))
      frozenDaysLeft = Math.max(0, daysRemaining - frozenDaysElapsed)
    }

    return {
      tokensTotal,
      tokensUsed,
      tokensRemaining: tokensTotal - tokensUsed,
      daysTotal,
      daysUsed,
      daysRemaining,
      isFrozen: profile.is_frozen,
      frozenDaysElapsed,
      frozenDaysLeft,
    }
  }, [profile])

  useEffect(() => {
    if (open) {
      getFreezeInfo(userId).then(res => {
        if (res.success && res.data) {
          setHistory(res.data.history)
        }
      })
    }
  }, [open, userId])

  const handleFreeze = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const result = await freezeSubscription(userId)
      if (result.success) {
        window.dispatchEvent(new CustomEvent('subscription-updated'))
      } else {
        setError(result.error || 'Не удалось заморозить')
      }
    } catch {
      setError('Ошибка при заморозке')
    }
    setActionLoading(false)
  }

  const handleUnfreeze = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const result = await unfreezeSubscription(userId)
      if (result.success) {
        window.dispatchEvent(new CustomEvent('subscription-updated'))
        // Закрываем модал после успешной разморозки
        onOpenChange(false)
      } else {
        setError(result.error || 'Не удалось разморозить')
      }
    } catch {
      setError('Ошибка при разморозке')
    }
    setActionLoading(false)
  }

  const isFrozen = info.isFrozen
  const isExhausted = !isFrozen && (info.tokensRemaining <= 0 || info.daysRemaining <= 0)

  return (
    <>
      <style jsx global>{`
        [data-slot="dialog-close"] { display: none !important; }
        @media (max-width: 1023px) {
          [data-slot="dialog-content"] {
            background-color: #1a1a24 !important;
            border: none !important;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[560px] w-[95vw] h-auto max-h-[95vh] bg-transparent border-0 p-0 overflow-visible shadow-none ring-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Заморозка подписки</DialogTitle>
          <DialogDescription className="sr-only">Управление заморозкой</DialogDescription>

          <div className="relative w-full bg-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              style={{ position: 'absolute', zIndex: 70, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}
              className="top-4 right-4 md:top-[6px] md:right-[6px] transition-all hover:opacity-70 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 hover:text-white/80">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

            {isFrozen ? (
              /* ══════════ FROZEN STATE ══════════ */
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center ring-1 ring-cyan-500/30 shadow-lg">
                    <Snowflake className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-oswald uppercase leading-none text-white">Подписка заморожена</h3>
                    <p className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest mt-1">
                      {profile.subscription_tier.toUpperCase()} · На паузе
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Заморозка идёт</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Активна</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Дней прошло</p>
                        <p className="text-3xl font-oswald font-bold text-white">{info.frozenDaysElapsed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Осталось дней</p>
                        <p className="text-3xl font-oswald font-bold text-cyan-400">{info.frozenDaysLeft}</p>
                      </div>
                    </div>
                    {info.frozenDaysElapsed + info.frozenDaysLeft > 0 && (
                      <div className="mt-3">
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${(info.frozenDaysElapsed / (info.frozenDaysElapsed + info.frozenDaysLeft)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-cyan-400/60 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        Подписка на паузе. Срок подписки не расходуется. При разморозке доступ к контенту <span className="text-white/70 font-semibold">{profile.subscription_tier.toUpperCase()}</span> восстановится мгновенно.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      {Array.from({ length: info.tokensTotal }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            i < info.tokensUsed
                              ? "bg-white/10 ring-1 ring-white/5"
                              : "bg-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_4px_rgba(34,211,238,0.3)]"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                      {info.tokensUsed} из {info.tokensTotal} {plural(info.tokensTotal, 'заморозки', 'заморозок', 'заморозок')}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="flex-1 text-center">
                    <p className="text-sm font-oswald font-bold text-white/60 mb-0.5">
                      {info.daysUsed + info.frozenDaysElapsed} <span className="text-white/20">из</span> {info.daysTotal}
                    </p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                      дней использовано
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleUnfreeze}
                  disabled={actionLoading}
                  className={cn(
                    "w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2",
                    actionLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
                  )}
                >
                  <Play className="w-4 h-4" />
                  {actionLoading ? 'Размораживаем...' : 'Разморозить подписку'}
                </button>
              </div>
            ) : (
              /* ══════════ NORMAL STATE — FREEZE PROMPT ══════════ */
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center ring-1 ring-cyan-500/30 shadow-lg">
                    <Snowflake className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-oswald uppercase leading-none text-white">Заморозка</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Поставь подписку на паузу</p>
                  </div>
                </div>

                {/* How it works — clearer explanation */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pause className="w-4 h-4 text-cyan-400/70" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-white/70 leading-tight block">Сохранение оплаченных дней</span>
                      <span className="text-[10px] text-white/35 leading-tight">Срок подписки не расходуется, пока она заморожена</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-cyan-400/70" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-white/70 leading-tight block">У тебя {info.daysRemaining} {plural(info.daysRemaining, 'день', 'дня', 'дней')} и {info.tokensRemaining} {plural(info.tokensRemaining, 'заморозка', 'заморозки', 'заморозок')}</span>
                      <span className="text-[10px] text-white/35 leading-tight">1 день в этом режиме = минус 1 день из запаса. Каждая активация тратит 1 заморозку</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-cyan-400/70" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-white/90 leading-tight block">Лимиты ограничены</span>
                      <span className="text-[10px] text-white/40 leading-tight">
                        Без остатка дней <span className="text-cyan-300/90 font-bold underline decoration-cyan-500/30 underline-offset-2">или</span> заморозок повторная активация будет невозможна
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-cyan-400/70" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-white/70 leading-tight block">Доступ к контенту Free</span>
                      <span className="text-[10px] text-white/35 leading-tight">Во время паузы доступен только бесплатный контент</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Play className="w-4 h-4 text-cyan-400/70" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-white/70 leading-tight block">Разморозить можно в любой момент</span>
                      <span className="text-[10px] text-white/35 leading-tight">Полный доступ вернётся мгновенно</span>
                    </div>
                  </div>
                </div>

                {/* Limits display */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Твои лимиты</p>
                  {info.tokensTotal === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center space-y-1.5">
                      <p className="text-xs text-white/40 font-medium">Заморозка недоступна для текущего срока</p>
                      <p className="text-[11px] text-white/25">Продли подписку на 3+ месяцев, чтобы получить заморозки</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center min-h-[76px]">
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          {Array.from({ length: info.tokensTotal }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-3 h-3 rounded-full transition-all",
                                i < info.tokensUsed
                                  ? "bg-white/10 ring-1 ring-white/5"
                                  : "bg-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_6px_rgba(34,211,238,0.4)]"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                          {info.tokensRemaining} {plural(info.tokensRemaining, 'заморозка', 'заморозки', 'заморозок')} осталось
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center min-h-[76px]">
                        <p className="text-2xl font-oswald font-bold text-cyan-400 leading-none mb-1.5">{info.daysRemaining}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                          {plural(info.daysRemaining, 'день', 'дня', 'дней')} осталось
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">История</p>
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto scrollbar-none">
                      {history.filter(h => h.ended_at).map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-white/40 font-medium">
                            {new Date(h.started_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            {' — '}
                            {h.ended_at ? new Date(h.ended_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Сейчас'}
                          </span>
                          <span className="text-[10px] font-bold text-white/30">
                            {h.days_used} {plural(h.days_used, 'день', 'дня', 'дней')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                {isExhausted ? (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center space-y-2">
                    <p className="text-xs text-white/50 font-semibold">
                      {info.tokensRemaining <= 0 && info.daysRemaining <= 0
                        ? 'Заморозки и дни исчерпаны'
                        : info.tokensRemaining <= 0
                          ? 'Все заморозки использованы'
                          : 'Все дни заморозки использованы'
                      }
                    </p>
                    <p className="text-[11px] text-white/30">
                      Продли или улучши подписку, чтобы получить новые заморозки
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleFreeze}
                    disabled={actionLoading}
                    className={cn(
                      "w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2",
                      actionLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
                    )}
                  >
                    {actionLoading ? (
                      <>
                        <Snowflake className="w-4 h-4 animate-spin" />
                        <span>Замораживаем...</span>
                      </>
                    ) : (
                      <>
                        <span>Заморозить подписку</span>
                        <span className="flex items-center gap-1 opacity-90 ml-1">
                          <span className="text-sm font-bold leading-none">−1</span>
                          <Snowflake className="w-4 h-4 -translate-y-[1px]" />
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
