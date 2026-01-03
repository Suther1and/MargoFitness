'use client'

import { Scale, ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeightTrackerProps {
  value: number // kg
  onChange: (newValue: number) => void
}

export function WeightTracker({ value, onChange }: WeightTrackerProps) {
  const update = (delta: number) => {
    onChange(Number((value + delta).toFixed(1)))
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500/10 to-teal-600/5 overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Scale size={80} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Scale className="text-emerald-500" />
          Вес
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => update(-0.1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-4xl font-bold font-oswald text-emerald-600 min-w-[100px] text-center">
              {value}
              <span className="text-lg text-muted-foreground font-normal ml-1">кг</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => update(0.1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
             <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={() => update(-1)}
            >
              -1 кг
            </Button>
             <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={() => update(1)}
            >
              +1 кг
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

