'use server'

import { createClient } from "@/lib/supabase/server"
import { Article } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function getAdminArticles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching admin articles:", error)
    return { data: [], error }
  }

  return { data: data as Article[], error: null }
}

export async function updateArticle(id: string, patch: Partial<Article>) {
  const supabase = await createClient()
  
  // Если включаем is_new, выключаем is_updated и наоборот
  if (patch.is_new) patch.is_updated = false
  if (patch.is_updated) patch.is_new = false

  const { data, error } = await supabase
    .from("articles")
    .update(patch)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating article:", error)
    return { data: null, error }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/dashboard/health-tracker')
  return { data, error: null }
}

export async function reorderArticles(updates: { id: string, sort_order: number }[]) {
  const supabase = await createClient()
  
  // Supabase doesn't support bulk update with different values easily in one call via JS SDK
  // but we can use a loop or a RPC. For small number of articles, loop is fine.
  const promises = updates.map(update => 
    supabase
      .from("articles")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id)
  )

  const results = await Promise.all(promises)
  const firstError = results.find(r => r.error)?.error

  if (firstError) {
    console.error("Error reordering articles:", firstError)
    return { success: false, error: firstError }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/dashboard/health-tracker')
  return { success: true, error: null }
}

export async function getArticleStats() {
  const supabase = await createClient()
  
  // Проверяем наличие таблицы и данных
  const { data, error } = await supabase
    .from("articles")
    .select("display_status, is_new, is_updated, view_count")

  if (error) {
    console.error("Error fetching article stats:", JSON.stringify(error, null, 2))
    return { 
      data: {
        total: 0,
        visible: 0,
        adminsOnly: 0,
        hidden: 0,
        isNew: 0,
        isUpdated: 0,
        totalViews: 0
      }, 
      error 
    }
  }

  if (!data) {
    return { 
      data: {
        total: 0,
        visible: 0,
        adminsOnly: 0,
        hidden: 0,
        isNew: 0,
        isUpdated: 0,
        totalViews: 0
      }, 
      error: null 
    }
  }

  const stats = {
    total: data.length,
    visible: data.filter(a => a.display_status === 'all').length,
    adminsOnly: data.filter(a => a.display_status === 'admins_only').length,
    hidden: data.filter(a => a.display_status === 'hidden').length,
    isNew: data.filter(a => a.is_new).length,
    isUpdated: data.filter(a => a.is_updated).length,
    totalViews: data.reduce((acc, a) => acc + (a.view_count || 0), 0)
  }

  return { data: stats, error: null }
}

export async function incrementArticleView(articleId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_article_view', {
    article_id: articleId
  })

  if (error) {
    console.error("Error incrementing article view:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

export async function bulkUpdateArticles(articleIds: string[], patch: Partial<Article>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("articles")
    .update(patch)
    .in('id', articleIds)

  if (error) {
    console.error("Error bulk updating articles:", error)
    return { success: false, error }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/dashboard/health-tracker')
  return { success: true, error: null }
}
