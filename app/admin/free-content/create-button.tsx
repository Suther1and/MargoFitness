"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
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

    const { data, error } = await createFreeContent({
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

    // Reset form
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
        <Button>
          <Plus className="mr-2 size-4" />
          Создать материал
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать бесплатный материал</DialogTitle>
          <DialogDescription>
            Добавьте новый обучающий материал для зарегистрированных пользователей
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Основы правильной техники"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Краткое описание</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Базовые принципы выполнения упражнений"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Контент *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Полный текст материала..."
              rows={8}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Можно использовать переносы строк для форматирования
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">URL видео (Kinescope ID)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="abc123xyz"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Пока не используется. Будет интегрирован позже.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Порядок отображения</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              min="0"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Материалы сортируются по возрастанию (0, 1, 2, ...)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

