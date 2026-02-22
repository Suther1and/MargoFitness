import { createClient } from "@/lib/supabase/client";
import { Article } from "@/types/database";

export async function getArticles(): Promise<Article[]> {
  const supabase = createClient();
  
  // Получаем текущего пользователя через auth.getUser()
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRole = 'user';
  
  if (user) {
    // Получаем роль из таблицы profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile?.role === 'admin') {
      userRole = 'admin';
    }
  }
  
  // Формируем запрос
  let query = supabase.from("articles").select("*");
  
  if (userRole === 'admin') {
    // Админы видят все, кроме hidden
    query = query.neq("display_status", "hidden");
  } else {
    // Обычные пользователи видят только 'all'
    query = query.eq("display_status", "all");
  }

  // Сортировка по sort_order
  const { data, error } = await query
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  // ВАЖНО: Если мы под обычным пользователем, и база вернула 0 статей (хотя они там есть),
  // это может быть из-за RLS политик. Но мы пока просто возвращаем данные.
  return data as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching article:", error);
    return null;
  }

  return data as Article;
}

export async function markArticleAsRead(articleId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const { data, error } = await supabase
    .from("user_article_progress" as any)
    .upsert({
      user_id: user.id,
      article_id: articleId,
      is_read: true,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,article_id'
    });

  if (error) {
    console.error("Error marking article as read:", error);
    return { error };
  }

  return { success: true };
}

export async function getArticleReadStatus(articleId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("user_article_progress" as any)
    .select("is_read")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .single() as { data: { is_read: boolean } | null, error: any };

  if (error || !data) return false;

  return data.is_read;
}
