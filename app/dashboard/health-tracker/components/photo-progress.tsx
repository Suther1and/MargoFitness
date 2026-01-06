"use client"

import Image from "next/image"
import { Camera, ArrowRight, Scale } from "lucide-react"
import { motion } from "framer-motion"

interface PhotoEntry {
  id: string
  date: string
  url: string
  weight: number
}

interface PhotoProgressProps {
  photos: PhotoEntry[]
}

export function PhotoProgress({ photos }: PhotoProgressProps) {
  if (photos.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Прогресс в фото</h3>
        </div>
        <button className="flex items-center gap-1 text-[9px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest group">
          Все
          <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 px-1 no-scrollbar">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 group"
          >
            <div className="relative w-32 h-44 rounded-2xl overflow-hidden border border-white/5 bg-white/5">
              <Image
                src={photo.url}
                alt={`Progress ${photo.date}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">
                  {photo.date}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white tabular-nums">
                    {photo.weight} <span className="text-[9px] text-white/40">кг</span>
                  </span>
                </div>
              </div>

              {index > 0 && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/20 backdrop-blur-md">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">
                    { (photo.weight - photos[0].weight) > 0 ? "+" : "" }{ (photo.weight - photos[0].weight).toFixed(1) }
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

