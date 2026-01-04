'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils, Ruler, User, Activity, Sparkles, Zap, Apple, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrackerSettings } from '../hooks/use-tracker-settings'
import { WidgetId, WIDGET_CONFIGS } from '../types'
import { HabitsSection } from './components/habits-section'

const ICON_MAP: Record<WidgetId, any> = {
  water: Droplets,
  steps: Footprints,
  weight: Scale,
  caffeine: Coffee,
  sleep: Moon,
  mood: Smile,
  nutrition: Utensils,
}

export default function TrackerSettingsPage() {
  const router = useRouter()
  const { settings, saveSettings, getSortedWidgets } = useTrackerSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'widgets' | 'habits'>('widgets')

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
    const filtered = value.replace(/[^\d.]/g, '')
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
    if (bmi < 18.5) return { label: 'Дефицит веса', color: 'text-blue-400' }
    if (bmi < 25) return { label: 'Норма', color: 'text-green-400' }
    if (bmi < 30) return { label: 'Лишний вес', color: 'text-amber-400' }
    return { label: 'Ожирение', color: 'text-red-400' }
  }

  const bmiValue = calculateBMI()
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null

  // Группировка виджетов
  const widgetGroups = [
    { name: 'Активность', icon: Zap, widgets: ['steps', 'sleep', 'mood'] },
    { name: 'Питание и баланс', icon: Apple, widgets: ['water', 'caffeine', 'nutrition'] },
    { name: 'Тело', icon: Scale, widgets: ['weight'] }
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
      <header className="relative z-10 border-b border-white/5 bg-[#09090b]/40 backdrop-blur-2xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-4">
              <Link href="/dashboard/health-tracker">
                <motion.button 
                  whileHover={{ x: -4 }}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Назад к трекеру</span>
                </motion.button>
              </Link>
              <h1 className="text-3xl md:text-5xl font-oswald font-black tracking-tighter uppercase leading-none">
                Настройки <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">трекера</span>
              </h1>
            </div>
            
            {/* Unified Metrics Panel */}
            <div className="flex items-stretch bg-white/[0.03] rounded-[2rem] border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl">
              {/* Inputs Group */}
              <div className="flex items-center p-1.5 border-r border-white/5 bg-white/[0.02]">
                <div className="flex flex-col px-4 py-2 border-r border-white/5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Рост</label>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="---"
                      value={localSettings.userParams.height ?? ''}
                      onChange={(e) => handleParamChange('height', e.target.value)}
                      className="w-10 bg-transparent text-lg font-oswald font-black text-white focus:outline-none placeholder:text-white/5"
                    />
                    <span className="text-[8px] font-bold text-white/10 uppercase">см</span>
                  </div>
                </div>

                <div className="flex flex-col px-4 py-2 border-r border-white/5">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Вес</label>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="---"
                      value={localSettings.userParams.weight ?? ''}
                      onChange={(e) => handleParamChange('weight', e.target.value)}
                      className="w-10 bg-transparent text-lg font-oswald font-black text-white focus:outline-none placeholder:text-white/5"
                    />
                    <span className="text-[8px] font-bold text-white/10 uppercase">кг</span>
                  </div>
                </div>

                <div className="flex flex-col px-4 py-2">
                  <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Возраст</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="--"
                    value={localSettings.userParams.age ?? ''}
                    onChange={(e) => handleParamChange('age', e.target.value)}
                    className="w-8 bg-transparent text-lg font-oswald font-black text-white focus:outline-none placeholder:text-white/5"
                  />
                </div>
              </div>

              {/* BMI Result Group */}
              <div className={cn(
                "px-6 flex flex-col justify-center transition-all duration-500",
                bmiValue ? "bg-white/[0.05] min-w-[120px]" : "bg-transparent opacity-30"
              )}>
                {bmiValue ? (
                  <>
                    <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Твой ИМТ</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-oswald font-black text-white">{bmiValue}</span>
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                        bmiCategory?.color.replace('text-', 'bg-')
                      )} />
                    </div>
                  </>
                ) : (
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-tight max-w-[80px]">Заполни данные для ИМТ</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Табы */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mt-8">
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-fit shadow-lg backdrop-blur-md">
          <button
            onClick={() => setActiveTab('widgets')}
            className={cn(
              "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
              activeTab === 'widgets'
                ? "bg-green-500 text-[#09090b] shadow-[0_10px_25px_rgba(34,197,94,0.3)]"
                : "text-white/30 hover:text-white/60"
            )}
          >
            Виджеты
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={cn(
              "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
              activeTab === 'habits'
                ? "bg-green-500 text-[#09090b] shadow-[0_10px_25px_rgba(34,197,94,0.3)]"
                : "text-white/30 hover:text-white/60"
            )}
          >
            Привычки
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-32">
        {activeTab === 'widgets' && (
          <div className="space-y-12">
            {widgetGroups.map((group) => {
              const GroupIcon = group.icon
              return (
                <div key={group.name} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <GroupIcon className="w-4 h-4 text-green-500/50" strokeWidth={2.5} />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">{group.name}</h2>
                    <div className="h-px bg-white/5 w-full" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            "group relative overflow-hidden rounded-[2.5rem] border transition-all duration-700 cursor-pointer",
                            widget.enabled 
                              ? "border-green-500/30 bg-zinc-900/80 shadow-[0_0_40px_rgba(34,197,94,0.05)]"
                              : "border-white/5 bg-white/[0.01] opacity-40 hover:opacity-60"
                          )}
                        >
                          <div className="relative z-10 p-7 flex flex-col h-full min-h-[190px]">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 border shadow-inner shrink-0",
                                  widget.enabled 
                                    ? "bg-green-500/20 border-green-500/20 text-green-400" 
                                    : "bg-white/5 border-white/5 text-white/5"
                                )}>
                                  <Icon className="w-6 h-6" strokeWidth={2.25} />
                                </div>
                                <div>
                                  <h3 className={cn(
                                    "font-oswald font-bold text-2xl uppercase tracking-tight",
                                    widget.enabled ? "text-white" : "text-white/20"
                                  )}>
                                    {config.name}
                                  </h3>
                                  <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest leading-none">
                                    {config.description}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Indicator of state instead of toggle */}
                              <div className={cn(
                                "w-2 h-2 rounded-full transition-all duration-500",
                                widget.enabled ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-white/10"
                              )} />
                            </div>

                            <div className="mt-auto flex items-center gap-4">
                              {config.hasGoal ? (
                                <div className="flex-1 relative" onClick={e => widget.enabled && e.stopPropagation()}>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={widget.enabled ? "Цель" : ""}
                                    value={widget.goal ?? ''}
                                    onChange={(e) => handleGoalChange(id, e.target.value)}
                                    disabled={!widget.enabled}
                                    className={cn(
                                      "w-full bg-white/5 border rounded-2xl px-5 py-4 text-xl font-oswald font-black transition-all focus:outline-none",
                                      widget.enabled
                                        ? "text-white border-white/10 focus:border-green-500/50 focus:bg-white/10 shadow-inner"
                                        : "border-transparent text-transparent placeholder:text-transparent pointer-events-none"
                                    )}
                                  />
                                  {widget.enabled ? (
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest pointer-events-none">
                                      {config.goalUnit}
                                    </span>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center px-5 pointer-events-none opacity-20">
                                      <div className="flex items-center gap-2">
                                        <div className="w-12 h-4 bg-white/10 rounded animate-pulse" />
                                        <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center text-white/20 italic text-xs px-2 pointer-events-none">
                                  <Sparkles className="w-3 h-3 mr-2 opacity-50" />
                                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Цель не требуется</span>
                                </div>
                              )}
                              
                              {id !== 'mood' && widget.enabled && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleInPlan(id);
                                  }}
                                  className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg",
                                    widget.inDailyPlan 
                                      ? "bg-amber-400/20 border-amber-400/30 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.15)]" 
                                      : "bg-white/5 border-white/10 text-white/10 hover:text-white/30"
                                  )}
                                  title="В план на день"
                                >
                                  <Star className={cn("w-6 h-6", widget.inDailyPlan && "fill-amber-400")} />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'habits' && (
          <HabitsSection />
        )}
      </main>

      {/* Fixed bottom Save button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full py-5 rounded-[2.5rem] bg-green-500 text-[#09090b] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3 transition-all hover:bg-green-400"
        >
          <Activity className="w-5 h-5" />
          Сохранить настройки
        </motion.button>
      </div>
    </div>
  )
}
