'use client'

import { Check, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Habit {
  id: string
  title: string
  completed: boolean
  streak: number
  category: 'morning' | 'afternoon' | 'evening' | 'anytime'
}

interface HabitsWidgetProps {
  habits: Habit[]
  onToggle: (id: string) => void
}

export function HabitsWidget({ habits, onToggle }: HabitsWidgetProps) {
  // Sort: Uncompleted first
  const sortedHabits = [...habits].sort((a, b) => 
    a.completed === b.completed ? 0 : a.completed ? 1 : -1
  )

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Привычки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedHabits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm",
                habit.completed 
                  ? "bg-green-500/10 border-green-500/20" 
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  habit.completed
                    ? "bg-green-500 border-green-500"
                    : "border-muted-foreground group-hover:border-primary"
                )}>
                  {habit.completed && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className={cn(
                  "font-medium transition-opacity",
                  habit.completed ? "text-muted-foreground line-through opacity-70" : ""
                )}>
                  {habit.title}
                </span>
              </div>
              
              {habit.streak > 0 && (
                <div className="flex items-center text-xs text-orange-500 font-bold bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                  <Flame className="w-3 h-3 mr-1 fill-orange-500" />
                  {habit.streak}
                </div>
              )}
            </div>
          ))}
          {habits.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Нет активных привычек
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

