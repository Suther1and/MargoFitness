import { createClient } from "@/lib/supabase/server";

export async function getAllArticlesAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles for admin:", error);
    return [];
  }

  return data;
}

export async function upsertArticle(article: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .upsert(article)
    .select()
    .single();

  if (error) {
    console.error("Error upserting article:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
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
