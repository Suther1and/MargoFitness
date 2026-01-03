'use client'

import { Plus, Minus, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WaterTrackerProps {
  value: number // in ml
  goal?: number // in ml, default 2500
  onChange: (newValue: number) => void
}

export function WaterTracker({ value, goal = 2500, onChange }: WaterTrackerProps) {
  const percentage = Math.min(100, (value / goal) * 100)

  const addWater = (amount: number) => {
    onChange(value + amount)
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Droplets size={100} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Droplets className="text-blue-500" />
          Вода
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold font-oswald text-blue-500">
                {value} <span className="text-lg text-muted-foreground font-normal">мл</span>
              </span>
              <span className="text-muted-foreground">
                Цель: {goal} мл
              </span>
            </div>
            <Progress value={percentage} className="h-4 bg-blue-100 dark:bg-blue-900/30" indicatorClassName="bg-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Button 
              variant="outline" 
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/50"
              onClick={() => addWater(250)}
            >
              <Plus className="w-4 h-4 mr-1" /> 250 мл
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/50"
              onClick={() => addWater(500)}
            >
              <Plus className="w-4 h-4 mr-1" /> 500 мл
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => onChange(Math.max(0, value - 250))}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

