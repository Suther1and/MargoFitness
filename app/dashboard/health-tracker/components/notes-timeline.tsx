"use client"

import { NotebookPen, Calendar, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface NoteEntry {
  id: string
  date: string
  content: string
  mood?: number
}

interface NotesTimelineProps {
  notes: NoteEntry[]
}

export function NotesTimeline({ notes }: NotesTimelineProps) {
  if (notes.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <NotebookPen className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Дневник заметок</h3>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">
                {note.date}
              </span>
              {note.mood && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1 h-1 rounded-full",
                        i < (note.mood || 0) ? "bg-amber-500" : "bg-white/5"
                      )} 
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-medium">
              {note.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

