"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, Zap, Scale, Droplets, Footprints, Moon, Camera, NotebookText, ArrowRight, Trophy, Calendar, Smile, Utensils, Flame, Frown, Meh, Laugh, Annoyed, Soup, Pizza, Hamburger, Apple, Salad, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { calculateBMI, getBMICategory } from "../../utils/bmi-utils"
import { StatsView } from "../../types"
import Image from "next/image"

interface StatsOverallProps {
  period: string
  onNavigate?: (view: StatsView) => void
}

// Моковые данные для демонстрации
interface Insight {
  id: string
  label: string
  value: string
  subValue?: string
  change: number
  trend: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
}

const MOCK_INSIGHTS: Insight[] = [
  { id: 'weight', label: 'Вес', value: '72.4 кг', subValue: '-1.8 кг', change: -1.8, trend: 'down', icon: Scale, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { id: 'steps', label: 'Шаги', value: '9,043', subValue: 'в день', change: 12, trend: 'up', icon: Footprints, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { id: 'sleep', label: 'Сон', value: '7.6 ч', subValue: 'в день', change: 45, trend: 'up', icon: Moon, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', borderColor: 'border-indigo-400/20' },
]

const MOCK_PHOTOS = [
  { id: "1", date: "21 янв", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=200&fit=crop", weight: 72.4 },
  { id: "2", date: "14 янв", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=200&fit=crop", weight: 73.1 },
  { id: "3", date: "07 янв", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=200&fit=crop", weight: 73.9 },
]

const MOCK_LAST_NOTE = {
  id: "1",
  date: "Вчера, 20:45",
  content: "Сегодня чувствую себя отлично! Утренняя тренировка прошла на ура, энергии через край 💪",
  mood: 5
}

// Моковые данные для анализа (в реальности будут из API)
const MOCK_METRICS_DATA = {
  water: { achieved: 5, total: 7, avgPercentage: 85, goal: 2500, avgValue: 2125 },
  steps: { achieved: 6, total: 7, avgPercentage: 112, goal: 10000, avgValue: 11200 },
  weight: { change: -1.8, trend: 'down', avgLoss: 0.6 },
  sleep: { achieved: 4, total: 7, avgHours: 7.6, goal: 8 },
  habits: { avgCompletion: 75, streak: 12 },
  mood: { avgMood: 4.2, avgEnergy: 7.8 },
  caffeine: { avgCups: 2.1, daysWithout: 2 },
  nutrition: { avgCalories: 2050, goal: 2000 }
}

// Утилита для анализа корреляций и генерации инсайтов
function analyzeMetrics(settings: any) {
  const enabledMetrics = Object.entries(settings.widgets)
    .filter(([_, widget]: [string, any]) => widget.enabled)
    .map(([key]) => key)

  if (enabledMetrics.length === 0) {
    return {
      title: "Начните отслеживать метрики",
      description: "Включите виджеты в настройках для получения персональных рекомендаций и анализа",
      streak: 0,
      efficiency: 0,
      type: 'empty'
    }
  }

  if (enabledMetrics.length === 1) {
    return {
      title: "Отслеживайте больше метрик",
      description: "Добавьте еще несколько показателей для умного анализа взаимосвязей и корреляций",
      streak: MOCK_METRICS_DATA.habits.streak,
      efficiency: 65,
      type: 'single'
    }
  }

  // Вычисляем общую эффективность
  let totalAchieved = 0
  let totalGoals = 0
  const metricsStatus: any = {}

  enabledMetrics.forEach((metric) => {
    const data = MOCK_METRICS_DATA[metric as keyof typeof MOCK_METRICS_DATA]
    if (data && 'achieved' in data && 'total' in data) {
      totalAchieved += data.achieved
      totalGoals += data.total
      metricsStatus[metric] = data.avgPercentage || ((data.achieved / data.total) * 100)
    }
  })

  const efficiency = totalGoals > 0 ? Math.round((totalAchieved / totalGoals) * 100) : 0

  // Находим лучшие и проблемные метрики
  const sortedMetrics = Object.entries(metricsStatus).sort(([, a]: any, [, b]: any) => b - a)
  const bestMetric = sortedMetrics[0]
  const worstMetric = sortedMetrics[sortedMetrics.length - 1]

  // Генерируем инсайт на основе анализа
  if (efficiency >= 85) {
    // Отличный прогресс - ищем корреляции
    const hasSleep = enabledMetrics.includes('sleep')
    const hasSteps = enabledMetrics.includes('steps')
    const hasMood = enabledMetrics.includes('mood')

    if (hasSleep && hasSteps && MOCK_METRICS_DATA.sleep.avgHours >= 7.5) {
      return {
        title: "Ваша дисциплина растёт!",
        description: `Сон ${MOCK_METRICS_DATA.sleep.avgHours}ч коррелирует с высокой активностью ${(MOCK_METRICS_DATA.steps.avgValue / 1000).toFixed(1)}к шагов${hasMood ? ' и отличным настроением' : ''}`,
        streak: MOCK_METRICS_DATA.habits.streak,
        efficiency,
        type: 'excellent'
      }
    }

    return {
      title: "Превосходные результаты!",
      description: `Вы достигли ${efficiency}% целей. ${bestMetric ? `Особенно хорошо — ${bestMetric[0]} (${Math.round(bestMetric[1] as number)}%)` : 'Продолжайте в том же духе!'}`,
      streak: MOCK_METRICS_DATA.habits.streak,
      efficiency,
      type: 'excellent'
    }
  }

  if (efficiency >= 60) {
    // Хороший прогресс, но есть зоны роста
    return {
      title: "Хороший прогресс с потенциалом",
      description: `${bestMetric ? `${bestMetric[0].charAt(0).toUpperCase() + bestMetric[0].slice(1)} на высоте (${Math.round(bestMetric[1] as number)}%)` : 'Есть успехи'}, но ${worstMetric ? `${worstMetric[0]} требует внимания` : 'можно лучше'}`,
      streak: MOCK_METRICS_DATA.habits.streak,
      efficiency,
      type: 'good'
    }
  }

  // Нужно улучшение - ищем проблемы
  const problemMetrics = Object.entries(metricsStatus)
    .filter(([, value]: any) => value < 60)
    .map(([key]) => key)

  if (problemMetrics.length >= 2) {
    return {
      title: "Обратите внимание на базовые метрики",
      description: `${problemMetrics.slice(0, 2).join(' и ')} ниже нормы последние дни. Это может влиять на общее самочувствие и продуктивность`,
      streak: MOCK_METRICS_DATA.habits.streak,
      efficiency,
      type: 'needs_attention'
    }
  }

  return {
    title: "Есть пространство для роста",
    description: `Текущая эффективность ${efficiency}%. Сфокусируйтесь на ${worstMetric ? worstMetric[0] : 'базовых привычках'} для улучшения общих показателей`,
    streak: MOCK_METRICS_DATA.habits.streak,
    efficiency,
    type: 'improve'
  }
}

export function StatsOverall({ period, onNavigate }: StatsOverallProps) {
  const { settings } = useTrackerSettings()
  
  const bmiValue = calculateBMI(settings.userParams.height, settings.userParams.weight)
  const bmiCategory = getBMICategory(Number(bmiValue))

  // Умный анализ метрик
  const smartInsight = analyzeMetrics(settings)

  // Фильтруем инсайты по включенным виджетам
  const visibleInsights = MOCK_INSIGHTS.filter(insight => {
    return settings.widgets[insight.id as keyof typeof settings.widgets]?.enabled
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-4"
    >
      {/* Smart Analytics - Умный анализ */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Smart Analytics</span>
            </div>
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ animationDelay: `${i * 0.2}s` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className={cn(
              "text-xl font-black leading-tight uppercase tracking-tight",
              smartInsight.type === 'excellent' ? "text-white" :
              smartInsight.type === 'good' ? "text-white" :
              smartInsight.type === 'needs_attention' ? "text-amber-300" :
              "text-white"
            )}>
              {smartInsight.title}
            </h2>
            <p className="text-xs text-white/50 leading-relaxed font-medium max-w-[95%]">
              {smartInsight.description}
            </p>
          </div>

          <div className="flex items-center gap-8 pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Стрик целей</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{smartInsight.streak}</span>
                <span className="text-[9px] font-black text-amber-500 uppercase">{smartInsight.streak === 1 ? 'день' : smartInsight.streak < 5 ? 'дня' : 'дней'}</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Эффективность</span>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-xl font-black",
                  smartInsight.efficiency >= 80 ? "text-emerald-400" :
                  smartInsight.efficiency >= 60 ? "text-blue-400" :
                  "text-amber-400"
                )}>{smartInsight.efficiency}</span>
                <span className={cn(
                  "text-[9px] font-black uppercase",
                  smartInsight.efficiency >= 80 ? "text-emerald-400/60" :
                  smartInsight.efficiency >= 60 ? "text-blue-400/60" :
                  "text-amber-400/60"
                )}>%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Вода и Вес - Сетка 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {settings.widgets.water.enabled && (
          <motion.div 
            variants={item} 
            onClick={() => onNavigate?.('water')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-blue-500/20 transition-all duration-300 active:scale-[0.98] group"
          >
            {/* Wave Background Effect */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "85%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/10 to-blue-500/5 pointer-events-none"
            />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Droplets className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Вода</div>
                </div>
              </div>
              
              {/* Circular Progress with Value */}
              <div className="flex items-center justify-center py-2">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.85) }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      style={{ filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-black text-white leading-none">85%</span>
                    <span className="text-[7px] font-bold text-blue-400/60 uppercase tracking-wider mt-0.5">цель</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-black text-white tabular-nums tracking-tight">2.3<span className="text-sm text-blue-400/60 font-black ml-1">л</span></div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Среднее за день</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Вес - С мини-графиком тренда */}
        {settings.widgets.weight.enabled && (
          <motion.div
            variants={item}
            onClick={() => onNavigate?.('weight')}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 transition-all duration-300 hover:border-emerald-500/20 active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Scale className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Вес</div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-400" />
                  <span className="text-sm font-black text-emerald-400 tabular-nums">-1.8</span>
                </div>
              </div>

              {/* Sparkline Graph */}
              <div className="relative h-12 flex items-end gap-1">
                {[74.2, 73.9, 73.6, 73.1, 72.8, 72.6, 72.4].map((value, i) => {
                  const maxValue = 74.2
                  const minValue = 72.4
                  const height = ((value - minValue) / (maxValue - minValue)) * 100
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400/60 rounded-t-sm"
                    />
                  )
                })}
              </div>

              <div>
                <div className="text-2xl font-black text-white tabular-nums leading-none tracking-tight">72.4<span className="text-sm text-white/40 font-bold ml-1">кг</span></div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Текущий вес • BMI: {bmiValue}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Шаги - Горизонтальная карточка с графиком */}
      {settings.widgets.steps.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('steps')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-5 transition-all duration-300 hover:border-red-500/20 active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                <Footprints className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-xl font-black text-white tabular-nums tracking-tight">11,200</div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Среднее шагов</div>
              </div>
            </div>

            {/* Mini Area Chart */}
            <div className="flex-1 max-w-[120px] h-10 relative">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  d="M 0,30 L 14,28 L 28,32 L 42,25 L 56,20 L 70,15 L 84,18 L 100,12"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  d="M 0,30 L 14,28 L 28,32 L 42,25 L 56,20 L 70,15 L 84,18 L 100,12 L 100,40 L 0,40 Z"
                  fill="url(#stepsGradient)"
                />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-black text-red-500 leading-none tabular-nums">112%</div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Цель</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Питание - Упрощенная версия */}
      {settings.widgets.nutrition.enabled && (
        <motion.div 
          variants={item} 
          onClick={() => onNavigate?.('nutrition')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-violet-500/20 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                <Utensils className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Питание</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white tabular-nums tracking-tight">2,050</span>
                  <span className="text-[9px] font-bold text-white/20 uppercase">ккал/день</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Баланс</span>
              </div>
              
              <div className="w-px h-8 bg-white/5" />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", bmiCategory?.bgColor || "bg-emerald-500")} />
                  <span className="text-xl font-black text-white leading-none tracking-tight">{bmiValue || "24.2"}</span>
                </div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">ИМТ</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Дисциплина - Исправленная версия с защитой от переполнения */}
      <motion.div
        variants={item}
        onClick={() => onNavigate?.('habits')}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/5 p-5 cursor-pointer hover:border-white/10 active:scale-[0.98] group"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                <motion.circle 
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 * (1 - 0.75) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-orange-500" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-black text-white tracking-tighter">75%</span>
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5 truncate">Дисциплина</div>
              <div className="text-lg font-black text-white tracking-tight uppercase leading-none truncate">Стабильность</div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-px h-10 bg-white/5" />
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-2xl font-black text-white tabular-nums tracking-tight">12</span>
              </div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em] whitespace-nowrap">Лучший стрик</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Настроение и Энергия - Компактная версия */}
      {settings.widgets.mood.enabled && (
        <motion.div 
          variants={item}
          onClick={() => onNavigate?.('mood')}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121214]/60 p-5 cursor-pointer hover:border-pink-500/20 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Настроение */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                <Smile className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Настроение</div>
                <div className="flex gap-1 mt-1.5">
                  {[Frown, Meh, Smile, Laugh].map((Icon, i) => (
                    <div key={i} className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 border",
                      i === 2 
                        ? "bg-pink-500/20 border-pink-500/30" 
                        : "bg-white/5 border-white/5 opacity-30"
                    )}>
                      <Icon className={cn("w-3.5 h-3.5", i === 2 ? "text-pink-400" : "text-white")} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-px h-14 bg-white/5" />

            {/* Энергия */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Zap className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Энергия</span>
                <span className="text-sm font-black text-white tracking-tight ml-auto">7.8/10</span>
              </div>
              <div className="flex gap-0.5 h-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-sm transition-all duration-700", 
                      i < 8 
                        ? "bg-gradient-to-t from-orange-600 to-orange-400" 
                        : "bg-white/5"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Peak Performance - Компактный блок-награда */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600/10 via-[#121214] to-blue-600/5 border border-white/10 p-6 group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em] mb-0.5">Peak day</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white uppercase tracking-tight">Пятница</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Рекорд</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-purple-500/30 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-around px-2 py-1 bg-white/[0.02] rounded-2xl border border-white/10">
            {[
              { label: 'Шаги', val: '12.4k', color: 'text-red-500' },
              { label: 'Вода', val: '2.8л', color: 'text-blue-400' },
              { label: 'Сон', val: '8.5ч', color: 'text-indigo-400' }
            ].map((stat, i) => (
              <div key={i} className="text-center group/stat">
                <div className={cn("text-lg font-black transition-transform group-hover/stat:scale-110 duration-300", stat.color)}>{stat.val}</div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Фото прогресса (если включены) */}
      {settings.widgets.photos.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('photos')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-violet-500/20 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                <Camera className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Прогресс в фото</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase">
              {MOCK_PHOTOS.length} фото
              <ArrowRight className="w-3 h-3 text-violet-400/60" />
            </div>
          </div>

          <div className="flex gap-3">
            {MOCK_PHOTOS.map((photo, index) => (
              <div key={photo.id} className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group-hover:border-violet-500/20 transition-all">
                <Image
                  src={photo.url}
                  alt={`Progress ${photo.date}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-[8px] font-black text-white/60 uppercase tracking-wider mb-0.5">
                    {photo.date}
                  </div>
                  <div className="text-xs font-black text-white tabular-nums">
                    {photo.weight} <span className="text-[9px] text-white/40">кг</span>
                  </div>
                </div>
                {index > 0 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                    <span className="text-[8px] font-black text-emerald-400">
                      {(photo.weight - MOCK_PHOTOS[0].weight).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Последняя заметка (если включены) */}
      {settings.widgets.notes.enabled && (
        <motion.div
          variants={item}
          onClick={() => onNavigate?.('notes')}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#121214]/60 border border-white/10 p-6 cursor-pointer hover:border-sky-500/20 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:scale-110 transition-transform duration-500">
                <NotebookText className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Дневник</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase">
              12 записей
              <ArrowRight className="w-3 h-3 text-sky-400/60" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-sky-400/60 uppercase tracking-wider">
                {MOCK_LAST_NOTE.date}
              </span>
              {MOCK_LAST_NOTE.mood && (
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        i < MOCK_LAST_NOTE.mood ? "bg-sky-400" : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 leading-relaxed font-medium line-clamp-2">
                {MOCK_LAST_NOTE.content}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

