"use client"

import { motion } from "framer-motion"
import { Scale, TrendingDown, Target, Activity, Calendar, Award } from "lucide-react"
import { WeightChart } from "../weight-chart"
import { cn } from "@/lib/utils"

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
  const dataToShow = period === '7d' ? WEIGHT_DATA : EXTENDED_WEIGHT_DATA
  
  const currentWeight = dataToShow[dataToShow.length - 1].weight
  const startWeight = dataToShow[0].weight
  const weightChange = currentWeight - startWeight
  const goalWeight = 70.0
  const remainingToGoal = currentWeight - goalWeight

  // Расчет BMI
  const height = 170 // см
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
      className="space-y-6"
    >
      {/* Главный график */}
      <motion.div variants={item}>
        <WeightChart data={dataToShow} period={period === '7d' ? 'последние 7 дней' : period === '30d' ? 'последние 30 дней' : 'последние 6 месяцев'} />
      </motion.div>

      {/* Ключевые метрики - сетка 2x2 */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Текущий вес */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/60">Текущий вес</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {currentWeight} <span className="text-sm text-white/40">кг</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {weightChange.toFixed(1)} кг за период
          </div>
        </div>

        {/* BMI */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-400/60">BMI</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {bmi}
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Норма: 18.5-24.9
          </div>
        </div>

        {/* До цели */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60">До цели</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {remainingToGoal.toFixed(1)} <span className="text-sm text-white/40">кг</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            Цель: {goalWeight} кг
          </div>
        </div>

        {/* Средняя потеря */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400/60">В неделю</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            -{avgWeeklyLoss} <span className="text-sm text-white/40">кг</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Средняя потеря
          </div>
        </div>
      </motion.div>

      {/* Прогноз достижения цели */}
      {weeksToGoal > 0 && (
        <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-emerald-500/20 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогноз</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/70 font-medium">
              При текущих темпах вы достигнете целевого веса через
            </p>
            <div className="text-2xl font-black text-white">
              {weeksToGoal} {weeksToGoal === 1 ? 'неделю' : weeksToGoal < 5 ? 'недели' : 'недель'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Динамика BMI */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Динамика BMI</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60 font-medium">Начальный BMI</span>
            <span className="text-lg font-black text-white tabular-nums">{startBmi}</span>
          </div>
          
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((parseFloat(startBmi) - parseFloat(bmi)) / parseFloat(startBmi)) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60 font-medium">Текущий BMI</span>
            <span className="text-lg font-black text-emerald-400 tabular-nums">{bmi}</span>
          </div>
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Рекомендации</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Отличная динамика! Продолжайте в том же темпе для достижения цели.
            </p>
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-white/5">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <p className="text-sm text-white/70 font-medium">
              Здоровая потеря веса составляет 0.5-1 кг в неделю. Вы в норме!
            </p>
          </div>

          {remainingToGoal < 3 && (
            <div className="flex gap-3 p-3 rounded-xl bg-white/5">
              <div className="mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <p className="text-sm text-white/70 font-medium">
                Вы близки к цели! Не забывайте о важности поддержания результата.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

