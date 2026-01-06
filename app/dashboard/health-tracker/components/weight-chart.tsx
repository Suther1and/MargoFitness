"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Scale } from "lucide-react"

interface WeightChartProps {
  data: { date: string; weight: number }[]
  period: string
}

const chartConfig = {
  weight: {
    label: "Вес",
    color: "var(--color-weight)",
  },
} satisfies ChartConfig

export function WeightChart({ data, period }: WeightChartProps) {
  // Находим мин и макс для оси Y, чтобы график был более наглядным
  const weights = data.map((d) => d.weight)
  const minWeight = Math.floor(Math.min(...weights) - 1)
  const maxWeight = Math.ceil(Math.max(...weights) + 1)

  return (
    <Card className="bg-[#121214]/40 border-white/5 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            Динамика веса
          </CardTitle>
          <CardDescription className="text-white/40 text-[10px] uppercase tracking-wider font-bold">
            Изменения за {period}
          </CardDescription>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white leading-none">
            {data[data.length - 1]?.weight} <span className="text-xs text-white/40">кг</span>
          </div>
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
            -{ (data[0].weight - data[data.length - 1].weight).toFixed(1) } кг всего
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            data={data}
            margin={{
              left: -20,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(245, 158, 11)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(245, 158, 11)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              stroke="rgba(255,255,255,0.2)"
              fontSize={10}
              fontWeight="bold"
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              hide
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="line" />}
            />
            <Area
              dataKey="weight"
              type="natural"
              fill="url(#fillWeight)"
              fillOpacity={1}
              stroke="rgb(245, 158, 11)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "rgb(245, 158, 11)",
                strokeWidth: 2,
                stroke: "#09090b",
              }}
              activeDot={{
                r: 6,
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

