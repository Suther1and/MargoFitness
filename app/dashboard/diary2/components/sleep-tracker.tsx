'use client'

import { Moon, BedDouble } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SleepTrackerProps {
  value: number // hours
  onChange: (newValue: number) => void
}

export function SleepTracker({ value, onChange }: SleepTrackerProps) {
  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500/10 to-purple-600/5 overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Moon size={80} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BedDouble className="text-indigo-500" />
          Сон
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-bold font-oswald text-indigo-500">
              {value} <span className="text-lg text-muted-foreground font-normal">ч</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {value < 6 ? 'Мало спали' : value > 9 ? 'Долго спали' : 'Отлично'}
            </span>
          </div>

          <div className="relative w-full h-12 flex items-center">
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer dark:bg-indigo-900 accent-indigo-500"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>0ч</span>
            <span>7ч</span>
            <span>14ч</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

