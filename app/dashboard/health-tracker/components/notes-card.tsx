'use client'

import { FileText, Edit3 } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface NotesCardProps {
  value: string
  onUpdate: (val: string) => void
}

export function NotesCard({ value, onUpdate }: NotesCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    const container = containerRef.current
    if (textarea && container) {
      // Сбрасываем высоту, чтобы вычислить новую
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      
      // Устанавливаем высоту textarea (базовую, до масштабирования)
      textarea.style.height = scrollHeight + 'px'
      
      // Вычисляем финальную высоту контейнера с учетом масштаба 0.875
      // и добавляем небольшой запас для плавности
      const finalHeight = Math.max(80, scrollHeight * 0.875)
      container.style.height = finalHeight + 'px'
    }
  }, [value])

  return (
    <div 
      className="rounded-[2.5rem] border border-white/5 bg-[#121214]/95 md:bg-[#121214]/40 md:backdrop-blur-xl p-5 md:p-6 hover:border-white/10 transition-colors duration-300"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-400" />
        </div>
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Заметки</h3>
      </div>
      
      <div 
        ref={containerRef}
        className="relative group/edit overflow-hidden rounded-2xl bg-white/5 border border-white/5 transition-[height] duration-200"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Сегодня была отличная тренировка, чувствую прилив сил, надо пить больше воды вечером."
          className="absolute top-0 left-0 w-[114.28%] p-5 text-[16px] font-medium leading-relaxed text-white placeholder:text-white/30 bg-transparent outline-none focus:bg-white/[0.02] transition-all resize-none scrollbar-hide origin-top-left scale-[0.875]"
        />
        {!value && (
          <Edit3 className="absolute bottom-3 right-3 w-3 h-3 md:w-3.5 md:h-3.5 text-white/10 group-focus-within/edit:text-orange-400 transition-colors pointer-events-none" />
        )}
      </div>
    </div>
  )
}

