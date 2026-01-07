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

function BmiInfoDialog({ bmiValue, bmiCategory, userParams }: { 
  bmiValue: string | null, 
  bmiCategory: any, 
  userParams: any 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activityLevel, setActivityLevel] = useState(1.55);

  const calorieNorms = useMemo(() => 
    calculateCalorieNorms(userParams.weight, userParams.height, userParams.age, activityLevel),
    [userParams, activityLevel]
  );

  const activityOptions = [
    { label: 'Низкая', value: 1.375, desc: 'Легкие прогулки или 1 тренировка в неделю' },
    { label: 'Средняя', value: 1.55, desc: 'Тренировки 2-3 раза в неделю' },
    { label: 'Высокая', value: 1.725, desc: 'Более 3 интенсивных тренировок в неделю' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogTrigger asChild>
        <button className="p-1.5 md:p-2 text-white/40 hover:text-white transition-all focus:outline-none">
          <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </DialogTrigger>
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
                    onClick={() => setActivityLevel(opt.value)}
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
              <div className="flex items-center justify-between bg-white/[0.03] rounded-2xl p-3.5 border border-white/5">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[7px] font-black text-emerald-400/40 uppercase tracking-widest mb-0.5">Похудение</span>
                  <div className="flex items-baseline gap-0.5 overflow-hidden">
                    <motion.span
                      key={calorieNorms.loss}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="text-xl font-oswald font-black text-emerald-400"
                    >
                      {calorieNorms.loss}
                    </motion.span>
                    <span className="text-[8px] font-bold text-emerald-400/20 uppercase">ккал</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[7px] font-black text-violet-400/40 uppercase tracking-widest mb-0.5">Баланс</span>
                  <div className="flex items-baseline gap-0.5 overflow-hidden">
                    <motion.span
                      key={calorieNorms.maintain}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="text-xl font-oswald font-black text-violet-400"
                    >
                      {calorieNorms.maintain}
                    </motion.span>
                    <span className="text-[8px] font-bold text-violet-400/20 uppercase">ккал</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[7px] font-black text-orange-400/40 uppercase tracking-widest mb-0.5">Набор</span>
                  <div className="flex items-baseline gap-0.5 overflow-hidden">
                    <motion.span
                      key={calorieNorms.gain}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="text-xl font-oswald font-black text-orange-400"
                    >
                      {calorieNorms.gain}
                    </motion.span>
                    <span className="text-[8px] font-bold text-orange-400/20 uppercase">ккал</span>
                  </div>
                </div>
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
  onBack,
  selectedDate,
  onDateChange,
  isCalendarExpanded,
  setIsCalendarExpanded,
  activeSubTab,
  setActiveSubTab,
  isMobile
}: SettingsTabProps) {
  const { settings, saveSettings } = useTrackerSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isAnimating, setIsAnimating] = useState(false)

  // Синхронизация с настройками только при внешних изменениях
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleToggle = (widgetId: WidgetId) => {
    const newSettings = {
      ...localSettings,
      widgets: {
        ...localSettings.widgets,
        [widgetId]: {
          ...localSettings.widgets[widgetId],
          enabled: !localSettings.widgets[widgetId].enabled,
        }
      }
    }
    setLocalSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleGoalChange = (widgetId: WidgetId, value: string) => {
    const filtered = value.replace(/[^\d.]/g, '')
    const newSettings = {
      ...localSettings,
      widgets: {
        ...localSettings.widgets,
        [widgetId]: {
          ...localSettings.widgets[widgetId],
          goal: filtered ? parseFloat(filtered) : null,
        }
      }
    }
    setLocalSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleToggleInPlan = (widgetId: WidgetId) => {
    const newSettings = {
      ...localSettings,
      widgets: {
        ...localSettings.widgets,
        [widgetId]: {
          ...localSettings.widgets[widgetId],
          inDailyPlan: !localSettings.widgets[widgetId].inDailyPlan,
        }
      }
    }
    setLocalSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleParamChange = (param: 'height' | 'weight' | 'age' | 'gender', value: any) => {
    let finalValue = value;
    if (param !== 'gender') {
      finalValue = value.replace(/[^\d.]/g, '').slice(0, 3)
      finalValue = finalValue ? parseFloat(finalValue) : null
    }
    
    const newSettings = {
      ...localSettings,
      userParams: {
        ...localSettings.userParams,
        [param]: finalValue,
      }
    }
    setLocalSettings(newSettings)
    saveSettings(newSettings)
  }

  const bmiValue = calculateBMI(localSettings.userParams.height, localSettings.userParams.weight)
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null
  const calorieNorms = calculateCalorieNorms(
    localSettings.userParams.weight,
    localSettings.userParams.height,
    localSettings.userParams.age
  )

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
      <div className="flex flex-col bg-white/[0.03] rounded-2xl border border-white/10 md:backdrop-blur-md overflow-hidden shadow-2xl w-full lg:hidden">
        <div className="flex items-stretch h-[60px] border-b border-white/5">
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
                  layoutId={isMobile ? "activeSubTab-mobile" : "activeSubTab"} 
                  className="absolute inset-0 bg-amber-500 rounded-xl -z-10" 
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} 
                />
              )}
              <span className="relative z-10">Привычки</span>
            </button>
          </div>
        </div>

        {/* BMI Panel on Desktop only */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="hidden lg:flex flex-col bg-white/[0.03] rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl min-w-[420px]"
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
                            <div className="flex items-start justify-between mb-4 relative">
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
                                {id !== 'weight' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); if (!widget.enabled) handleToggle(id); else handleToggleInPlan(id); }}
                                    className={cn("w-[42px] h-[42px] rounded-xl flex items-center justify-center border shrink-0 transition-all", widget.enabled ? widget.inDailyPlan ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/10" : "bg-white/[0.03] border-white/5 text-white/5")}
                                  >
                                    <Target className="w-4.5 h-4.5" strokeWidth={2.25} />
                                  </button>
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
                                {id === 'notes' && (
                                  <div className={cn("flex flex-col items-start gap-1.5", widget.enabled ? "opacity-30" : "opacity-10")}>
                                    <div className="h-1 bg-white rounded-full w-12" />
                                    <div className="h-1 bg-white rounded-full w-24" />
                                    <div className="h-1 bg-white rounded-full w-36" />
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

