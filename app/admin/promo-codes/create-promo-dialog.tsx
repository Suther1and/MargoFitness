'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X, Ticket, Percent, DollarSign, Users, Clock, Type } from 'lucide-react'
import { createPromoCode } from '@/lib/actions/promo-codes'
import { useRouter } from 'next/navigation'

export function CreatePromoDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed_amount'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createPromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt || null,
    })

    if (result.success) {
      setOpen(false)
      setCode('')
      setDiscountValue('')
      setUsageLimit('')
      setExpiresAt('')
      router.refresh()
    } else {
      setError(result.error || 'Ошибка создания промокода')
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all hover:brightness-110 active:scale-95">
          <Plus className="size-4" />
          Создать промокод
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          >
            <X className="size-5 text-white/40" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <DialogHeader className="relative z-10 mb-8 text-left">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Новый промокод</DialogTitle>
            <DialogDescription className="text-white/50">Создайте скидку для ваших клиентов</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Code */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <Type className="size-3" />
                  Код (только латиница) *
                </label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="NEWYEAR2025"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-mono uppercase tracking-widest"
                />
              </div>

              {/* Type Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Тип скидки *</label>
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      discountType === 'percent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <Percent className="size-3" />
                    Процент
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed_amount')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      discountType === 'fixed_amount' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <DollarSign className="size-3" />
                    Фиксированная
                  </button>
                </div>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  {discountType === 'percent' ? <Percent className="size-3" /> : <DollarSign className="size-3" />}
                  Значение скидки *
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percent' ? '10' : '500'}
                  required
                  min="0"
                  max={discountType === 'percent' ? '100' : undefined}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-oswald text-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <Users className="size-3" />
                    Лимит
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="100"
                    min="1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <Clock className="size-3" />
                    Истекает
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-500/20"
              >
                {loading ? 'Создание...' : 'Создать промокод'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
