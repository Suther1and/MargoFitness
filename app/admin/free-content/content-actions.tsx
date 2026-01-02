"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreVertical, Edit, Trash2, Eye, EyeOff, X, Type, FileText, Play, ListOrdered } from "lucide-react"
import { deleteFreeContent, toggleFreeContentPublishedStatus, updateFreeContent } from "@/lib/actions/free-content"
import type { FreeContent } from "@/lib/actions/free-content"

export default function FreeContentActions({ content }: { content: FreeContent }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: content.title,
    description: content.description || "",
    content: content.content,
    video_url: content.video_url || "",
    order_index: content.order_index,
  })

  const handleTogglePublish = async () => {
    setLoading(true)
    const { success, error } = await toggleFreeContentPublishedStatus(content.id)
    setLoading(false)

    if (!success && error) {
      alert(`Ошибка: ${error}`)
      return
    }

    router.refresh()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await updateFreeContent(content.id, {
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

    setEditOpen(false)
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setLoading(true)
    const { success, error } = await deleteFreeContent(content.id)
    setLoading(false)

    if (!success && error) {
      setError(error)
      return
    }

    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePublish}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
            content.is_published 
              ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {content.is_published ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          <span className="hidden sm:inline">{content.is_published ? 'Снять' : 'Опубликовать'}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95">
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white p-2 min-w-[180px]">
            <DropdownMenuItem onClick={() => setEditOpen(true)} className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-colors">
              <Edit className="size-4 text-blue-400" />
              <span className="text-sm font-medium">Редактировать</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-rose-500/10 focus:bg-rose-500/10 transition-colors text-rose-400">
              <Trash2 className="size-4" />
              <span className="text-sm font-medium">Удалить</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl p-0 border-0 bg-transparent overflow-visible shadow-none">
          <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
            <button
              onClick={() => setEditOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
            >
              <X className="size-5 text-white/40" />
            </button>

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            
            <DialogHeader className="relative z-10 mb-8 text-left">
              <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Редактировать материал</DialogTitle>
              <DialogDescription className="text-white/50">Внесите изменения в обучающий контент</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEdit} className="relative z-10 space-y-6">
              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <Type className="size-3 text-blue-400" />
                    Название *
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <FileText className="size-3 text-blue-400" />
                    Краткое описание
                  </label>
                  <input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                    <FileText className="size-3 text-blue-400" />
                    Полный контент *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[200px] resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Play className="size-3 text-purple-400" />
                      Kinescope ID
                    </label>
                    <input
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      disabled={loading}
                      placeholder="abc123xyz"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                      <ListOrdered className="size-3 text-emerald-400" />
                      Порядок
                    </label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      min="0"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none">
          <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent pointer-events-none" />
            
            <DialogHeader className="relative z-10 mb-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 flex items-center justify-center mb-6">
                <Trash2 className="size-8 text-rose-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Удалить материал?</DialogTitle>
              <DialogDescription className="text-white/50 pt-2">
                Вы уверены, что хотите удалить &quot;{content.title}&quot;? Это действие нельзя будет отменить.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="relative z-10 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 mb-6 text-center">
                {error}
              </div>
            )}

            <div className="relative z-10 flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
              >
                Отмена
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-500/20"
              >
                {loading ? "..." : "Удалить"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
