'use client'

import { Smile, Frown, Meh, Angry, Laugh } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MoodTrackerProps {
  value: string // 'great', 'good', 'neutral', 'bad', 'awful'
  onChange: (newValue: string) => void
}

const MOODS = [
  { value: 'awful', icon: Angry, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
  { value: 'bad', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  { value: 'neutral', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { value: 'good', icon: Smile, color: 'text-lime-500', bg: 'bg-lime-100 dark:bg-lime-900/20' },
  { value: 'great', icon: Laugh, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
]

export function MoodTracker({ value, onChange }: MoodTrackerProps) {
  return (
    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Настроение</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          {MOODS.map((mood) => {
            const Icon = mood.icon
            const isSelected = value === mood.value
            return (
              <button
                key={mood.value}
                onClick={() => onChange(mood.value)}
                className={cn(
                  "p-3 rounded-full transition-all duration-200 hover:scale-110",
                  isSelected ? `${mood.bg} ring-2 ring-offset-2 ring-offset-background ${mood.color.replace('text-', 'ring-')}` : "hover:bg-muted"
                )}
              >
                <Icon className={cn("w-6 h-6", isSelected ? mood.color : "text-muted-foreground")} />
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

