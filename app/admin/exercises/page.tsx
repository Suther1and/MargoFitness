import { getCurrentProfile } from "@/lib/actions/profile"
import { getExerciseLibrary } from "@/lib/actions/exercise-library"
import { redirect } from "next/navigation"
import { ArrowLeft, BookOpen, Search } from "lucide-react"
import Link from "next/link"
import ExerciseLibraryContent from "./exercise-library-content"

export default async function AdminExercisesPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const exercises = await getExerciseLibrary()

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
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
            Библиотека упражнений
          </h1>
          <p className="mt-2 text-white/60">
            Просмотр и управление базой упражнений MargoFitness
          </p>
        </div>
      </div>

      <ExerciseLibraryContent exercises={exercises} />
    </div>
  )
}
