'use client'

import { memo, useMemo } from 'react'
import { Footprints, Flame, MapPin, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditableValue, useGoalProgress } from '../hooks'
import { MetricButton, EditableMetricValue, ProgressRing, AchievementBadge } from './shared'
import { COLORS } from '../constants'

interface StepsCardHProps {
  steps: number
  goal: number
  onUpdate: (val: number) => void
}

const EnergyField = ({ isDone }: { isDone: boolean }) => {
  const particles = useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 2
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={cn(
            "absolute rounded-full",
            isDone ? "bg-emerald-400" : "bg-red-500"
          )}
          style={{
            left: `${p.x}%`,
            bottom: `-10%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -150],
            opacity: [0, 1, 0],
            scale: [1, 1.5, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

export const StepsCardH = memo(function StepsCardH({ steps, goal, onUpdate }: StepsCardHProps) {
  const { percentage, isDone } = useGoalProgress({ current: steps, goal })
  const {
    isEditing,
    localValue,
    inputValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableValue(steps, { onUpdate, step: 500, min: 0, maxValue: 99999, decimalPlaces: 0 })

  const distance = useMemo(() => ((localValue * 0.65) / 1000).toFixed(2), [localValue])
  const calories = useMemo(() => Math.round(localValue * 0.038), [localValue])

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[2rem] border transition-colors duration-500 h-[120px] md:backdrop-blur-2xl px-6 pt-2 md:pt-3 pb-5",
      isDone 
        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
        : "border-white/10 bg-zinc-900/50 hover:border-red-500/20"
    )} style={{ contain: 'paint' }}>
      <EnergyField isDone={isDone} />
      {/* Фоновое свечение */}
      <div className={cn(
        "absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000 hidden md:block",
        isDone ? "bg-emerald-500/10" : "bg-red-500/5"
      )} />

      {/* DESKTOP VERSION - UNTOUCHED */}
      <div className="hidden md:grid relative grid-cols-[1.2fr_auto_1fr_0.8fr] items-center h-full gap-0">
        <div className="flex flex-col h-full justify-between">
          <div className="pt-1">
            <AchievementBadge
              isDone={isDone}
              icon={Footprints}
              doneText="ЦЕЛЬ ДОСТИГНУТА"
              progressText="АКТИВНОСТЬ"
              iconColor="text-red-500"
              iconBg="bg-red-500/10"
            />
          </div>

          <div className="flex items-center gap-3 mb-1">
            <MetricButton icon={Minus} onClick={handleDecrement} size="small" iconClassName="text-white/40" />
            <div className="flex flex-col items-center min-w-[100px]">
              <EditableMetricValue
                value={localValue}
                isEditing={isEditing}
                onEdit={handleEdit}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                inputValue={inputValue}
                format={(v) => v.toLocaleString()}
                autoShrink={true}
                className={cn("text-4xl font-black font-oswald tracking-tighter leading-none", isDone ? "text-emerald-400" : "text-white")}
                inputClassName="text-center text-3xl w-24"
              />
              <span className={cn("text-[9px] font-bold uppercase tracking-tighter transition-colors duration-500 mt-1", isDone ? "text-emerald-400" : "text-white/20")}>
                ШАГОВ СЕГОДНЯ
              </span>
            </div>
            <MetricButton icon={Plus} onClick={handleIncrement} size="small" variant={isDone ? 'success' : 'default'} iconClassName={isDone ? 'text-emerald-400' : 'text-red-500'} className={isDone ? '' : 'bg-red-500/10 border-red-500/20'} />
          </div>
        </div>

        <div className="w-px h-12 bg-white/5 mx-6" />

        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", isDone ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10")}>
              <MapPin className={cn("w-4 h-4", isDone ? "text-emerald-400/60" : "text-red-500/70")} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white/80 tabular-nums leading-tight">{distance} км</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">дистанция</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", isDone ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10")}>
              <Flame className={cn("w-4 h-4", isDone ? "text-emerald-400/60" : "text-red-500/70")} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white/80 tabular-nums leading-tight">{calories} ккал</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">энергия</span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-end">
          <ProgressRing 
            percentage={percentage} 
            isDone={isDone} 
            size="small" 
            color="#ef4444" 
            glowColor="bg-red-500/15"
            achievedColor="#10b981"
          >
            <span className={cn("text-[14px] font-black tabular-nums leading-none", isDone ? "text-emerald-400" : "text-white")}>{percentage}%</span>
            <div className="flex items-center gap-0.5 mt-1">
              <span className="text-[8px] font-black text-white/40 uppercase">цель</span>
              <span className="text-[8px] font-black text-white/20 uppercase hidden md:inline">
                {goal >= 1000 ? `${(goal / 1000).toFixed(0)}к` : goal}
              </span>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* MOBILE VERSION - SCALED AND RENDERED IN ONE ROW */}
      <div className="flex md:hidden relative items-center h-full justify-between gap-1">
        {/* Left: Info & Main Controls */}
        <div className="flex flex-col h-full justify-between py-1 flex-1 min-w-0">
          <div className="pt-0">
            <AchievementBadge
              isDone={isDone}
              icon={Footprints}
              doneText="ГОТОВО"
              progressText="АКТИВНОСТЬ"
              iconColor="text-red-500"
              iconBg="bg-red-500/10"
            />
          </div>

          <div className="flex items-center gap-2 mb-0.5 mt-3">
            <MetricButton icon={Minus} onClick={handleDecrement} size="small" iconClassName="text-white/40" />
            <div className="flex flex-col items-center">
              <EditableMetricValue
                value={localValue}
                isEditing={isEditing}
                onEdit={handleEdit}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                inputValue={inputValue}
                format={(v) => v.toLocaleString()}
                autoShrink={true}
                className={cn("text-3xl font-black font-oswald leading-none", isDone ? "text-emerald-400" : "text-white")}
                inputClassName="text-center text-2xl w-20"
              />
              <span className={cn("text-[8px] font-bold uppercase tracking-tighter mt-1", isDone ? "text-emerald-400" : "text-white/20")}>ШАГОВ</span>
            </div>
            <MetricButton icon={Plus} onClick={handleIncrement} size="small" variant={isDone ? 'success' : 'default'} iconClassName={isDone ? 'text-emerald-400' : 'text-red-500'} className={isDone ? '' : 'bg-red-500/10 border-red-500/20'} />
          </div>
        </div>

        {/* Center: Detail Metrics (Vertically in the gap) */}
        <div className="flex flex-col justify-center gap-3 px-3 translate-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500/70" />
            <span className="text-[13px] font-black text-white/80 tabular-nums">{distance} км</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500/70" />
            <span className="text-[13px] font-black text-white/80 tabular-nums">{calories} ккал</span>
          </div>
        </div>

        {/* Right: Ring */}
        <div className="flex-shrink-0 translate-y-3">
          <ProgressRing 
            percentage={percentage} 
            isDone={isDone} 
            size="small" 
            color="#ef4444" 
            glowColor="bg-red-500/15"
            achievedColor="#10b981"
          >
            <span className="text-[12px] font-black text-white">{percentage}%</span>
          </ProgressRing>
        </div>
      </div>
    </div>
  )
})
