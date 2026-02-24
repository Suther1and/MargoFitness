'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Droplets, Footprints, Scale, Coffee, Moon, Smile, Utensils, Zap, Apple, ChevronLeft, Info, Camera, NotebookText, Image, Film, Frown, Meh, SmilePlus, BatteryMedium, Target, Calendar, ChevronDown, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useTrackerSettings } from '../hooks/use-tracker-settings'
import { WidgetId, WIDGET_CONFIGS, TrackerSettings } from '../types'
import { HabitsSection } from './habits-section'
import { getEffectiveTier, getWidgetLimit, getHabitLimit, getUpgradeChips } from '@/lib/access-control'
import { WIDGET_LIMITS } from '@/lib/constants/subscriptions'
import { useHabits } from '../hooks/use-habits'
import type { Profile } from '@/types/database'
import { Lock } from 'lucide-react'
import { WeekNavigator } from './week-navigator'
import { calculateBMI, getBMICategory, calculateCalorieNorms } from '../utils/bmi-utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

// Добавляем стили для анимации shake
const shakeKeyframes = `
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
  .animate-shake {
    animation: shake 0.5s;
  }
`

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

export function BmiInfoDialog({ 
  bmiValue, 
  bmiCategory, 
  userParams, 
  settings, 
  onUpdateSettings,
  isOpen,
  onOpenChange
}: { 
  bmiValue: string | null, 
  bmiCategory: any, 
  userParams: any,
  settings: any,
  onUpdateSettings: (settings: any) => void,
  isOpen?: boolean,
  onOpenChange?: (open: boolean) => void
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activityLevel, setActivityLevel] = useState(settings?.userParams?.activityLevel || 1.55);
  const [selectedGoalType, setSelectedGoalType] = useState<'loss' | 'maintain' | 'gain'>(
    settings?.widgets?.nutrition?.nutritionGoalType || 'maintain'
  );

  // Используем внешнее или внутреннее состояние
  const dialogOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setDialogOpen = onOpenChange || setInternalIsOpen;

  const calorieNorms = useMemo(() => 
    calculateCalorieNorms(userParams.weight, userParams.height, userParams.age, activityLevel),
    [userParams, activityLevel]
  );

  const activityOptions = [
    { label: 'Низкая', value: 1.375, desc: 'Легкие прогулки или 1 тренировка в неделю' },
    { label: 'Средняя', value: 1.55, desc: 'Тренировки 2-3 раза в неделю' },
    { label: 'Высокая', value: 1.725, desc: 'Более 3 интенсивных тренировок в неделю' }
  ];

  // Обработчик выбора цели
  const handleGoalSelect = (goalType: 'loss' | 'maintain' | 'gain') => {
    if (!calorieNorms || !settings) return;
    
    setSelectedGoalType(goalType);
    
    // Получаем значение калорий для выбранной цели
    const goalValue = goalType === 'loss' ? calorieNorms.loss : 
                      goalType === 'maintain' ? calorieNorms.maintain : 
                      calorieNorms.gain;
    
    // Обновляем настройки
    const newSettings = {
      ...settings,
      userParams: {
        ...settings.userParams,
        activityLevel
      },
      widgets: {
        ...settings.widgets,
        nutrition: {
          ...settings.widgets.nutrition,
          goal: goalValue,
          nutritionGoalType: goalType
        }
      }
    };
    
    onUpdateSettings(newSettings);
  };

  // Обработчик изменения уровня активности
  const handleActivityChange = (newActivityLevel: number) => {
    setActivityLevel(newActivityLevel);
    
    if (!settings) return;
    
    // Обновляем настройки с новым уровнем активности
    const newSettings = {
      ...settings,
      userParams: {
        ...settings.userParams,
        activityLevel: newActivityLevel
      }
    };
    
    onUpdateSettings(newSettings);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <button className="p-1.5 md:p-2 text-white/40 hover:text-white transition-all focus:outline-none">
            <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-[#121214] border-white/10 text-white rounded-[2rem] max-w-sm overflow-hidden p-0 gap-0">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="font-oswald font-black text-2xl uppercase tracking-tight">Твой результат</DialogTitle>
          </DialogHeader>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Индекс массы тела</span>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-oswald font-black leading-none">{bmiValue}</span>
                <div className={cn("px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider", bmiCategory?.color, "bg-white/5")}>
                  {bmiCategory?.label}
                </div>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-white/40 leading-relaxed font-medium">
            {bmiCategory?.description}
          </p>
        </div>

        <div className="bg-white/[0.02] border-t border-white/5 p-6 pt-5 space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Уровень активности</span>
              <div className="flex bg-black/40 rounded-xl p-1 gap-1 border border-white/5 relative">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleActivityChange(opt.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors relative",
                      activityLevel === opt.value 
                        ? opt.value === 1.375 ? "text-blue-400" : opt.value === 1.55 ? "text-amber-400" : "text-red-400"
                        : "text-white/20 hover:text-white/40"
                    )}
                  >
                    {activityLevel === opt.value && (
                      <motion.div
                        layoutId="activity-bg"
                        className={cn(
                          "absolute inset-0 rounded-md border border-white/10 shadow-lg",
                          opt.value === 1.375 
                            ? "bg-blue-500/10 border-blue-500/20" 
                            : opt.value === 1.55 
                              ? "bg-amber-500/10 border-amber-500/20" 
                              : "bg-red-500/10 border-red-500/20"
                        )}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-white/30 font-medium italic px-1">
                — {activityOptions.find(o => o.value === activityLevel)?.desc}
              </p>
            </div>

            {!calorieNorms ? (
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Укажи возраст для расчета</p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleGoalSelect('loss')}
                  className={cn(
                    "flex flex-col items-center flex-1 rounded-2xl p-3.5 border transition-all cursor-pointer hover:scale-105 relative",
                    selectedGoalType === 'loss' 
                      ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg scale-[1.02]" 
                      : "bg-white/[0.03] border-white/5 hover:border-emerald-500/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-2 right-2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                    selectedGoalType === 'loss' 
                      ? "bg-emerald-500 border-emerald-500 text-black scale-110 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                      : "bg-white/5 border-white/10 text-transparent"
                  )}>
                    <Check className="w-2.5 h-2.5" strokeWidth={4} />
                  </div>
                  <span className={cn(
                    "text-[7px] font-black uppercase tracking-widest mb-0.5 transition-colors",
                    selectedGoalType === 'loss' ? "text-emerald-400" : "text-emerald-400/40"
                  )}>
                    Похудение
                  </span>
                  <div className="flex items-baseline gap-0.5 overflow-hidden">
                    <motion.span
                      key={calorieNorms.loss}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className={cn(
                        "text-xl font-oswald font-black transition-colors",
                        selectedGoalType === 'loss' ? "text-emerald-400" : "text-emerald-400/60"
                      )}
                    >
                      {calorieNorms.loss}
                    </motion.span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase transition-colors",
                      selectedGoalType === 'loss' ? "text-emerald-400/40" : "text-emerald-400/20"
                    )}>
                      ккал
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleGoalSelect('maintain')}
                  className={cn(
                    "flex flex-col items-center flex-1 rounded-2xl p-3.5 border transition-all cursor-pointer hover:scale-105 relative",
                    selectedGoalType === 'maintain' 
                      ? "bg-violet-500/10 border-violet-500/30 shadow-lg scale-[1.02]" 
                      : "bg-white/[0.03] border-white/5 hover:border-violet-500/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-2 right-2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                    selectedGoalType === 'maintain' 
                      ? "bg-violet-500 border-violet-500 text-black scale-110 shadow-[0_0_8px_rgba(139,92,246,0.4)]" 
                      : "bg-white/5 border-white/10 text-transparent"
                  )}>
                    <Check className="w-2.5 h-2.5" strokeWidth={4} />
                  </div>
                  <span className={cn(
                    "text-[7px] font-black uppercase tracking-widest mb-0.5 transition-colors",
                    selectedGoalType === 'maintain' ? "text-violet-400" : "text-violet-400/40"
                  )}>
                    Баланс
                  </span>
                  <div className="flex items-baseline gap-0.5 overflow-hidden">
                    <motion.span
                      key={calorieNorms.maintain}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className={cn(
                        "text-xl font-oswald font-black transition-colors",
                        selectedGoalType === 'maintain' ? "text-violet-400" : "text-violet-400/60"
                      )}
                    >
                      {calorieNorms.maintain}
                    </motion.span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase transition-colors",
                      selectedGoalType === 'maintain' ? "text-violet-400/40" : "text-violet-400/20"
                    )}>
                      ккал
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleGoalSelect('gain')}
                  className={cn(
                    "flex flex-col items-center flex-1 rounded-2xl p-3.5 border transition-all cursor-pointer hover:scale-105 relative",
                    selectedGoalType === 'gain' 
                      ? "bg-orange-500/10 border-orange-500/30 shadow-lg scale-[1.02]" 
                      : "bg-white/[0.03] border-white/5 hover:border-orange-500/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-2 right-2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                    selectedGoalType === 'gain' 
                      ? "bg-orange-500 border-orange-500 text-black scale-110 shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                      : "bg-white/5 border-white/10 text-transparent"
                  )}>
                    <Check className="w-2.5 h-2.5" strokeWidth={4} />
                  </div>
                  <span className={cn(
                    "text-[7px] font-black uppercase tracking-widest mb-0.5 transition-colors",
                    selectedGoalType === 'gain' ? "text-orange-400" : "text-orange-400/40"
                  )}>
                    Набор
                  </span>
                  <div className="flex items-baseline gap-0.5 overflow-hidden">
                    <motion.span
                      key={calorieNorms.gain}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className={cn(
                        "text-xl font-oswald font-black transition-colors",
                        selectedGoalType === 'gain' ? "text-orange-400" : "text-orange-400/60"
                      )}
                    >
                      {calorieNorms.gain}
                    </motion.span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase transition-colors",
                      selectedGoalType === 'gain' ? "text-orange-400/40" : "text-orange-400/20"
                    )}>
                      ккал
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
          
          <p className="text-[10px] text-white/20 italic text-center pt-3 border-t border-white/5 px-2">
            *Индивидуальный расчет по формуле Миффлина-Сан Жеора
            <span className="hidden sm:inline"> (BMR + коэффициент PAL)</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SettingsTabProps {
  userId: string | null;
  profile?: Profile | null;
  onBack?: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isCalendarExpanded: boolean;
  setIsCalendarExpanded: (expanded: boolean) => void;
  activeSubTab: 'widgets' | 'habits';
  setActiveSubTab: (tab: 'widgets' | 'habits') => void;
  isMobile?: boolean;
}

