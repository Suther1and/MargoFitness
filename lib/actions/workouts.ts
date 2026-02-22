import { createClient } from "@/lib/supabase/client";

export async function getWorkoutsData(userId: string) {
  const supabase = createClient();

  // Все три запроса параллельно
  const [weeksResult, completionsResult, profileResult] = await Promise.all([
    supabase
      .from("content_weeks")
      .select(`
        *,
        sessions:workout_sessions(
          *,
          exercises:workout_exercises(
            *,
            exercise_library(*)
          )
        )
      `)
      .eq("is_published", true)
      .order("start_date", { ascending: false }),
    supabase
      .from("user_workout_completions")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single(),
  ]);

  // Demo-сессии — только если нужны (free tier или профиль не загрузился)
  const tier = profileResult.data?.subscription_tier;
  let demoSessions: any[] = [];
  if (tier === "free" || !tier) {
    const { data } = await supabase
      .from("workout_sessions")
      .select(`
        *,
        exercises:workout_exercises(
          *,
          exercise_library(*)
        )
      `)
      .eq("is_demo", true)
      .limit(1);
    demoSessions = data || [];
  }

  return {
    weeks: weeksResult.data || [],
    completions: completionsResult.data || [],
    profile: profileResult.data || null,
    demoSessions,
  };
}
