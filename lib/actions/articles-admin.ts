import { createClient } from "@/lib/supabase/client";
import { Article, ArticleInsert, ArticleUpdate } from "@/types/database";

export async function getAllArticlesAdmin(): Promise<Article[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles for admin:", error);
    return [];
  }

  return data as Article[];
}

export async function upsertArticle(article: ArticleInsert | ArticleUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .upsert(article as any)
    .select()
    .single();

  if (error) {
    console.error("Error upserting article:", error);
    return { success: false, error };
  }

  return { success: true, data: data as Article };
}

export async function deleteArticle(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting article:", error);
    return { success: false, error };
  }

  return { success: true };
}
