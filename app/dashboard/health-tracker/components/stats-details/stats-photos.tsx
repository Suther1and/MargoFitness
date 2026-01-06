"use client"

import { motion } from "framer-motion"
import { Camera, Scale, TrendingDown, Calendar } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface StatsPhotosProps {
  period: string
}

const PHOTOS_DATA = [
  { id: "1", date: "06 Янв 2026", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", weight: 71.2 },
  { id: "2", date: "04 Янв 2026", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=400&fit=crop", weight: 71.4 },
  { id: "3", date: "02 Янв 2026", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", weight: 71.6 },
  { id: "4", date: "31 Дек 2025", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=400&fit=crop", weight: 71.9 },
  { id: "5", date: "29 Дек 2025", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", weight: 72.1 },
  { id: "6", date: "27 Дек 2025", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=400&fit=crop", weight: 72.4 },
]

export function StatsPhotos({ period }: StatsPhotosProps) {
  const firstPhoto = PHOTOS_DATA[PHOTOS_DATA.length - 1]
  const lastPhoto = PHOTOS_DATA[0]
  const weightChange = lastPhoto.weight - firstPhoto.weight

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Статистика изменений */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-pink-500/20 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Camera className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Прогресс</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-white/60 font-medium mb-1">Всего фото</div>
            <div className="text-3xl font-black text-white">{PHOTOS_DATA.length}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 font-medium mb-1">Первое</div>
            <div className="text-xl font-black text-white tabular-nums">{firstPhoto.weight} кг</div>
          </div>
          <div>
            <div className="text-sm text-white/60 font-medium mb-1">Последнее</div>
            <div className="text-xl font-black text-white tabular-nums">{lastPhoto.weight} кг</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center justify-between">
          <span className="text-sm text-white/70 font-medium">Изменение веса</span>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-lg font-black text-emerald-400 tabular-nums">
              {weightChange.toFixed(1)} кг
            </span>
          </div>
        </div>
      </motion.div>

      {/* Галерея фото */}
      <div className="grid grid-cols-2 gap-3">
        {PHOTOS_DATA.map((photo, index) => (
          <motion.div
            key={photo.id}
            variants={item}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5 group cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <Image
              src={photo.url}
              alt={`Progress ${photo.date}`}
              fill
              className="object-cover"
            />
            
            {/* Градиент overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Информация */}
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-white/60 uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                {photo.date}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="text-xl font-black text-white tabular-nums">
                    {photo.weight} <span className="text-sm text-white/40">кг</span>
                  </span>
                </div>
                {index < PHOTOS_DATA.length - 1 && (
                  <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="text-xs font-black text-emerald-400 tabular-nums">
                      {(photo.weight - PHOTOS_DATA[PHOTOS_DATA.length - 1].weight).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="scale-0 group-hover:scale-100 transition-transform text-white text-sm font-bold">
                Открыть
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Временная линия */}
      <motion.div variants={item} className="p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Динамика веса</span>
        </div>

        <div className="space-y-2">
          {PHOTOS_DATA.slice().reverse().map((photo, index) => (
            <div key={photo.id} className="flex items-center gap-3">
              <div className="w-12 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                <Image src={photo.url} alt="" width={48} height={64} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/60 font-medium">{photo.date}</div>
                <div className="text-sm font-black text-white tabular-nums">{photo.weight} кг</div>
              </div>
              {index > 0 && (
                <div className={cn(
                  "text-xs font-bold tabular-nums",
                  photo.weight - PHOTOS_DATA[PHOTOS_DATA.length - index - 1].weight < 0 ? "text-emerald-400" : "text-amber-400"
                )}>
                  {(photo.weight - PHOTOS_DATA[PHOTOS_DATA.length - index - 1].weight).toFixed(1)} кг
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

