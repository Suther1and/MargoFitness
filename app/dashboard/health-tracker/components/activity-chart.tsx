"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityChartProps {
  data: { date: string; value: number }[]
  title: string
  subtitle: string
  icon: LucideIcon
  color: string
  unit: string
  dataKey?: string
}

export function ActivityChart({ 
  data, 
  title, 
  subtitle, 
  icon: Icon, 
  color, 
  unit,
  dataKey = "value" 
}: ActivityChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig

  const avgValue = Math.round(data.reduce((acc, curr) => acc + curr.value, 0) / data.length)

  return (
    <Card className="bg-white/5 border-white/5 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
        <div className="space-y-0.5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white/90">
            <Icon className="w-3 h-3" style={{ color: color }} />
            {title}
          </CardTitle>
          <div className="text-lg font-black text-white leading-none">
            {avgValue.toLocaleString()} <span className="text-[9px] text-white/40 font-bold uppercase">{unit}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ChartContainer config={chartConfig} className="h-[80px] w-full">
          <BarChart data={data}>
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[2, 2, 0, 0]}
              maxBarSize={12}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

