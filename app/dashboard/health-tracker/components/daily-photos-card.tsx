'use client'

import { motion } from 'framer-motion'
import { Camera, Plus } from 'lucide-react'

interface DailyPhotosCardProps {
  photos: string[]
}

export function DailyPhotosCard({ photos }: DailyPhotosCardProps) {
  return (
    <motion.div 
      layout="position"
      className="rounded-[2.5rem] border border-white/5 bg-[#121214]/40 backdrop-blur-xl p-5 md:p-6 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-400" />
          </div>
          <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Фото прогресса</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/5">
            <img src={url} alt={`Progress ${i}`} className="w-full h-full object-cover" />
          </div>
        ))}
        <button className="aspect-square rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 hover:border-white/20 transition-all group">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/20 group-hover:text-white/40" />
          <span className="text-[7px] md:text-[8px] font-black text-white/10 uppercase group-hover:text-white/20">Добавить</span>
        </button>
      </div>
    </motion.div>
  )
}

