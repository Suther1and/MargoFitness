'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils, Activity, Zap, Apple, ChevronLeft, Info, Camera, NotebookText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrackerSettings } from '../hooks/use-tracker-settings'
import { WidgetId, WIDGET_CONFIGS } from '../types'
import { HabitsSection } from './components/habits-section'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

const ICON_MAP: Record<string, any> = {
  water: Droplets,
  steps: Footprints,
  weight: Scale,
  caffeine: Coffee,
  sleep: Moon,
  mood: Smile,
  nutrition: Utensils,
  photos: Camera,
  notes: NotebookText,
}

export default function TrackerSettingsPage() {
  const router = useRouter()
  const { settings, saveSettings } = useTrackerSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'widgets' | 'habits'>('widgets')
  const [isBmiInfoOpen, setIsBmiInfoOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Синхронизация с настройками
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleToggle = (widgetId: WidgetId) => {
    setLocalSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          enabled: !prev.widgets[widgetId].enabled,
        }
      }
    }))
  }

  const handleGoalChange = (widgetId: WidgetId, value: string) => {
    const filtered = value.replace(/[^\d.]/g, '')
    setLocalSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          goal: filtered ? parseFloat(filtered) : null,
        }
      }
    }))
  }

  const handleToggleInPlan = (widgetId: WidgetId) => {
    setLocalSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          inDailyPlan: !prev.widgets[widgetId].inDailyPlan,
        }
      }
    }))
  }

  const handleParamChange = (param: 'height' | 'weight' | 'age', value: string) => {
    const filtered = value.replace(/[^\d.]/g, '').slice(0, 3)
    setLocalSettings(prev => ({
      ...prev,
      userParams: {
        ...prev.userParams,
        [param]: filtered ? parseFloat(filtered) : null,
      }
    }))
  }

  const handleSave = () => {
    saveSettings(localSettings)
    router.push('/dashboard/health-tracker')
  }

  const calculateBMI = () => {
    const { height, weight } = localSettings.userParams
    if (height && weight) {
      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      return bmi.toFixed(1)
    }
    return null
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Дефицит веса', color: 'text-blue-400', description: 'Твой вес ниже нормы. Рекомендуется проконсультироваться с врачом для коррекции питания.' }
    if (bmi < 25) return { label: 'Норма', color: 'text-green-400', description: 'Поздравляю! Твой вес находится в идеальном диапазоне для твоего роста.' }
    if (bmi < 30) return { label: 'Лишний вес', color: 'text-amber-400', description: 'Твой вес немного выше нормы. Это может быть поводом обратить внимание на активность и питание.' }
    return { label: 'Ожирение', color: 'text-red-400', description: 'Твой ИМТ указывает на избыточный вес. Рекомендуется обсудить план действий со специалистом.' }
  }

  const bmiValue = calculateBMI()
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null

  // Группировка виджетов
  const widgetGroups = [
    { name: 'Активность', icon: Zap, widgets: ['steps', 'sleep', 'mood'] },
    { name: 'Питание и баланс', icon: Apple, widgets: ['water', 'caffeine', 'nutrition'] },
    { name: 'Тело', icon: Scale, widgets: ['weight', 'photos', 'notes'] }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-green-500/30 font-sans pb-20">
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-[#09090b]/40 backdrop-blur-2xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-4">
              <Link href="/dashboard/health-tracker">
                <motion.button 
                  whileHover={{ x: -4 }}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Назад к трекеру</span>
                </motion.button>
              </Link>
              <h1 className="text-4xl md:text-5xl font-oswald font-black uppercase tracking-tighter flex items-center gap-4">
                Настройки <span className="text-green-500">трекера</span>
              </h1>
            </div>

            {/* Unified Metrics Panel */}
            <div className="flex items-stretch bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl h-[68px] min-w-[420px]">
              {/* Inputs Group */}
              <div className="flex items-center p-1 border-r border-white/5 bg-white/[0.02] flex-1">
                <div className="flex flex-col px-4 py-2 border-r border-white/5 w-[100px]">
                  <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Рост</label>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="---"
                      value={localSettings.userParams.height ?? ''}
                      onChange={(e) => handleParamChange('height', e.target.value)}
                      className="w-full bg-transparent text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                    />
                    <span className="text-[10px] font-bold text-white/10 uppercase">см</span>
                  </div>
                </div>

                <div className="flex flex-col px-4 py-2 border-r border-white/5 w-[100px]">
                  <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Вес</label>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="---"
                      value={localSettings.userParams.weight ?? ''}
                      onChange={(e) => handleParamChange('weight', e.target.value)}
                      className="w-full bg-transparent text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                    />
                    <span className="text-[10px] font-bold text-white/10 uppercase">кг</span>
                  </div>
                </div>

                <div className="flex flex-col px-4 py-2 w-[80px]">
                  <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Возраст</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="--"
                    value={localSettings.userParams.age ?? ''}
                    onChange={(e) => handleParamChange('age', e.target.value)}
                    className="w-full bg-transparent text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                  />
                </div>
              </div>

              {/* BMI Result Group */}
              <div className={cn(
                "px-4 py-2 flex flex-col transition-all duration-500 w-[115px] shrink-0 relative",
                bmiValue ? "bg-white/[0.05]" : "bg-transparent"
              )}>
                {bmiValue ? (
                  <>
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5 whitespace-nowrap">Твой ИМТ</span>
                    <div className="flex items-center mt-auto pb-0.5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[34px] font-oswald font-black text-white leading-none tracking-tighter shrink-0">
                          {bmiValue}
                        </span>
                        <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.2)] mt-1 shrink-0", 
                          bmiCategory?.color === 'text-blue-400' && 'bg-blue-400',
                          bmiCategory?.color === 'text-green-400' && 'bg-green-400',
                          bmiCategory?.color === 'text-amber-400' && 'bg-amber-400',
                          bmiCategory?.color === 'text-red-400' && 'bg-red-400'
                        )} />
                      </div>
                    </div>

                    <div className="absolute right-0 top-0">
                      <Dialog open={isBmiInfoOpen} onOpenChange={setIsBmiInfoOpen}>
                        <DialogTrigger asChild>
                          <button className="p-2 text-white/40 hover:text-white transition-all shrink-0 focus:outline-none focus:ring-0 outline-none ring-0">
                            <Info className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent 
                          className="bg-zinc-900/95 border-white/10 text-white rounded-2xl max-w-sm backdrop-blur-xl"
                          onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                          <DialogHeader>
                            <DialogTitle className="font-oswald font-black text-2xl uppercase tracking-tight">Что такое ИМТ?</DialogTitle>
                            <DialogDescription className="text-white/60 text-sm leading-relaxed pt-2 font-medium">
                              Индекс массы тела (ИМТ) — это величина, позволяющая оценить степень соответствия массы человека и его роста.
                              <br /><br />
                              Формула: вес (кг) / рост² (м).
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Твой результат</span>
                              <span className={cn("text-2xl font-oswald font-black", bmiCategory?.color)}>{bmiValue}</span>
                            </div>
                            <div className={cn("text-xs font-bold uppercase tracking-wider", bmiCategory?.color)}>
                              Категория: {bmiCategory?.label}
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed pt-1 font-medium">
                              {bmiCategory?.description}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-tight text-center">Заполни данные</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Табы и Кнопка сохранения */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mt-2">
        <div className="flex items-center justify-between p-1 bg-white/5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md h-[54px]">
          <div className="flex h-full gap-1">
            <button
              onClick={() => setActiveTab('widgets')}
              className={cn(
                "px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden h-full flex items-center",
                activeTab === 'widgets'
                  ? "text-[#09090b]"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {activeTab === 'widgets' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-green-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Виджеты</span>
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={cn(
                "px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden h-full flex items-center",
                activeTab === 'habits'
                  ? "text-[#09090b]"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {activeTab === 'habits' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-green-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Привычки</span>
            </button>
          </div>

          {/* Кнопка сохранения для десктопа */}
          <button
            onClick={handleSave}
            className="hidden md:flex items-center gap-2 px-6 h-full bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-[#09090b] rounded-xl border border-green-500/20 hover:border-green-500 transition-all duration-300 group font-black text-[10px] uppercase tracking-[0.2em]"
          >
            Сохранить настройки
            <ChevronLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'widgets' ? (
            <motion.div
              key="widgets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {widgetGroups.map((group) => {
                const GroupIcon = group.icon
                return (
                  <div key={group.name} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <GroupIcon className="w-4 h-4 text-green-500/50" strokeWidth={2.5} />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">{group.name}</h2>
                      <div className="h-px bg-white/5 w-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {group.widgets.map(widgetId => {
                        const id = widgetId as WidgetId
                        const config = WIDGET_CONFIGS[id]
                        const widget = localSettings.widgets[id]
                        const Icon = ICON_MAP[id]
                        
                        return (
                          <motion.div
                            key={id}
                            layout
                            onClick={() => handleToggle(id)}
                            className={cn(
                              "group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 cursor-pointer",
                              widget.enabled 
                                ? "border-green-500/30 bg-zinc-900/80 shadow-[0_0_40px_rgba(34,197,94,0.05)]"
                                : "border-white/5 bg-white/[0.01] hover:border-green-500/30"
                            )}
                          >
                            <div className={cn(
                              "relative z-10 p-6 flex flex-col h-full min-h-[170px] transition-opacity duration-500",
                              !widget.enabled && "opacity-60 group-hover:opacity-100"
                            )}>
                              <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700 border shadow-inner shrink-0",
                                    widget.enabled 
                                      ? "bg-green-500/20 border-green-500/20 text-green-400" 
                                      : "bg-white/5 border-white/5 text-white/20"
                                  )}>
                                    <Icon className="w-5 h-5" strokeWidth={2.25} />
                                  </div>
                                  <div className="flex flex-col">
                                    <h3 className={cn(
                                      "font-oswald font-black text-xl uppercase tracking-tight transition-colors duration-500",
                                      widget.enabled ? "text-white" : "text-white/40"
                                    )}>
                                      {config.name}
                                    </h3>
                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">
                                      {config.description}
                                    </p>
                                  </div>
                                </div>

                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                  widget.enabled 
                                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" 
                                    : "bg-white/10"
                                )} />
                              </div>

                              {config.hasGoal && (
                                <div className="mt-auto flex items-end gap-3">
                                  <div 
                                    className="relative flex-1"
                                    onClick={(e) => widget.enabled && e.stopPropagation()}
                                  >
                                    {widget.enabled ? (
                                      <input
                                        type="text"
                                        value={widget.goal ?? ''}
                                        onChange={(e) => handleGoalChange(id, e.target.value)}
                                        placeholder="Цель"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg font-oswald font-black text-white placeholder:text-white/10 focus:outline-none focus:border-green-500/50 transition-all"
                                      />
                                    ) : (
                                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 h-[54px] flex items-center pointer-events-none">
                                        <div className="flex items-center gap-2 opacity-20">
                                          <div className="w-12 h-4 bg-white/10 rounded animate-pulse" />
                                          <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    {widget.enabled && (
                                      <span className="absolute right-4 bottom-[14px] text-[9px] font-black text-white/20 uppercase tracking-widest pointer-events-none">
                                        {config.goalUnit}
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToggleInPlan(id)
                                    }}
                                    className={cn(
                                      "w-[54px] h-[54px] rounded-2xl flex items-center justify-center transition-all duration-500 border",
                                      widget.inDailyPlan
                                        ? "bg-amber-500/20 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                        : "bg-white/5 border-white/10 text-white/10 hover:text-white/30"
                                    )}
                                  >
                                    <Star 
                                      className={cn("w-5 h-5 transition-transform duration-500", widget.inDailyPlan && "fill-current")} 
                                      strokeWidth={2.25} 
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="habits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HabitsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Save Button for Mobile */}
      <div className="fixed bottom-8 left-0 right-0 z-[60] px-4 md:hidden">
        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-400 text-black h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <Activity className="w-4 h-4" />
          Сохранить настройки
        </button>
      </div>
    </div>
  )
}
