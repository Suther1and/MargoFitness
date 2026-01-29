'use client'

import { useState } from 'react'
import { FileText, Import, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { importWorkoutsFromMarkdown } from '@/lib/actions/import-actions'
import { useRouter } from 'next/navigation'

export default function SmartImportButton({ weekId }: { weekId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const router = useRouter()

  const handleImport = async () => {
    if (!markdown.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const res = await importWorkoutsFromMarkdown(weekId, markdown)
      if (res.success) {
        setResult({ success: true, message: `Успешно импортировано тренировок: ${res.count}` })
        setMarkdown('')
        setTimeout(() => {
          setIsOpen(false)
          setResult(null)
          router.refresh()
        }, 2000)
      } else {
        setResult({ success: false, message: res.error || 'Ошибка при импорте' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Произошла непредвиденная ошибка' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95">
          <Import className="size-4 text-purple-400" />
          Умный импорт (MD)
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-3xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-oswald uppercase tracking-tight flex items-center gap-3">
            <FileText className="size-6 text-purple-400" />
            Импорт тренировок из Markdown
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <p className="text-sm text-white/40 leading-relaxed">
              Вставьте текст тренировочного плана из файла истории (например, <code className="text-purple-300">week-17-23-feb-2026.md</code>). 
              Система автоматически распознает упражнения по их ID и создаст структуру тренировок.
            </p>
          </div>

          <div className="relative">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Вставьте Markdown текст здесь..."
              className="w-full h-80 p-6 rounded-3xl bg-white/[0.02] border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm resize-none custom-scrollbar"
            />
          </div>

          {result && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
              result.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {result.success ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
              <span className="text-sm font-medium">{result.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all"
            >
              Отмена
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading || !markdown.trim()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Импортирую...
                </>
              ) : (
                <>
                  <Import className="size-4" />
                  Начать импорт
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
