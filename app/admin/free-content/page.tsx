import { getAllFreeContent } from "@/lib/actions/free-content"
import { ArrowLeft, BookOpen, Clock, Play, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"
import CreateFreeContentButton from "./create-button"
import FreeContentActions from "./content-actions"

export default async function AdminFreeContentPage() {
  const { data: contents, error } = await getAllFreeContent()

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            <span>Назад в панель</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
              Бесплатные материалы
            </h1>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/30">
              Free
            </span>
          </div>
          <p className="text-white/60">
            Обучающий контент, доступный всем зарегистрированным пользователям
          </p>
        </div>
        <CreateFreeContentButton />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-[2rem] bg-rose-500/10 border border-rose-500/20 p-8 text-center">
          <p className="text-rose-400 font-medium">{error}</p>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Библиотека материалов</h2>
        </div>

        {contents && contents.length > 0 ? (
          <div className="grid gap-6">
            {contents.map((content) => (
              <section 
                key={content.id} 
                className={`group relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:ring-white/20 ${!content.is_published ? 'opacity-80' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${content.is_published ? 'from-emerald-500/5' : 'from-orange-500/5'} via-transparent to-transparent pointer-events-none`} />
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                          <Clock className="size-3" />
                          {new Date(content.created_at).toLocaleDateString('ru-RU')}
                        </div>
                        {content.is_published ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-emerald-500/30">
                            Опубликовано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-orange-500/30">
                            Черновик
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-white/20 uppercase">Порядок: {content.order_index}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white font-oswald uppercase tracking-tight mb-2 group-hover:text-emerald-300 transition-colors truncate">
                          {content.title}
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed max-w-3xl line-clamp-2">
                          {content.description || 'Описание отсутствует для этого материала'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {content.video_url && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
                            <Play className="size-3" fill="currentColor" />
                            Видео доступно
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                          <FileText className="size-3" />
                          {content.content.length} симв.
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      <FreeContentActions content={content} />
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="p-6 rounded-full bg-white/5 ring-1 ring-white/10">
                <BookOpen className="size-12 text-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Материалов нет</h3>
                <p className="text-white/40 max-w-sm mx-auto">Создайте первый бесплатный материал, чтобы порадовать новых пользователей платформы.</p>
              </div>
              <CreateFreeContentButton />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
