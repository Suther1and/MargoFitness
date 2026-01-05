'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils, Zap, Apple, ChevronLeft, Info, Camera, NotebookText, Image, Film, Frown, Meh, SmilePlus, BatteryMedium, Target, Calendar, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useTrackerSettings } from '../hooks/use-tracker-settings'
import { WidgetId, WIDGET_CONFIGS } from '../types'
import { HabitsSection } from './habits-section'
import { WeekNavigator } from './week-navigator'
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

interface SettingsTabProps {
  onBack?: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isCalendarExpanded: boolean;
  setIsCalendarExpanded: (expanded: boolean) => void;
  activeSubTab: 'widgets' | 'habits';
  setActiveSubTab: (tab: 'widgets' | 'habits') => void;
}

export default function SettingsTab({ 
  onBack,
  selectedDate,
  onDateChange,
  isCalendarExpanded,
  setIsCalendarExpanded,
  activeSubTab,
  setActiveSubTab
}: SettingsTabProps) {
  const { settings, saveSettings } = useTrackerSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isBmiInfoOpen, setIsBmiInfoOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Синхронизация с настройками
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  // Автосохранение при изменении локальных настроек
  useEffect(() => {
    saveSettings(localSettings)
  }, [localSettings, saveSettings])

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

  const widgetGroups = useMemo(() => [
    { name: 'Активность', icon: Zap, widgets: ['steps', 'sleep', 'mood'] },
    { name: 'Питание и баланс', icon: Apple, widgets: ['water', 'caffeine', 'nutrition'] },
    { name: 'Тело', icon: Scale, widgets: ['weight', 'photos', 'notes'] }
  ], [])

  return (
    <div className={cn(
      "w-full space-y-6 pb-24",
      isAnimating && "is-animating"
    )}>
      {/* BMI Panel - Hidden on Desktop (moved to header) */}
      <div className="flex items-stretch bg-white/[0.03] rounded-xl border border-white/10 md:backdrop-blur-md overflow-hidden shadow-2xl h-[60px] w-full md:w-auto md:min-w-[420px] lg:hidden">
          <div className="flex items-center p-0.5 border-r border-white/5 bg-white/[0.02] flex-[3] md:flex-1">
            <div className="flex flex-col px-2 md:px-4 py-1 border-r border-white/5 flex-1 md:flex-none md:w-[100px] min-w-0">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Рост</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="---"
                  value={localSettings.userParams.height ?? ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  className="w-full bg-transparent text-[22px] md:text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none min-w-0"
                />
                <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">см</span>
              </div>
            </div>
            <div className="flex flex-col px-2 md:px-4 py-1 border-r border-white/5 flex-1 md:flex-none md:w-[100px] min-w-0">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Вес</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="---"
                  value={localSettings.userParams.weight ?? ''}
                  onChange={(e) => handleParamChange('weight', e.target.value)}
                  className="w-full bg-transparent text-[22px] md:text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none min-w-0"
                />
                <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">кг</span>
              </div>
            </div>
            <div className="flex flex-col px-2 md:px-4 py-1 flex-1 md:flex-none md:w-[100px] min-w-0">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Возраст</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="--"
                  value={localSettings.userParams.age ?? ''}
                  onChange={(e) => handleParamChange('age', e.target.value)}
                  className="w-full bg-transparent text-[22px] md:text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none min-w-0"
                />
                <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">лет</span>
              </div>
            </div>
          </div>

          <div className={cn(
            "px-3 md:px-4 py-1.5 flex flex-col transition-all duration-500 flex-[1.2] md:flex-none md:w-[115px] min-w-0 relative",
            bmiValue ? "bg-white/[0.05]" : "bg-transparent"
          )}>
            {bmiValue ? (
              <>
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Твой ИМТ</span>
                <div className="flex items-center mt-auto pb-0.5 overflow-hidden">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[26px] md:text-[34px] font-oswald font-black text-white leading-none tracking-tighter shrink-0">
                      {bmiValue}
                    </span>
                    <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse mt-1 shrink-0", 
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
                      <button className="p-1.5 md:p-2 text-white/40 hover:text-white transition-all focus:outline-none">
                        <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900/95 border-white/10 text-white rounded-2xl max-w-sm md:backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="font-oswald font-black text-2xl uppercase tracking-tight">Что такое ИМТ?</DialogTitle>
                        <DialogDescription className="text-white/60 text-sm pt-2 font-medium">
                          Индекс массы тела (ИМТ) — оценка соответствия массы человека его росту.
                          <br /><br />
                          Формула: вес (кг) / рост² (м).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Результат</span>
                          <span className={cn("text-2xl font-oswald font-black", bmiCategory?.color)}>{bmiValue}</span>
                        </div>
                        <div className={cn("text-xs font-bold uppercase tracking-wider", bmiCategory?.color)}>
                          {bmiCategory?.label}
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed font-medium">
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

      {/* Sub-Tabs with BMI Panel on Desktop */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/10 shadow-lg md:backdrop-blur-md h-[54px] w-full lg:w-fit relative overflow-hidden">
          <div className="flex h-full gap-1 w-full lg:w-auto relative">
            <button
              onClick={() => setActiveSubTab('widgets')}
              className={cn(
                "flex-1 lg:flex-none px-4 md:px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative h-full flex items-center justify-center z-10",
                activeSubTab === 'widgets' ? "text-[#09090b] transition-colors duration-500" : "text-white/30 hover:text-white/60"
              )}
            >
              {activeSubTab === 'widgets' && (
                <motion.div 
                  layoutId="activeSubTab" 
                  className="absolute inset-0 bg-green-500 rounded-xl -z-10" 
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} 
                />
              )}
              <span className="relative z-10">Виджеты</span>
            </button>
            <button
              onClick={() => setActiveSubTab('habits')}
              className={cn(
                "flex-1 lg:flex-none px-4 md:px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative h-full flex items-center justify-center z-10",
                activeSubTab === 'habits' ? "text-[#09090b] transition-colors duration-500" : "text-white/30 hover:text-white/60"
              )}
            >
              {activeSubTab === 'habits' && (
                <motion.div 
                  layoutId="activeSubTab" 
                  className="absolute inset-0 bg-amber-500 rounded-xl -z-10" 
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} 
                />
              )}
              <span className="relative z-10">Привычки</span>
            </button>
          </div>
        </div>

        {/* BMI Panel on Desktop only */}
        <div className="hidden lg:flex items-stretch bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl h-[54px] min-w-[420px]">
          <div className="flex items-center p-0.5 border-r border-white/5 bg-white/[0.02] flex-1">
            <div className="flex flex-col px-4 py-0.5 border-r border-white/5 w-[100px] justify-center">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Рост</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="---"
                  value={localSettings.userParams.height ?? ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  className="w-full bg-transparent text-[24px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                />
                <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">см</span>
              </div>
            </div>
            <div className="flex flex-col px-4 py-0.5 border-r border-white/5 w-[100px] justify-center">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Вес</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="---"
                  value={localSettings.userParams.weight ?? ''}
                  onChange={(e) => handleParamChange('weight', e.target.value)}
                  className="w-full bg-transparent text-[24px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                />
                <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">кг</span>
              </div>
            </div>
            <div className="flex flex-col px-4 py-0.5 w-[100px] justify-center">
              <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Возраст</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="--"
                  value={localSettings.userParams.age ?? ''}
                  onChange={(e) => handleParamChange('age', e.target.value)}
                  className="w-full bg-transparent text-[24px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                />
                <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">лет</span>
              </div>
            </div>
          </div>

          <div className={cn(
            "px-4 py-1 flex flex-col transition-all duration-500 w-[115px] relative",
            bmiValue ? "bg-white/[0.05]" : "bg-transparent"
          )}>
            {bmiValue ? (
              <>
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Твой ИМТ</span>
                <div className="flex items-center mt-auto pb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[30px] font-oswald font-black text-white leading-none tracking-tighter">
                      {bmiValue}
                    </span>
                    <div className={cn("w-2 h-2 rounded-full animate-pulse mt-1", 
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
                      <button className="p-1.5 text-white/40 hover:text-white transition-all focus:outline-none">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900/95 border-white/10 text-white rounded-2xl max-w-sm backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="font-oswald font-black text-2xl uppercase tracking-tight">Что такое ИМТ?</DialogTitle>
                        <DialogDescription className="text-white/60 text-sm pt-2 font-medium">
                          Индекс массы тела (ИМТ) — оценка соответствия массы человека его росту.
                          <br /><br />
                          Формула: вес (кг) / рост² (м).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Результат</span>
                          <span className={cn("text-2xl font-oswald font-black", bmiCategory?.color)}>{bmiValue}</span>
                        </div>
                        <div className={cn("text-xs font-bold uppercase tracking-wider", bmiCategory?.color)}>
                          {bmiCategory?.label}
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed font-medium">
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

      {/* Content Container with stable height to prevent scroll jumping */}
      <div className="relative min-h-[75vh]">
        <AnimatePresence mode="wait">
          {activeSubTab === 'widgets' ? (
            <motion.div
              key="widgets"
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-10 settings-content-container w-full"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {group.widgets.map(widgetId => {
                      const id = widgetId as WidgetId
                      const config = WIDGET_CONFIGS[id]
                      const widget = localSettings.widgets[id]
                      const Icon = ICON_MAP[id]
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggle(id)}
                          className={cn(
                            "group relative overflow-hidden rounded-[2.5rem] border transition-colors duration-300 cursor-pointer",
                            widget.enabled ? "border-green-500/30 bg-zinc-900/80" : "border-white/5 bg-white/[0.01] hover:border-green-500/30"
                          )}
                        >
                          <div className={cn("relative z-10 p-5 md:px-6 md:py-5 flex flex-col h-full min-h-[145px] md:min-h-[120px] transition-opacity duration-500", !widget.enabled && "opacity-60 group-hover:opacity-100")}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border shrink-0", widget.enabled ? "bg-green-500/20 border-green-500/20 text-green-400" : "bg-white/5 border-white/5 text-white/20")}>
                                  <Icon className="w-5 h-5" strokeWidth={2.25} />
                                </div>
                                <div className="flex flex-col">
                                  <h3 className={cn("font-oswald font-black text-lg md:text-xl uppercase leading-none mb-1", widget.enabled ? "text-white" : "text-white/40")}>{config.name}</h3>
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{config.description}</p>
                                </div>
                              </div>
                              <div className={cn("w-1.5 h-1.5 rounded-full", widget.enabled ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-white/10")} />
                            </div>
                            {config.hasGoal && (
                              <div className="mt-auto flex items-end gap-2.5">
                                <div className="relative flex-1" onClick={(e) => widget.enabled && e.stopPropagation()}>
                                  {widget.enabled ? (
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={widget.goal ?? ''}
                                      onChange={(e) => handleGoalChange(id, e.target.value)}
                                      placeholder="Цель"
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-base font-oswald font-black text-white focus:outline-none focus:border-green-500/50 h-[42px]"
                                    />
                                  ) : (
                                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl h-[42px] flex items-center px-3.5 opacity-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleToggle(id); }}>
                                      <div className="w-10 h-3 bg-white/10 rounded animate-pulse" />
                                    </div>
                                  )}
                                  {widget.enabled && <span className="absolute right-3.5 bottom-[11px] text-[8px] font-black text-white/20 uppercase tracking-widest">{config.goalUnit}</span>}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (!widget.enabled) handleToggle(id); else handleToggleInPlan(id); }}
                                  className={cn("w-[42px] h-[42px] rounded-xl flex items-center justify-center border shrink-0 transition-all", widget.enabled ? widget.inDailyPlan ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/10" : "bg-white/[0.03] border-white/5 text-white/5")}
                                >
                                  <Target className="w-4.5 h-4.5" strokeWidth={2.25} />
                                </button>
                              </div>
                            )}
                            {!config.hasGoal && (
                              <div className="mt-auto pt-2">
                                {id === 'mood' && (
                                  <div className={cn("flex gap-1.5", widget.enabled ? "opacity-60" : "opacity-10")}>
                                    {[Frown, Meh, Smile, SmilePlus, BatteryMedium].map((MoodIcon, i) => (
                                      <div key={i} className={cn("w-8 h-8 rounded-lg flex items-center justify-center", i === 2 && widget.enabled ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30" : "bg-white/5 text-white/20")}>
                                        <MoodIcon className={cn(i === 2 ? "w-5 h-5" : "w-4 h-4")} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {id === 'photos' && (
                                  <div className={cn("flex items-center gap-3", widget.enabled ? "opacity-60" : "opacity-10")}>
                                    <div className="flex -space-x-3">
                                      {[Image, Camera, Film].map((PhIcon, i) => (
                                        <div key={i} className={cn("w-10 h-10 rounded-xl bg-zinc-800 border-2 border-[#121214] flex items-center justify-center", i === 1 ? "z-10" : "scale-90")}>
                                          <PhIcon className="w-4 h-4 text-white/30" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {id === 'notes' && (
                                  <div className={cn("space-y-1.5", widget.enabled ? "opacity-20" : "opacity-5")}>
                                    <div className="h-1.5 bg-white rounded-full w-full" />
                                    <div className="h-1.5 bg-white rounded-full w-[80%]" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
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
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <HabitsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

