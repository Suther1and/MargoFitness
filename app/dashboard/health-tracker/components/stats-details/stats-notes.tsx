"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NotebookText, Calendar, Smile } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getNotesStats } from "@/lib/actions/health-stats"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface StatsNotesProps {
  userId: string | null
  dateRange: { start: Date; end: Date }
}

const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']

export function StatsNotes({ userId, dateRange }: StatsNotesProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        const result = await getNotesStats(userId, dateRange)
        
        if (result.success && result.data && Array.isArray(result.data)) {
          const notesData = result.data.map((entry: any) => ({
            date: format(new Date(entry.date), 'd MMMM, EEEE', { locale: ru }),
            notes: entry.notes,
            mood: entry.mood
          }))
          
          setData(notesData)
        }
      } catch (err) {
        console.error('Error loading notes stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [userId, dateRange])
  
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка заметок...</p>
        </div>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <NotebookText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет заметок</h3>
          <p className="text-white/40 text-sm">Начните вести дневник наблюдений в трекере</p>
        </div>
      </div>
    )
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
            <NotebookText className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white/90">Заметки</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">Всего записей: {data.length}</p>
          </div>
        </div>
      </motion.div>

      {data.map((note, index) => (
        <motion.div key={index} variants={item}>
          <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium capitalize">{note.date}</span>
              </div>
              {note.mood && (
                <div className="flex items-center gap-2">
                  <Smile className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-lg">{moodEmojis[note.mood - 1]}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{note.notes}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
