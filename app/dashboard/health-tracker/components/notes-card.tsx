'use client'

import { motion } from 'framer-motion'
import { FileText, Edit3 } from 'lucide-react'

interface NotesCardProps {
  value: string
  onUpdate: (val: string) => void
}

export function NotesCard({ value, onUpdate }: NotesCardProps) {
  return (
    <motion.div 
      layout="position"
      className="rounded-[2.5rem] border border-white/5 bg-[#121214]/40 backdrop-blur-xl p-5 md:p-6 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
        </div>
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Заметки</h3>
      </div>
      
      <div className="relative group/edit">
        <textarea
          value={value}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Как прошел твой день?"
          className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] md:text-xs text-white/60 outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all resize-none scrollbar-hide"
        />
        <Edit3 className="absolute bottom-4 right-4 w-3 h-3 md:w-3.5 md:h-3.5 text-white/10 group-focus-within/edit:text-blue-400 transition-colors" />
      </div>
    </motion.div>
  )
}

