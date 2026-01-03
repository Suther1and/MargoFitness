'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Save, Loader2, Calendar } from 'lucide-react'

import { Profile, DiarySettings, DiaryEntry } from '@/types/database'
import { upsertDiaryEntry, getDiaryEntries } from '@/lib/actions/diary'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner' // Assuming sonner is used, or use generic toast

import { WaterTracker } from './components/water-tracker'
import { SleepTracker } from './components/sleep-tracker'
import { WeightTracker } from './components/weight-tracker'
import { MoodTracker } from './components/mood-tracker'
import { HabitsWidget, Habit } from './components/habits-widget'

interface DiaryDashboardProps {
  profile: Profile
  settings: DiarySettings | null
  initialEntry: DiaryEntry | null
}

interface Metrics {
  water: number
  water_goal: number
  sleep: number
  weight: number
  mood: string | null
  habits: Habit[]
}

const DEFAULT_HABITS: Habit[] = [
  { id: '1', title: 'Креатин 5г', completed: false, streak: 0, category: 'morning' },
  { id: '2', title: 'Вакуум живота', completed: false, streak: 0, category: 'morning' },
  { id: '3', title: 'Чтение 20 мин', completed: false, streak: 0, category: 'evening' },
  { id: '4', title: 'Без сахара', completed: false, streak: 0, category: 'anytime' },
]

export default function DiaryDashboard({ profile, settings, initialEntry }: DiaryDashboardProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // State for metrics
  const [metrics, setMetrics] = useState<Metrics>({
    water: 0,
    water_goal: 2500,
    sleep: 7,
    weight: 0,
    mood: null,
    habits: DEFAULT_HABITS
  })

  const [notes, setNotes] = useState('')

  // Debounce saving
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load initial data
  useEffect(() => {
    if (initialEntry) {
      const savedMetrics = initialEntry.metrics as any
      setMetrics({
        water: savedMetrics.water || 0,
        water_goal: savedMetrics.water_goal || 2500,
        sleep: savedMetrics.sleep || 7,
        weight: savedMetrics.weight || 0,
        mood: savedMetrics.mood || null,
        habits: Array.isArray(savedMetrics.habits) ? savedMetrics.habits : DEFAULT_HABITS
      })
      setNotes(initialEntry.notes || '')
    }
  }, [initialEntry])

  // Handle Date Change
  const handleDateChange = async (newDate: Date) => {
    setDate(newDate)
    setLoading(true)
    
    const dateStr = format(newDate, 'yyyy-MM-dd')
    const res = await getDiaryEntries(profile.id, dateStr, dateStr)
    
    if (res.success && res.data && res.data.length > 0) {
      const entry = res.data[0]
      const savedMetrics = entry.metrics as any
      setMetrics({
        water: savedMetrics.water || 0,
        water_goal: savedMetrics.water_goal || 2500,
        sleep: savedMetrics.sleep || 7,
        weight: savedMetrics.weight || 0,
        mood: savedMetrics.mood || null,
        habits: Array.isArray(savedMetrics.habits) ? savedMetrics.habits : DEFAULT_HABITS
      })
      setNotes(entry.notes || '')
    } else {
      // Reset to defaults for new day
      // Optionally preserve weight from previous day? 
      // For now reset daily metrics, keep habits structure
      setMetrics(prev => ({
        water: 0,
        water_goal: 2500,
        sleep: 7,
        weight: prev.weight, // Keep weight
        mood: null,
        habits: prev.habits.map(h => ({ ...h, completed: false }))
      }))
      setNotes('')
    }
    setLoading(false)
  }

  // Auto-save effect
  const saveData = async (currentMetrics: Metrics, currentNotes: string) => {
    setSaving(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    await upsertDiaryEntry(profile.id, dateStr, currentMetrics, currentNotes)
    
    setSaving(false)
  }

  const debouncedSave = (newMetrics: Metrics, newNotes: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    timeoutRef.current = setTimeout(() => {
      saveData(newMetrics, newNotes)
    }, 1000)
  }

  const updateMetric = (key: keyof Metrics, value: any) => {
    const newMetrics = { ...metrics, [key]: value }
    setMetrics(newMetrics)
    debouncedSave(newMetrics, notes)
  }

  const toggleHabit = (id: string) => {
    const newHabits = metrics.habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    )
    updateMetric('habits', newHabits)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background/50 space-y-8 max-w-7xl mx-auto">
      {/* Header & Date Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-oswald font-bold uppercase tracking-wide">
            Дневник <span className="text-primary">Здоровья</span>
          </h1>
          <p className="text-muted-foreground">Твой прогресс — шаг за шагом</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-2 rounded-2xl shadow-sm border">
          <Button variant="ghost" size="icon" onClick={() => handleDateChange(addDays(date, -1))}>
            <ChevronLeft />
          </Button>
          <div className="flex flex-col items-center px-4 w-32">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              {format(date, 'EEEE', { locale: ru })}
            </span>
            <span className="text-lg font-bold">
              {format(date, 'd MMMM', { locale: ru })}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleDateChange(addDays(date, 1))}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Main Metrics Grid */}
          <div className="md:col-span-2 row-span-2">
            <WaterTracker 
              value={metrics.water} 
              goal={metrics.water_goal} 
              onChange={(v) => updateMetric('water', v)} 
            />
          </div>
          
          <div className="md:col-span-1">
            <SleepTracker 
              value={metrics.sleep} 
              onChange={(v) => updateMetric('sleep', v)} 
            />
          </div>

          <div className="md:col-span-1">
            <WeightTracker 
              value={metrics.weight} 
              onChange={(v) => updateMetric('weight', v)} 
            />
          </div>

          <div className="md:col-span-2">
             <MoodTracker 
              value={metrics.mood || ''} 
              onChange={(v) => updateMetric('mood', v)} 
            />
          </div>

          {/* Habits Section - Full Width Bottom */}
          <div className="md:col-span-4">
            <HabitsWidget 
              habits={metrics.habits} 
              onToggle={toggleHabit} 
            />
          </div>

        </motion.div>
      )}

      {/* Saving Indicator */}
      <div className="fixed bottom-4 right-4">
        <AnimatePresence>
          {saving && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Сохранение...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

