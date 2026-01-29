'use client'

import { useState, useMemo } from 'react'
import { Search, Info, X, BookOpen, Dumbbell, Timer, Repeat, Zap, Edit2, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Exercise {
  id: string
  name: string
  description: string | null
  category: string | null
  target_muscles: string[] | null
  default_sets: number | null
  default_reps: string | null
  default_rest_seconds: number | null
  technique_steps: string | null
  typical_mistakes: string | null
  video_script: string | null
  inventory: string | null
  inventory_alternative: string | null
  light_version: string | null
}

export default function ExerciseLibraryContent({ exercises }: { exercises: Exercise[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Exercise>>({})
  const [isSaving, setIsSaving] = useState(false)

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsEditing(false)
    // Открываем диалог только если ширина экрана меньше 1024px (lg)
    if (window.innerWidth < 1024) {
      setIsMobileDialogOpen(true)
    }
  }

  const handleStartEdit = () => {
    if (!selectedExercise) return
    setFormData({ ...selectedExercise })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedExercise || !formData.name) return
    setIsSaving(true)
    
    try {
      const { updateExerciseLibrary } = await import('@/lib/actions/exercise-library')
      const result = await updateExerciseLibrary(selectedExercise.id, formData)
      
      if (result.success) {
        // Обновляем локальное состояние (в реальном приложении лучше через router.refresh() или react-query)
        setSelectedExercise({ ...selectedExercise, ...formData } as Exercise)
        setIsEditing(false)
      } else {
        alert('Ошибка при сохранении: ' + result.error)
      }
    } catch (err) {
      console.error(err)
      alert('Произошла ошибка')
    } finally {
      setIsSaving(false)
    }
  }

  const categories = useMemo(() => {
    const cats: Record<string, Exercise[]> = {}
    exercises.forEach(ex => {
      const cat = ex.category || 'Другое'
      if (!cats[cat]) cats[cat] = []
      cats[cat].push(ex)
    })
    return cats
  }, [exercises])

  const filteredCategories = useMemo(() => {
    const filtered: Record<string, Exercise[]> = {}
    const query = searchQuery.toLowerCase()

    Object.entries(categories).forEach(([cat, items]) => {
      const matchingItems = items.filter(
        ex => 
          ex.name.toLowerCase().includes(query) || 
          ex.id.toLowerCase().includes(query) ||
          (ex.target_muscles?.some(m => m.toLowerCase().includes(query)))
      )
      if (matchingItems.length > 0) {
        filtered[cat] = matchingItems
      }
    })
    return filtered
  }, [categories, searchQuery])

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-250px)]">
      {/* Left Column: List */}
      <div className="w-full lg:w-2/5 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/20" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          {Object.entries(filteredCategories).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleExerciseClick(exercise)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border ${
                      selectedExercise?.id === exercise.id 
                        ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/30' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    <span className={`text-[9px] font-bold font-mono shrink-0 ${
                      selectedExercise?.id === exercise.id ? 'text-purple-400' : 'text-white/20'
                    }`}>
                      {exercise.id}
                    </span>
                    <span className={`text-xs font-medium transition-colors line-clamp-1 ${
                      selectedExercise?.id === exercise.id ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                    }`}>
                      {exercise.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="hidden lg:block flex-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden relative">
        {selectedExercise ? (
          <div className="h-full overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30 font-mono text-xs px-3 py-1">
                    {selectedExercise.id}
                  </Badge>
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                    {selectedExercise.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                      >
                        <X className="size-4" />
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        <Save className="size-4" />
                        {isSaving ? '...' : 'Сохранить'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
                    >
                      <Edit2 className="size-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Редактировать</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-3xl font-bold font-oswald uppercase tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <h2 className="text-4xl font-bold font-oswald uppercase tracking-tight text-white">
                  {selectedExercise.name}
                </h2>
              )}
              
              <div className="flex flex-wrap gap-4">
                {selectedExercise.target_muscles && selectedExercise.target_muscles.map(muscle => (
                  <Badge key={muscle} className="bg-white/5 hover:bg-white/10 text-white/40 border-none text-[10px] uppercase tracking-wider">
                    {muscle}
                  </Badge>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/20">
                    <Dumbbell className="size-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Подходы</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.default_sets || ''}
                      onChange={(e) => setFormData({ ...formData, default_sets: parseInt(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold font-oswald w-20"
                    />
                  ) : (
                    <span className="text-xl font-bold font-oswald text-white">{selectedExercise.default_sets || '—'}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/20">
                    <Repeat className="size-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Повторения</span>
                  </div>
                  {isEditing ? (
                    <input
                      value={formData.default_reps || ''}
                      onChange={(e) => setFormData({ ...formData, default_reps: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold font-oswald w-full"
                    />
                  ) : (
                    <span className="text-xl font-bold font-oswald text-white">{selectedExercise.default_reps || '—'}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/20">
                    <Timer className="size-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Отдых</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.default_rest_seconds || ''}
                      onChange={(e) => setFormData({ ...formData, default_rest_seconds: parseInt(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold font-oswald w-20"
                    />
                  ) : (
                    <span className="text-xl font-bold font-oswald text-white">{selectedExercise.default_rest_seconds ? `${selectedExercise.default_rest_seconds}с` : '—'}</span>
                  )}
                </div>
              </div>

              {/* Inventory & Light Version */}
              {(selectedExercise.inventory || selectedExercise.light_version || isEditing) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedExercise.inventory || isEditing) && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                      <div className="flex items-center gap-2 text-amber-400/50">
                        <Dumbbell className="size-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Инвентарь</span>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            value={formData.inventory || ''}
                            onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                            placeholder="Основной инвентарь"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          />
                          <input
                            value={formData.inventory_alternative || ''}
                            onChange={(e) => setFormData({ ...formData, inventory_alternative: e.target.value })}
                            placeholder="Альтернатива"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/60"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-amber-200/60 font-medium">
                          {selectedExercise.inventory}
                          {selectedExercise.inventory_alternative && (
                            <span className="block text-[10px] text-white/20 mt-1 italic">
                              Альт: {selectedExercise.inventory_alternative}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  {(selectedExercise.light_version || isEditing) && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400/50">
                        <Zap className="size-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Облегченная версия</span>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={formData.light_version || ''}
                          onChange={(e) => setFormData({ ...formData, light_version: e.target.value })}
                          placeholder="Вариант для новичков"
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none"
                        />
                      ) : (
                        <p className="text-xs text-emerald-200/60 font-medium">{selectedExercise.light_version}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400/50">Описание</h4>
                {isEditing ? (
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white/70 leading-relaxed text-lg italic focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                ) : (
                  <p className="text-white/70 leading-relaxed text-lg italic">
                    «{selectedExercise.description}»
                  </p>
                )}
              </div>

              {(selectedExercise.technique_steps || isEditing) && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400/50">Техника выполнения</h4>
                  {isEditing ? (
                    <textarea
                      value={formData.technique_steps || ''}
                      onChange={(e) => setFormData({ ...formData, technique_steps: e.target.value })}
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white/60 leading-relaxed whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    />
                  ) : (
                    <div className="text-white/60 leading-relaxed whitespace-pre-line bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                      {selectedExercise.technique_steps}
                    </div>
                  )}
                </div>
              )}

              {(selectedExercise.typical_mistakes || isEditing) && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/50">Типичные ошибки</h4>
                  {isEditing ? (
                    <textarea
                      value={formData.typical_mistakes || ''}
                      onChange={(e) => setFormData({ ...formData, typical_mistakes: e.target.value })}
                      rows={5}
                      className="w-full bg-red-500/5 border border-red-500/10 rounded-3xl px-6 py-4 text-red-200/60 leading-relaxed whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                    />
                  ) : (
                    <div className="text-red-200/60 leading-relaxed whitespace-pre-line bg-red-500/5 p-6 rounded-3xl border border-red-500/10">
                      {selectedExercise.typical_mistakes}
                    </div>
                  )}
                </div>
              )}

              {(selectedExercise.video_script || isEditing) && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/50">Сценарий для видео (Техническое)</h4>
                  {isEditing ? (
                    <textarea
                      value={formData.video_script || ''}
                      onChange={(e) => setFormData({ ...formData, video_script: e.target.value })}
                      rows={8}
                      className="w-full bg-blue-500/5 border border-blue-500/10 rounded-3xl px-6 py-4 text-blue-200/60 leading-relaxed whitespace-pre-line font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                  ) : (
                    <div className="text-blue-200/60 leading-relaxed whitespace-pre-line bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 font-mono text-sm">
                      {selectedExercise.video_script}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
              <BookOpen className="size-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white/20 font-oswald uppercase">Выберите упражнение</h3>
              <p className="text-white/10 max-w-xs mx-auto text-sm">
                Нажмите на упражнение слева, чтобы увидеть подробную технику, ошибки и сценарий для видео.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Dialog (Fallback) */}
      <div className="block lg:hidden">
        {/* Попап для мобильных устройств оставляем, так как там нет места для двух колонок */}
        <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
          <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto">
            {/* Same content as desktop preview but simplified for mobile if needed */}
            {selectedExercise && (
              <div className="space-y-8 py-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30 font-mono">
                    {selectedExercise.id}
                  </Badge>
                  <DialogTitle className="text-2xl font-bold font-oswald uppercase tracking-tight">
                    {selectedExercise.name}
                  </DialogTitle>
                </div>
                
                <div className="space-y-6">
                  <p className="text-white/70 italic">«{selectedExercise.description}»</p>
                  
                  {selectedExercise.technique_steps && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400/50">Техника</h4>
                      <div className="text-white/60 text-sm whitespace-pre-line">{selectedExercise.technique_steps}</div>
                    </div>
                  )}

                  {selectedExercise.video_script && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-400/50">Сценарий</h4>
                      <div className="text-blue-200/60 text-sm font-mono whitespace-pre-line bg-blue-500/5 p-4 rounded-xl">{selectedExercise.video_script}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
