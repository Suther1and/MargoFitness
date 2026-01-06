"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsMetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  iconColor?: string
  bgColor?: string
  borderColor?: string
  className?: string
}

export function StatsMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  iconColor = "text-white",
  bgColor = "bg-white/5",
  borderColor = "border-white/5",
  className
}: StatsMetricCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border",
      bgColor,
      borderColor,
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span className={cn(
          "text-[9px] font-black uppercase tracking-wider",
          iconColor.replace('text-', 'text-').concat('/60')
        )}>
          {label}
        </span>
      </div>
      <div className="text-3xl font-black text-white tabular-nums">
        {value} {unit && <span className="text-sm text-white/40">{unit}</span>}
      </div>
      {trendValue && (
        <div className={cn(
          "mt-2 text-[10px] font-bold uppercase tracking-wider",
          trend === 'up' ? "text-emerald-400" :
          trend === 'down' ? "text-red-400" :
          "text-white/40"
        )}>
          {trendValue}
        </div>
      )}
    </div>
  )
}

