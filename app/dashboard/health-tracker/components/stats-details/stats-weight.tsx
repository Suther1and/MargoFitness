"use client"

import { motion } from "framer-motion"
import { Scale, TrendingDown, Target, Activity, Calendar, Award } from "lucide-react"
import { WeightChart } from "../weight-chart"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"

interface StatsWeightProps {
  period: string
}

// Моковые данные
const WEIGHT_DATA = [
  { date: "15 Дек", weight: 74.2 },
  { date: "17 Дек", weight: 73.8 },
  { date: "19 Дек", weight: 73.5 },
  { date: "21 Дек", weight: 73.9 },
  { date: "23 Дек", weight: 73.1 },
  { date: "25 Дек", weight: 72.8 },
  { date: "27 Дек", weight: 72.4 },
]

const EXTENDED_WEIGHT_DATA = [
  ...WEIGHT_DATA,
  { date: "29 Дек", weight: 72.1 },
  { date: "31 Дек", weight: 71.9 },
  { date: "02 Янв", weight: 71.6 },
  { date: "04 Янв", weight: 71.4 },
  { date: "06 Янв", weight: 71.2 },
]

export function StatsWeight({ period }: StatsWeightProps) {
  const { settings, isLoaded: isSettingsLoaded } = useTrackerSettings()
  const dataToShow = period === '7d' ? WEIGHT_DATA : EXTENDED_WEIGHT_DATA
  
  // Показываем загрузку пока настройки не готовы
  if (!isSettingsLoaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка данных...</p>
        </div>
      </div>
    )
  }
  
  if (dataToShow.length === 0) return null

  const currentWeight = dataToShow[dataToShow.length - 1].weight
  const startWeight = dataToShow[0].weight
  const weightChange = currentWeight - startWeight
  const goalWeight = settings.widgets.weight?.goal || 70.0
  const remainingToGoal = currentWeight - goalWeight

  // Расчет BMI
  const height = settings.userParams.height || 170 // см
  const bmi = (currentWeight / Math.pow(height / 100, 2)).toFixed(1)
  const startBmi = (startWeight / Math.pow(height / 100, 2)).toFixed(1)

  // Средняя потеря в неделю
  const weeks = period === '7d' ? 1 : period === '30d' ? 4 : 12
  const avgWeeklyLoss = Math.abs(weightChange / weeks).toFixed(2)

  // Прогноз достижения цели
  const weeksToGoal = avgWeeklyLoss !== '0.00' ? Math.ceil(remainingToGoal / parseFloat(avgWeeklyLoss)) : 0

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
      className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start"
    >
      <div className="space-y-6">
        {/* Главный график */}
        <motion.div variants={item}>
          <WeightChart data={dataToShow} period={period === '7d' ? 'последние 7 дней' : period === '30d' ? 'последние 30 дней' : 'последние 6 месяцев'} />
        </motion.div>
      </div>

      {/* Персональные инсайты */}
      <motion.div variants={item} className="p-6 rounded-[2.5rem] bg-[#121214]/60 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-white/5 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-tight">Персональные инсайты</h4>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">Анализ прогресса</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Главная метрика */}
          {weightChange < 0 && parseFloat(avgWeeklyLoss) >= 0.5 && parseFloat(avgWeeklyLoss) <= 1 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-bold mb-1.5">⭐ Идеальная динамика!</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы теряете <span className="font-bold text-white">{avgWeeklyLoss} кг в неделю</span> — 
                    это оптимальный темп! Потеря веса <span className="font-bold text-white">{Math.abs(weightChange).toFixed(1)} кг</span> за период.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Здоровый темп похудения
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : weightChange < 0 && parseFloat(avgWeeklyLoss) > 1 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-bold mb-1.5">⚠️ Слишком быстрая потеря</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы теряете <span className="font-bold text-white">{avgWeeklyLoss} кг в неделю</span>. 
                    Рекомендуется замедлить темп до 0.5-1 кг для сохранения здоровья.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Scale className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Увеличьте калорийность
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : weightChange < 0 ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 font-bold mb-1.5">Медленный прогресс</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Вы теряете <span className="font-bold text-white">{avgWeeklyLoss} кг в неделю</span>. 
                    Можно немного увеличить дефицит калорий для ускорения результата.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                      Оптимизируйте питание
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-300 font-bold mb-1.5">Вес увеличился</p>
                  <p className="text-xs text-white/70 leading-relaxed mb-2">
                    Прибавка <span className="font-bold text-white">+{Math.abs(weightChange).toFixed(1)} кг</span>. 
                    Пересмотрите питание и добавьте активность.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Target className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                      Создайте дефицит калорий
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Анализ BMI и цели */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Ваш BMI</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Текущий BMI: <span className="font-bold text-white">{bmi}</span>. 
                {parseFloat(bmi) < 18.5 ? ' Ниже нормы — набирайте вес.' :
                 parseFloat(bmi) > 24.9 ? ' Выше нормы — продолжайте худеть.' :
                 ' В пределах нормы (18.5-24.9)!'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">До цели</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Осталось <span className="font-bold text-white">{remainingToGoal.toFixed(1)} кг</span> до целевого веса 
                <span className="font-bold text-purple-400"> {goalWeight} кг</span>.
              </p>
            </div>
          </div>

          {/* Прогноз */}
          {weeksToGoal > 0 && weightChange < 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Прогноз</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                При текущем темпе вы достигнете цели через 
                <span className="font-bold text-white"> {weeksToGoal} {weeksToGoal === 1 ? 'неделю' : weeksToGoal < 5 ? 'недели' : 'недель'}</span>.
                {weeksToGoal > 12 && ' Рекомендуем немного увеличить дефицит калорий.'}
              </p>
            </div>
          )}

          {/* Практические советы */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Рекомендации</span>
            </div>
            <div className="space-y-2">
              {remainingToGoal < 3 && weightChange < 0 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Вы близки к цели! Начните планировать <span className="font-bold text-white">стратегию поддержания</span> веса. 
                  Постепенно увеличивайте калорийность до уровня поддержки.
                </p>
              )}
              {parseFloat(avgWeeklyLoss) >= 0.5 && parseFloat(avgWeeklyLoss) <= 1 && weightChange < 0 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Продолжайте в том же темпе! Ваш дефицит калорий идеален. 
                  Не забывайте о <span className="font-bold text-white">силовых тренировках</span> для сохранения мышц.
                </p>
              )}
              {parseFloat(avgWeeklyLoss) > 1 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Замедлите темп! Добавьте <span className="font-bold text-white">200-300 ккал</span> в день. 
                  Быстрая потеря веса может привести к потере мышечной массы.
                </p>
              )}
              {parseFloat(avgWeeklyLoss) < 0.5 && weightChange < 0 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Увеличьте активность или снизьте калорийность на <span className="font-bold text-white">200-300 ккал</span>. 
                  Рекомендуем добавить кардио 3-4 раза в неделю.
                </p>
              )}
              {weightChange >= 0 && (
                <p className="text-xs text-white/70 leading-relaxed">
                  🎯 Пересмотрите питание. Создайте дефицит <span className="font-bold text-white">300-500 ккал</span> в день 
                  через питание и активность для начала похудения.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

