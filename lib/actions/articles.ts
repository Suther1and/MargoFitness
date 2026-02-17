import { createClient } from "@/lib/supabase/client";
import { Article } from "@/types/database";

export async function getArticles(): Promise<Article[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

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
    .from("user_article_progress")
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
    .from("user_article_progress")
    .select("is_read")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .single();

  if (error || !data) return false;

  return data.is_read;
}