export default function SettingsTab({ 
  userId,
  profile,
  onBack,
  selectedDate,
  onDateChange,
  isCalendarExpanded,
  setIsCalendarExpanded,
  activeSubTab,
  setActiveSubTab,
  isMobile
}: SettingsTabProps) {
  const { settings, saveSettings, isLoaded } = useTrackerSettings(userId)
  const queryClient = useQueryClient()
  const [shakingWidget, setShakingWidget] = useState<WidgetId | null>(null)
  
  const effectiveTier = getEffectiveTier(profile ?? null)
  const widgetLimit = getWidgetLimit(effectiveTier)
  const habitLimit = getHabitLimit(effectiveTier)
  const { habits } = useHabits(userId)
  const activeHabitsCount = useMemo(
    () => habits.filter(h => h.enabled).length,
    [habits]
  )
  const [openBmiDialog, setOpenBmiDialog] = useState(false)
  
  // Отслеживаем предыдущие значения целей для восстановления inDailyPlan
  const previousGoalsRef = useRef<Record<WidgetId, { goal: number | null, inPlan: boolean }>>({} as any)

  // ВАЖНО: все хуки должны вызываться до любых условных return
  const widgetGroups = useMemo(() => [
    { name: 'Активность', icon: Zap, widgets: ['steps', 'sleep', 'mood', 'photos'] },
    { name: 'Питание и тело', icon: Apple, widgets: ['water', 'caffeine', 'nutrition', 'weight'] }
  ], [])

  // Используем settings напрямую из React Query - нет дублирования состояния
  const localSettings = settings

  const enabledWidgetCount = useMemo(
    () => Object.values(localSettings.widgets).filter(w => w.enabled).length,
    [localSettings.widgets]
  )

  const bmiValue = calculateBMI(localSettings.userParams.height, localSettings.userParams.weight)
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null
  const calorieNorms = calculateCalorieNorms(
    localSettings.userParams.weight,
    localSettings.userParams.height,
    localSettings.userParams.age
  )

  // Показываем загрузку пока настройки не загружены (после всех хуков)
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  const handleToggle = (widgetId: WidgetId) => {
    if (!isLoaded) return
    const freshSettings = queryClient.getQueryData<TrackerSettings>(['diary-settings', userId])
    if (!freshSettings) return

    const isCurrentlyEnabled = freshSettings.widgets[widgetId].enabled
    // Если пытаемся включить — проверяем лимит
    if (!isCurrentlyEnabled) {
      const enabledCount = Object.values(freshSettings.widgets).filter(w => w.enabled).length
      if (enabledCount >= widgetLimit) {
        window.dispatchEvent(new CustomEvent('open-upgrade-modal'))
        return
      }
    }

    const newSettings = {
      ...freshSettings,
      widgets: {
        ...freshSettings.widgets,
        [widgetId]: {
          ...freshSettings.widgets[widgetId],
          enabled: !isCurrentlyEnabled,
        }
      }
    }
    saveSettings(newSettings)
  }

  const handleGoalChange = (widgetId: WidgetId, value: string) => {
    if (!isLoaded) return
    // КРИТИЧНО: берем свежие данные из кэша React Query
    const freshSettings = queryClient.getQueryData<TrackerSettings>(['diary-settings', userId])
    if (!freshSettings) return
    
    const filtered = value.replace(/[^\d.]/g, '')
    const widget = freshSettings.widgets[widgetId]
    const newGoalValue = filtered ? parseFloat(filtered) : null
    const hadGoal = widget.goal !== null
    const willHaveGoal = newGoalValue !== null && newGoalValue > 0
    
    // Логика inDailyPlan:
    // 1. Если удаляем цель - сохраняем текущее состояние inDailyPlan и убираем из плана
    // 2. Если добавляем цель - восстанавливаем сохраненное состояние inDailyPlan
    let newInDailyPlan = widget.inDailyPlan
    
    if (!willHaveGoal && hadGoal) {
      // Удаление цели - сохраняем текущее состояние inDailyPlan перед удалением
      previousGoalsRef.current[widgetId] = {
        goal: widget.goal,
        inPlan: widget.inDailyPlan  // Сохраняем текущее состояние (включено или выключено)
      }
      newInDailyPlan = false  // Убираем из плана при удалении цели
    } else if (willHaveGoal && !hadGoal) {
      // Добавление новой цели - восстанавливаем сохраненное состояние
      const prev = previousGoalsRef.current[widgetId]
      if (prev !== undefined) {
        newInDailyPlan = prev.inPlan  // Восстанавливаем то состояние, которое было ДО удаления
      } else {
        newInDailyPlan = false  // Если не было сохраненного состояния - по умолчанию выключено
      }
    }
    
    const newSettings = {
      ...freshSettings,
      widgets: {
        ...freshSettings.widgets,
        [widgetId]: {
          ...freshSettings.widgets[widgetId],
          goal: newGoalValue,
          inDailyPlan: newInDailyPlan
        }
      }
    }
    saveSettings(newSettings)
  }

  const handleToggleInPlan = (widgetId: WidgetId) => {
    if (!isLoaded) return
    // КРИТИЧНО: берем свежие данные из кэша React Query
    const freshSettings = queryClient.getQueryData<TrackerSettings>(['diary-settings', userId])
    if (!freshSettings) return
    
    const widget = freshSettings.widgets[widgetId]
    const config = WIDGET_CONFIGS[widgetId]
    
    // Проверяем, что если у виджета должна быть цель и мы хотим добавить в план, то цель должна быть указана
    if (!widget.inDailyPlan && config.hasGoal && !widget.goal) {
      // Показываем эффект встряхивания
      setShakingWidget(widgetId)
      setTimeout(() => setShakingWidget(null), 500)
      
      // Фокусируемся на поле ввода цели
      setTimeout(() => {
        const input = document.querySelector(`input[data-widget-id="${widgetId}"]`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      }, 100)
      
      return
    }
    
    const newSettings = {
      ...freshSettings,
      widgets: {
        ...freshSettings.widgets,
        [widgetId]: {
          ...freshSettings.widgets[widgetId],
          inDailyPlan: !freshSettings.widgets[widgetId].inDailyPlan,
        }
      }
    }
    saveSettings(newSettings)
  }

  const handleParamChange = (param: 'height' | 'weight' | 'age' | 'gender', value: any) => {
    if (!isLoaded) return
    // КРИТИЧНО: берем свежие данные из кэша React Query
    const freshSettings = queryClient.getQueryData<TrackerSettings>(['diary-settings', userId])
    if (!freshSettings) return
    
    let finalValue = value;
    if (param !== 'gender') {
      finalValue = value.replace(/[^\d.]/g, '').slice(0, 3)
      finalValue = finalValue ? parseFloat(finalValue) : null
    }
    
    const newSettings = {
      ...freshSettings,
      userParams: {
        ...freshSettings.userParams,
        [param]: finalValue,
      }
    }
    saveSettings(newSettings)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shakeKeyframes }} />
      <div className="w-full space-y-6 pb-24">
      {/* BMI Panel - Hidden on Desktop (moved to header) */}
      <div className="flex flex-col bg-white/[0.03] rounded-2xl border border-white/10 md:backdrop-blur-md overflow-hidden shadow-2xl w-full lg:hidden">
        <div className="flex items-stretch min-h-[60px] border-b border-white/5">
          <div className="flex items-center p-0.5 bg-white/[0.02] flex-1">
            <div className="flex flex-col px-3 py-1 border-r border-white/5 flex-1 min-w-0">
              <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Рост</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="---"
                  value={localSettings.userParams.height ?? ''}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                  className="w-full bg-transparent text-[22px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none min-w-0"
                />
                <span className="text-[8px] font-bold text-white/10 uppercase shrink-0">см</span>
              </div>
            </div>
            <div className="flex flex-col px-3 py-1 border-r border-white/5 flex-1 min-w-0">
              <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Вес</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="---"
                  value={localSettings.userParams.weight ?? ''}
                  onChange={(e) => handleParamChange('weight', e.target.value)}
                  className="w-full bg-transparent text-[22px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none min-w-0"
                />
                <span className="text-[8px] font-bold text-white/10 uppercase shrink-0">кг</span>
              </div>
            </div>
            <div className="flex flex-col px-3 py-1 flex-1 min-w-0">
              <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Возраст</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="--"
                  value={localSettings.userParams.age ?? ''}
                  onChange={(e) => handleParamChange('age', e.target.value)}
                  className="w-full bg-transparent text-[22px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none min-w-0"
                />
                <span className="text-[8px] font-bold text-white/10 uppercase shrink-0">лет</span>
              </div>
            </div>
          </div>

          <div className={cn(
            "px-4 py-1.5 flex flex-col transition-all duration-500 w-[100px] relative",
            bmiValue ? "bg-white/[0.05]" : "bg-transparent"
          )}>
            {bmiValue ? (
              <>
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">ИМТ</span>
                <div className="flex items-center mt-auto pb-0.5">
                  <span className="text-[28px] font-oswald font-black text-white leading-none tracking-tighter shrink-0">
                    {bmiValue}
                  </span>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse ml-1.5 mt-1", bmiCategory?.bgColor)} />
                </div>
                <div className="absolute right-0 top-0">
                  <BmiInfoDialog 
                    bmiValue={bmiValue} 
                    bmiCategory={bmiCategory} 
                    userParams={localSettings.userParams}
                    settings={localSettings}
                    onUpdateSettings={saveSettings}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-tight text-center">Данные</span>
              </div>
            )}
          </div>
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
                  layoutId={isMobile ? "activeSubTab-mobile" : "activeSubTab"} 
                  className="absolute inset-0 bg-green-500 rounded-xl -z-10" 
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} 
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                Виджеты
                <span className={cn(
                  "text-[8px] font-black tabular-nums px-1.5 py-0.5 rounded-md",
                  activeSubTab === 'widgets'
                    ? "bg-black/20 text-[#09090b]"
                    : enabledWidgetCount >= widgetLimit
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/10 text-white/40"
                )}>
                  {enabledWidgetCount}/{widgetLimit}
                </span>
              </span>
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
                  layoutId={isMobile ? "activeSubTab-mobile" : "activeSubTab"} 
                  className="absolute inset-0 bg-amber-500 rounded-xl -z-10" 
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} 
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                Привычки
                <span className={cn(
                  "text-[8px] font-black tabular-nums px-1.5 py-0.5 rounded-md",
                  activeSubTab === 'habits'
                    ? "bg-black/20 text-[#09090b]"
                    : activeHabitsCount >= habitLimit
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/10 text-white/40"
                )}>
                  {activeHabitsCount}/{habitLimit}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* BMI Panel on Desktop only */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="hidden lg:flex flex-col bg-white/[0.03] rounded-2xl border border-white/10 md:backdrop-blur-md overflow-hidden shadow-2xl min-w-[320px] xl:min-w-[420px]"
        >
          <div className="flex items-stretch h-[54px]">
            <div className="flex items-center p-0.5 bg-white/[0.02] flex-1">
              <div className="flex flex-col px-4 py-1 border-r border-white/5 w-[100px] justify-end">
                <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Рост</label>
                <div className="flex items-baseline gap-0.5 pb-0.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="---"
                    value={localSettings.userParams.height ?? ''}
                    onChange={(e) => handleParamChange('height', e.target.value)}
                    className="w-full bg-transparent text-[24px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none h-[24px]"
                    style={{ lineHeight: '24px' }}
                  />
                  <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">см</span>
                </div>
              </div>
              <div className="flex flex-col px-4 py-1 border-r border-white/5 w-[100px] justify-end">
                <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Вес</label>
                <div className="flex items-baseline gap-0.5 pb-0.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="---"
                    value={localSettings.userParams.weight ?? ''}
                    onChange={(e) => handleParamChange('weight', e.target.value)}
                    className="w-full bg-transparent text-[24px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none h-[24px]"
                    style={{ lineHeight: '24px' }}
                  />
                  <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">кг</span>
                </div>
              </div>
              <div className="flex flex-col px-4 py-1 w-[100px] justify-end">
                <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Возраст</label>
                <div className="flex items-baseline gap-0.5 pb-0.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="--"
                    value={localSettings.userParams.age ?? ''}
                    onChange={(e) => handleParamChange('age', e.target.value)}
                    className="w-full bg-transparent text-[24px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none h-[24px]"
                    style={{ lineHeight: '24px' }}
                  />
                  <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">лет</span>
                </div>
              </div>
            </div>

            <div className={cn(
              "px-4 py-1 flex flex-col transition-all duration-500 w-[100px] relative justify-end",
              bmiValue ? "bg-white/[0.05]" : "bg-transparent"
            )}>
              {bmiValue ? (
                <>
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">ИМТ</span>
                  <div className="flex items-center pb-0.5">
                    <span className="text-[30px] font-oswald font-black text-white leading-none tracking-tighter h-[30px]" style={{ lineHeight: '30px' }}>
                      {bmiValue}
                    </span>
                    <div className={cn("w-2 h-2 rounded-full animate-pulse ml-2 mt-1", bmiCategory?.bgColor)} />
                  </div>
                  <div className="absolute right-0 top-0">
                  <BmiInfoDialog 
                    bmiValue={bmiValue} 
                    bmiCategory={bmiCategory} 
                    userParams={localSettings.userParams}
                    settings={localSettings}
                    onUpdateSettings={saveSettings}
                  />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-tight text-center">Заполни данные</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Container with stable height to prevent scroll jumping */}
      <div className="relative min-h-[75vh]">
        <AnimatePresence mode="wait">
          {activeSubTab === 'widgets' ? (
            <motion.div
              key="widgets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="settings-content-container w-full"
            >
            {/* Единая сетка с заголовками категорий внутри */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {widgetGroups.map((group, groupIndex) => {
                const GroupIcon = group.icon
                return (
                  <React.Fragment key={group.name}>
                    {/* Заголовок категории - растягивается на всю ширину */}
                    <div className="lg:col-span-4 flex items-center gap-3 mb-2 mt-4 first:mt-0">
                      <GroupIcon className="w-4 h-4 text-green-500/50" strokeWidth={2.5} />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">{group.name}</h2>
                      <div className="h-px bg-white/5 w-full" />
                    </div>
                    
                    {/* Карточки виджетов */}
                    {group.widgets.map(widgetId => {
                      const id = widgetId as WidgetId
                      const config = WIDGET_CONFIGS[id]
                      const widget = localSettings.widgets[id]
                      const Icon = ICON_MAP[id]
                      // Виджет заблокирован, если: не включён И лимит исчерпан
                      const isLocked = !widget.enabled && enabledWidgetCount >= widgetLimit
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggle(id)}
                          className={cn(
                            "group relative overflow-hidden rounded-[2.5rem] border transition-colors duration-300 cursor-pointer",
                            isLocked
                              ? "border-white/5 bg-white/[0.01]"
                              : widget.enabled
                                ? "border-green-500/30 bg-zinc-900/80"
                                : "border-white/5 bg-white/[0.01] hover:border-green-500/30"
                          )}
                        >
                          {/* Locked overlay */}
                          {isLocked && (() => {
                            const chips = getUpgradeChips(effectiveTier, WIDGET_LIMITS)
                            const chipColors: Record<string, string> = {
                              basic: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                              pro: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                              elite: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                            }
                            const tierNames: Record<string, string> = { basic: 'Basic', pro: 'Pro', elite: 'Elite' }
                            return (
                              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[2.5rem] bg-black/60 backdrop-blur-[2px] cursor-pointer group/locked">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-amber-500/20 group-hover/locked:bg-amber-500/10 transition-colors">
                                  <Lock className="w-4 h-4 text-amber-400/60 group-hover/locked:text-amber-400 transition-colors" strokeWidth={2} />
                                </div>
                                {chips.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap justify-center px-3">
                                    {chips.map(({ tier, delta }) => (
                                      <span key={tier} className={cn("text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border", chipColors[tier])}>
                                        +{delta} {tierNames[tier]}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <p className="text-[8px] font-black uppercase tracking-wider text-amber-500/40 group-hover/locked:text-amber-400/60 transition-colors">Нажмите →</p>
                              </div>
                            )
                          })()}
                          <div className={cn("relative z-10 p-4 md:px-5 md:py-4 flex flex-col h-full min-h-[130px] md:min-h-[105px] transition-opacity duration-500", (!widget.enabled && !isLocked) && "opacity-60 group-hover:opacity-100", isLocked && "opacity-30")}>
                            <div className="flex items-start justify-between mb-3 relative">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border shrink-0", widget.enabled ? "bg-green-500/20 border-green-500/20 text-green-400" : "bg-white/5 border-white/5 text-white/20")}>
                                  <Icon className="w-5 h-5" strokeWidth={2.25} />
                                </div>
                                <div className="flex flex-col">
                                  <h3 className={cn("font-oswald font-black text-lg md:text-xl uppercase leading-none mb-1", widget.enabled ? "text-white" : "text-white/40")}>{config.name}</h3>
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{config.description}</p>
                                </div>
                              </div>
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0", 
                                widget.enabled ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-white/10",
                                "md:static md:inset-auto md:translate-x-0 md:translate-y-0",
                                "absolute top-[12px] right-[21px] -translate-x-[-50%] z-20"
                              )} />
                            </div>
                            {config.hasGoal && (
                              <div className="mt-auto flex items-end gap-2.5">
                                <div className={cn("relative flex-1", shakingWidget === id && "animate-shake")} onClick={(e) => widget.enabled && e.stopPropagation()}>
                                  {widget.enabled ? (
                                    id === 'nutrition' ? (
                                      // Для nutrition виджета - кликабельное поле с открытием BMI диалога
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setOpenBmiDialog(true)
                                        }}
                                        className={cn(
                                          "w-full bg-white/5 border rounded-xl px-3.5 py-2 min-h-[42px] flex items-center cursor-pointer transition-all hover:border-violet-500/50 hover:bg-white/10",
                                          shakingWidget === id 
                                            ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                                            : "border-white/10",
                                          !widget.goal && "hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                                        )}
                                      >
                                        {widget.goal ? (
                                          <span className="text-base font-oswald font-black text-white">{widget.goal}</span>
                                        ) : (
                                          <span className="text-base font-oswald font-black text-white/30">Выбрать цель</span>
                                        )}
                                        <span className="absolute right-3.5 bottom-[11px] text-[8px] font-black text-white/20 uppercase tracking-widest">{config.goalUnit}</span>
                                      </div>
                                    ) : (
                                      // Для остальных виджетов - обычное поле ввода
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        data-widget-id={id}
                                        value={widget.goal ?? ''}
                                        onChange={(e) => handleGoalChange(id, e.target.value)}
                                        placeholder="Цель"
                                        className={cn(
                                          "w-full bg-white/5 border rounded-xl px-3.5 py-2 text-base font-oswald font-black text-white focus:outline-none min-h-[42px] transition-all",
                                          shakingWidget === id 
                                            ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                                            : "border-white/10 focus:border-green-500/50"
                                        )}
                                      />
                                    )
                                  ) : (
                                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl min-h-[42px] flex items-center px-3.5 opacity-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleToggle(id); }}>
                                      <div className="w-10 h-3 bg-white/10 rounded animate-pulse" />
                                    </div>
                                  )}
                                  {widget.enabled && id !== 'nutrition' && <span className="absolute right-3.5 bottom-[11px] text-[8px] font-black text-white/20 uppercase tracking-widest">{config.goalUnit}</span>}
                                </div>
                                {id !== 'weight' && (
                                  <div className="relative group">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); if (!widget.enabled) handleToggle(id); else handleToggleInPlan(id); }}
                                      className={cn(
                                        "w-[42px] h-[42px] rounded-xl flex items-center justify-center border shrink-0 transition-all",
                                        widget.enabled 
                                          ? widget.inDailyPlan 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                                            : widget.goal
                                              ? "bg-white/5 border-white/10 text-white/30 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400"
                                              : "bg-white/[0.03] border-white/5 text-white/5 cursor-not-allowed"
                                          : "bg-white/[0.03] border-white/5 text-white/5"
                                      )}
                                    >
                                      <Target className="w-4.5 h-4.5" strokeWidth={2.25} />
                                    </button>
                                    {widget.enabled && !widget.goal && !widget.inDailyPlan && (
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        <div className="bg-amber-500/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg">
                                          Укажите цель
                                        </div>
                                        <div className="w-2 h-2 bg-amber-500/90 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                                      </div>
                                    )}
                                  </div>
                                )}
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
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </div>
            </motion.div>
          ) : (
            <motion.div
              key="habits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <HabitsSection userId={userId} profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Global BMI Dialog для nutrition виджета */}
    <BmiInfoDialog
      isOpen={openBmiDialog}
      onOpenChange={setOpenBmiDialog}
      bmiValue={bmiValue}
      bmiCategory={bmiCategory}
      userParams={localSettings.userParams}
      settings={localSettings}
      onUpdateSettings={saveSettings}
    />
    </>
  )
}

