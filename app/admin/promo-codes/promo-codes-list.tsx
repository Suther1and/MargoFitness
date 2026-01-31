'use client'

import { useState } from 'react'
import { Check, X, Trash2, Clock, Users, ArrowRight } from 'lucide-react'
import { activatePromoCode, deactivatePromoCode, deletePromoCode } from '@/lib/actions/promo-codes'
import { useRouter } from 'next/navigation'
import type { PromoCode } from '@/types/database'

interface PromoCodesListProps {
  promoCodes: PromoCode[]
}

export function PromoCodesList({ promoCodes: initialPromoCodes }: PromoCodesListProps) {
  const router = useRouter()
  const [promoCodes] = useState(initialPromoCodes)

  const handleToggle = async (id: string, isActive: boolean) => {
    if (isActive) {
      await deactivatePromoCode(id)
    } else {
      await activatePromoCode(id)
    }
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот промокод?')) {
      await deletePromoCode(id)
      router.refresh()
    }
  }

  if (promoCodes.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="p-6 rounded-full bg-white/5 ring-1 ring-white/10">
            <TicketIcon className="size-12 text-white/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Промокодов нет</h3>
            <p className="text-white/40 max-w-sm mx-auto">Создайте свой первый промокод для привлечения новых пользователей.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {promoCodes.map((promo) => {
        const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
        const isLimitReached = promo.usage_limit !== null && promo.usage_count >= promo.usage_limit
        const isActive = promo.is_active && !isExpired && !isLimitReached

        return (
          <section 
            key={promo.id} 
            className={`group relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:ring-white/20 ${!isActive ? 'opacity-75' : ''}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${isActive ? 'from-rose-500/10' : 'from-gray-500/10'} via-transparent to-transparent pointer-events-none`} />
            
            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-2xl text-white tracking-tighter group-hover:text-rose-400 transition-colors uppercase">
                      {promo.code}
                    </span>
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isActive ? 'Активен' : isExpired ? 'Истек' : isLimitReached ? 'Исчерпан' : 'Неактивен'}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(promo.id, promo.is_active)}
                    className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                      promo.is_active 
                        ? 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    title={promo.is_active ? 'Деактивировать' : 'Активировать'}
                  >
                    {promo.is_active ? <X className="size-4" /> : <Check className="size-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
                    title="Удалить"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Скидка</span>
                  <span className="text-xl font-bold text-white font-oswald">
                    {promo.discount_type === 'percent'
                      ? `${promo.discount_value}%`
                      : `${promo.discount_value} ₽`
                    }
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-full opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <Users className="size-3" />
                    Использовано
                  </div>
                  <div className="text-sm font-bold text-white/80">
                    {promo.usage_count} <span className="text-white/20 font-normal">/ {promo.usage_limit || '∞'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <Clock className="size-3" />
                    Истекает
                  </div>
                  <div className="text-sm font-bold text-white/80">
                    {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('ru-RU') : '—'}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Создан: {promo.created_at ? new Date(promo.created_at).toLocaleDateString('ru-RU') : '—'}
                </span>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse-glow' : 'bg-rose-500'}`} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.96 1.7L10.5 8a2 2 0 0 0 3 0l.64-3.3a2 2 0 0 1 1.96-1.7H20a2 2 0 0 1 2 2v4"></path>
      <path d="M2 15v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"></path>
      <path d="M2 12h20"></path>
    </svg>
  )
}
