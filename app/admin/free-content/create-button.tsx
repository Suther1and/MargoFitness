"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, X, Type, FileText, Play, ListOrdered } from "lucide-react"
import { createFreeContent } from "@/lib/actions/free-content"

export default function CreateFreeContentButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    video_url: "",
    order_index: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Название и контент обязательны")
      setLoading(false)
      return
    }

    const { error } = await createFreeContent({
      title: formData.title,
      description: formData.description || undefined,
      content: formData.content,
      video_url: formData.video_url || undefined,
      order_index: formData.order_index,
    })

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    setFormData({
      title: "",
      description: "",
      content: "",
      video_url: "",
      order_index: 0,
    })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95">
          <Plus className="size-4" />
          Создать материал
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl p-0 border-0 bg-transparent overflow-visible shadow-none">
        <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          >
            <X className="size-5 text-white/40" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          
          <DialogHeader className="relative z-10 mb-8 text-left">
            <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Новый материал</DialogTitle>
            <DialogDescription className="text-white/50">Добавьте полезный контент для пользователей</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <Type className="size-3 text-emerald-400" />
                  Название *
                </label>
                <input
                  placeholder="Основы правильной техники"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <FileText className="size-3 text-emerald-400" />
                  Краткое описание
                </label>
                <input
                  placeholder="Базовые принципы выполнения упражнений"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                  <FileText className="size-3 text-emerald-400" />
                  Полный контент *
                </label>
                <textarea
                  placeholder="Расскажите подробнее о материале..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[200px] resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <Play className="size-3 text-purple-400" />
                    Kinescope ID
                  </label>
                  <input
                    placeholder="abc123xyz"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <ListOrdered className="size-3 text-amber-400" />
                    Порядок
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    min="0"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                {loading ? "Создание..." : "Создать материал"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
