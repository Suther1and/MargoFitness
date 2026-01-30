'use client'

import { useState } from 'react'
import { createWorkoutSession } from '@/lib/actions/admin'
import { ArrowLeft, Sparkles, Type, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateDemoWorkoutPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: 'Демо тренировка',
    description: 'Посмотрите пример нашей тренировки!',
    estimated_duration: 45,
    required_tier: 'free' as const,
    is_demo: true,
    session_number: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createWorkoutSession({
      week_id: null as any,
      ...formData,
    })

    setLoading(false)

    if (result.success) {
      router.push('/admin/weeks')
      router.refresh()
    } else {
      setError(result.error || 'Ошибка создания')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <Link 
        href="/admin/weeks" 
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        <span>Назад к контенту</span>
      </Link>

      <div className="space-y-8 bg-[#0A0A0A] ring-1 ring-white/10 rounded-[2.5rem] p-8 md:p-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="size-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-tight">Новая демо-тренировка</h1>
          </div>
          <p className="text-white/40 text-sm pl-15">Эта тренировка будет видна всем новым пользователям (Free)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Type className="size-3" />
              Название
            </label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock className="size-3" />
              Длительность (мин)
            </label>
            <input
              type="number"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Создание...' : 'Создать демонстрацию'}
          </button>
        </form>
      </div>
    </div>
  )
}
