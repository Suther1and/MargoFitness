'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Check, Target, Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrackerSettings } from '../hooks/use-tracker-settings'
import { WidgetId, WIDGET_CONFIGS } from '../types'

interface TrackerSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFirstTime?: boolean
}

// Маппинг иконок
const ICON_MAP = {
  Droplets,
  Footprints,
  Scale,
  Coffee,
  Moon,
  Smile,
  Utensils,
}

export function TrackerSettingsDialog({ 
  open, 
  onOpenChange,
  isFirstTime = false 
}: TrackerSettingsDialogProps) {
  const {
    settings,
    saveSettings,
    toggleWidget,
    updateGoal,
    toggleInDailyPlan,
    updateUserParams,
    getSortedWidgets,
  } = useTrackerSettings()

  const [localSettings, setLocalSettings] = useState(settings)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Синхронизация с настройками при открытии
  useEffect(() => {
    if (open) {
      setLocalSettings(settings)
      setErrors({})
    }
  }, [open, settings])

  // Обработчик переключения виджета
  const handleToggleWidget = (widgetId: WidgetId) => {
    setLocalSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          enabled: !prev.widgets[widgetId].enabled,
        },
      },
    }))
  }

  // Обработчик изменения цели
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
        },
      },
    }))
  }

  // Обработчик изменения параметров пользователя
  const handleParamChange = (param: 'height' | 'weight' | 'age', value: string) => {
    const filtered = value.replace(/[^\d.]/g, '')
    
    setLocalSettings(prev => ({
      ...prev,
      userParams: {
        ...prev.userParams,
        [param]: filtered ? parseFloat(filtered) : null,
      },
    }))
  }

  // Обработчик переключения "в план"
  const handleToggleInPlan = (widgetId: WidgetId, e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          inDailyPlan: !prev.widgets[widgetId].inDailyPlan,
        },
      },
    }))
  }

  // Сохранение настроек
  const handleSave = () => {
    saveSettings(localSettings)
    onOpenChange(false)
  }

  // Получение отсортированного списка виджетов
  const sortedWidgets = getSortedWidgets()

  return (
    <>
      <style jsx global>{`
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        button {
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
        }
        
        @keyframes popupScaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes popupScaleInMobile {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes popupScaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        [data-slot="dialog-content"][data-state="open"] {
          animation: popupScaleIn 0.5s cubic-bezier(0.34, 1.26, 0.64, 1) forwards !important;
          animation-fill-mode: both !important;
        }
        
        [data-slot="dialog-content"][data-state="closed"] {
          animation: popupScaleOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards !important;
          animation-fill-mode: both !important;
        }
        
        @media (max-width: 1023px) {
          [data-slot="dialog-content"][data-state="open"] {
            animation: popupScaleInMobile 0.5s cubic-bezier(0.34, 1.26, 0.64, 1) forwards !important;
            animation-fill-mode: both !important;
          }
          
          [data-slot="dialog-content"][data-state="closed"] {
            animation: popupScaleOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards !important;
            animation-fill-mode: both !important;
          }
          
          .absolute.rounded-full.blur-3xl {
            display: none !important;
          }
          
          .backdrop-blur-xl,
          .backdrop-blur {
            backdrop-filter: blur(4px) !important;
          }
          
          .shadow-2xl {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15) !important;
          }
          
          * {
            transition-duration: 0.2s !important;
          }
          
          @media (hover: none) {
            button:hover {
              transform: none !important;
            }
          }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl p-0 border-0 bg-transparent overflow-visible max-h-[90vh]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {isFirstTime ? 'Добро пожаловать в трекер здоровья!' : 'Настройки трекера'}
          </DialogTitle>
          
          {/* Card - Dashboard style glassmorphism */}
          <div className="relative w-full mx-auto mt-8 mb-8 p-6 sm:p-8 overflow-hidden rounded-3xl bg-[#1a1a24]/80 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-[3px] right-[3px] z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
              style={{ willChange: 'transform, opacity' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white/80">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              <span className="sr-only">Закрыть</span>
            </button>

            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur relative max-h-[calc(90vh-8rem)] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl leading-tight tracking-tight font-semibold text-white font-montserrat">
                  {isFirstTime ? 'Добро пожаловать в трекер здоровья!' : 'Настройки трекера'}
                </h1>
                <p className="mt-2 text-sm font-normal text-white/70 font-montserrat">
                  {isFirstTime ? 'Настройте виджеты для отслеживания' : 'Выберите виджеты и установите цели'}
                </p>
              </div>

              {/* Секция виджетов */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                  Виджеты
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                    {sortedWidgets.map((widgetId) => {
                      const config = WIDGET_CONFIGS[widgetId]
                      const widgetSettings = localSettings.widgets[widgetId]
                      const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP]

                      return (
                        <motion.div
                          key={widgetId}
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={cn(
                            "group relative flex items-center justify-between p-3 rounded-xl",
                            "border transition-all duration-200 cursor-pointer",
                            widgetSettings.enabled
                              ? "border-amber-500/20 bg-amber-500/5"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                          )}
                          onClick={() => handleToggleWidget(widgetId)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              widgetSettings.enabled
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-white/5 text-white/40"
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            <span className={cn(
                              "text-sm font-medium",
                              widgetSettings.enabled ? "text-white" : "text-white/60"
                            )}>
                              {config.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Кнопка "Добавить в план" */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleInPlan(widgetId, e)}
                              className={cn(
                                "p-1.5 rounded-lg transition-all",
                                widgetSettings.inDailyPlan
                                  ? "bg-amber-500/30 text-amber-400"
                                  : "bg-white/5 text-white/40 hover:bg-amber-500/20 hover:text-amber-400"
                              )}
                              title="Добавить в план на день"
                            >
                              <Target className="w-4 h-4" />
                            </button>

                            {/* Галочка активации */}
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                              "border-2",
                              widgetSettings.enabled
                                ? "bg-amber-500 border-amber-500"
                                : "border-white/20 bg-white/5"
                            )}>
                              {widgetSettings.enabled && <Check className="w-4 h-4 text-black stroke-[3px]" />}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Секция целей */}
              {sortedWidgets.some(id => localSettings.widgets[id].enabled && WIDGET_CONFIGS[id].hasGoal) && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                    Цели
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedWidgets
                      .filter(id => localSettings.widgets[id].enabled && WIDGET_CONFIGS[id].hasGoal)
                      .map((widgetId) => {
                        const config = WIDGET_CONFIGS[widgetId]
                        const widgetSettings = localSettings.widgets[widgetId]

                        return (
                          <div key={`goal-${widgetId}`} className="space-y-2">
                            <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
                              {config.name} ({config.goalUnit})
                            </label>
                            <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-amber-500/50 focus-within:ring-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder={config.goalPlaceholder}
                                value={widgetSettings.goal ?? ''}
                                onChange={(e) => handleGoalChange(widgetId, e.target.value)}
                                className="flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Разделитель */}
              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Параметры для расчёта ИМТ
                </span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              {/* Секция параметров пользователя */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
                    Рост (см)
                  </label>
                  <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-amber-500/50 focus-within:ring-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="170"
                      value={localSettings.userParams.height ?? ''}
                      onChange={(e) => handleParamChange('height', e.target.value)}
                      className="flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
                    Текущий вес (кг)
                  </label>
                  <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-amber-500/50 focus-within:ring-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="72"
                      value={localSettings.userParams.weight ?? ''}
                      onChange={(e) => handleParamChange('weight', e.target.value)}
                      className="flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
                    Возраст (лет)
                  </label>
                  <div className="flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3 text-sm text-white transition-all focus-within:ring-amber-500/50 focus-within:ring-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="28"
                      value={localSettings.userParams.age ?? ''}
                      onChange={(e) => handleParamChange('age', e.target.value)}
                      className="flex-1 bg-transparent text-base font-normal text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Кнопка сохранения */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 ring-1 ring-amber-400/50 px-4 py-2.5 transition-all hover:from-amber-500/30 hover:to-orange-600/30 hover:ring-amber-400/60 active:scale-95"
                  style={{ touchAction: 'manipulation', willChange: 'transform' }}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-white font-montserrat">
                        Сохранить настройки
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

