'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrackerSettings } from '../hooks/use-tracker-settings'
import { WidgetId, WIDGET_CONFIGS } from '../types'
import { HabitsSection } from './components/habits-section'

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
    // Фильтруем только цифры и точку
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

  const sortedWidgets = getSortedWidgets()

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-amber-500/30 font-sans">
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-8">
            {/* Left: Back button + Title */}
            <div className="flex-1">
              <Link href="/dashboard/health-tracker">
                <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Назад</span>
                </button>
              </Link>
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-oswald font-bold tracking-tighter uppercase leading-none">
                  Настройки <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">трекера</span>
                </h1>
                <p className="text-sm text-white/60">
                  Выберите виджеты для отслеживания
                </p>
              </div>
            </div>
            
            {/* Right: Параметры ИМТ (компактно, горизонтально) */}
            <div className="hidden lg:flex items-center gap-3 pt-12">
              <div className="space-y-1">
                <label className="block text-xs text-white/40 whitespace-nowrap">Рост (см)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="170"
                  value={localSettings.userParams.height ?? ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-base text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-white/40 whitespace-nowrap">Вес (кг)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="72"
                  value={localSettings.userParams.weight ?? ''}
                  onChange={(e) => handleParamChange('weight', e.target.value)}
                  className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-base text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-white/40 whitespace-nowrap">Возраст</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="28"
                  value={localSettings.userParams.age ?? ''}
                  onChange={(e) => handleParamChange('age', e.target.value)}
                  className="w-16 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-base text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Табы */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('widgets')}
            className={cn(
              "px-4 py-2 font-medium transition-colors relative",
              activeTab === 'widgets'
                ? "text-white"
                : "text-white/40 hover:text-white/60"
            )}
          >
            Виджеты
            {activeTab === 'widgets' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={cn(
              "px-4 py-2 font-medium transition-colors relative",
              activeTab === 'habits'
                ? "text-white"
                : "text-white/40 hover:text-white/60"
            )}
          >
            Привычки
            {activeTab === 'habits' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-32">
        {activeTab === 'widgets' && (
          <>
            {/* Виджеты */}
            <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Виджеты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedWidgets.map(widgetId => {
                const config = WIDGET_CONFIGS[widgetId]
                const widget = localSettings.widgets[widgetId]
                
                return (
                  <motion.div
                    key={widgetId}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleToggle(widgetId)}
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer transition-all",
                      widget.enabled 
                        ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                    )}
                  >
                    {/* Горизонтальная раскладка: Название + Инпут + Звездочка */}
                    <div className="flex items-center gap-3 min-h-[40px]">
                      {/* Название */}
                      <span className={cn(
                        "font-medium whitespace-nowrap shrink-0 min-w-[100px]",
                        widget.enabled ? "text-white" : "text-white/60"
                      )}>
                        {config.name}
                      </span>
                      
                      {/* Инпут цели (всегда есть для виджетов с целью, но невидим для неактивных) */}
                      {config.hasGoal ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={widget.enabled ? `Цель (${config.goalUnit})` : ''}
                          value={widget.goal ?? ''}
                          onChange={(e) => handleGoalChange(widgetId, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={!widget.enabled}
                          className={cn(
                            "flex-1 border rounded-lg px-3 py-1.5 text-base transition-colors h-[40px]",
                            widget.enabled
                              ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50"
                              : "bg-transparent border-transparent text-transparent placeholder:text-transparent pointer-events-none"
                          )}
                        />
                      ) : (
                        <div className="flex-1" />
                      )}
                      
                      {/* Звездочка (не показываем для настроения) */}
                      {widgetId !== 'mood' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (widget.enabled) {
                              handleToggleInPlan(widgetId)
                            }
                          }}
                          disabled={!widget.enabled}
                          className={cn(
                            "p-2 rounded-lg transition-colors shrink-0",
                            widget.enabled 
                              ? "hover:bg-white/10 cursor-pointer" 
                              : "pointer-events-none opacity-0"
                          )}
                          title={widget.enabled ? "Добавить в план на день" : ""}
                        >
                          <Star className={cn(
                            "w-4 h-4 transition-colors",
                            widget.inDailyPlan 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-white/40"
                          )} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>
          </>
        )}

        {activeTab === 'habits' && (
          <HabitsSection />
        )}
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative p-4 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/5 z-20">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 ring-1 ring-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 hover:ring-green-500/40 text-white font-semibold transition-all active:scale-[0.98]"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  )
}

