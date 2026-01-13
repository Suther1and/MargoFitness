'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAchievements() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setData({ error: 'Не авторизован' })
        setLoading(false)
        return
      }

      // Получаем ВСЕ достижения с кастомными иконками
      const { data: customAchievements, error: customError } = await supabase
        .from('achievements')
        .select('id, title, icon, icon_url, category, sort_order')
        .in('title', ['Первый шаг', 'Первая отметка', 'Постоянство'])
        .order('sort_order')

      // Получаем последние достижения пользователя
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(5)

      setData({ 
        userId: user.id,
        customAchievements, 
        customError,
        userAchievements, 
        userError,
      })
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return <div className="p-8">Загрузка...</div>

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug: Достижения</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">1. Кастомные достижения в БД</h2>
        <div className="bg-gray-900 p-4 rounded overflow-auto">
          {data?.customAchievements?.map((ach: any) => (
            <div key={ach.id} className="mb-4 pb-4 border-b border-gray-700">
              <div className="font-bold">{ach.title}</div>
              <div className="text-xs text-gray-400">ID: {ach.id}</div>
              <div className="text-xs">Icon: {ach.icon}</div>
              <div className="text-xs">
                Icon URL: {ach.icon_url ? (
                  <span className="text-green-400">{ach.icon_url}</span>
                ) : (
                  <span className="text-red-400">NULL</span>
                )}
              </div>
              {ach.icon_url && (
                <img src={ach.icon_url} alt={ach.title} className="w-12 h-12 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">2. Последние достижения пользователя</h2>
        <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(data?.userAchievements, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">3. Полные данные</h2>
        <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
