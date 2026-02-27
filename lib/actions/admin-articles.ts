'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Article } from "@/types/database"
import { revalidatePath } from "next/cache"

export type ArticleWithStats = Article & { read_count: number }

export async function getAdminArticles() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const [articlesResult, readsResult] = await Promise.all([
    supabase.from("articles").select("*").order("sort_order", { ascending: true }),
    adminSupabase.from("user_article_progress" as any).select("article_id").eq("is_read", true)
  ])

  if (articlesResult.error) {
    console.error("Error fetching admin articles:", articlesResult.error)
    return { data: [] as ArticleWithStats[], error: articlesResult.error }
  }

  const reads = (readsResult.data ?? []) as unknown as { article_id: string }[]

  // article_id in user_article_progress can be UUID or slug — match both
  const readCounts = reads.reduce<Record<string, number>>((acc, r) => {
    acc[r.article_id] = (acc[r.article_id] || 0) + 1
    return acc
  }, {})

  const articles = (articlesResult.data as Article[]).map(a => ({
    ...a,
    read_count: (readCounts[a.id] || 0) + (readCounts[a.slug] || 0)
  }))

  return { data: articles as ArticleWithStats[], error: null }
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

const EMPTY_STATS = {
  total: 0,
  visible: 0,
  adminsOnly: 0,
  hidden: 0,
  isNew: 0,
  isUpdated: 0,
  totalViews: 0,
  totalUniqueViews: 0,
  totalReads: 0,
  freeCount: 0,
  basicCount: 0,
  proCount: 0,
  eliteCount: 0
}

export async function getArticleStats() {
  // Используем adminSupabase, так как unstable_cache не поддерживает cookies() внутри (которые есть в обычном createClient)
  const adminSupabase = createAdminClient()

  const [articlesResult, readsResult] = await Promise.all([
    adminSupabase.from("articles").select("display_status, is_new, is_updated, view_count, unique_view_count, access_level"),
    adminSupabase.from("user_article_progress" as any).select("article_id", { count: "exact", head: true }).eq("is_read", true)
  ])

  if (articlesResult.error) {
    console.error("Error fetching article stats:", JSON.stringify(articlesResult.error, null, 2))
    return { data: EMPTY_STATS, error: articlesResult.error }
  }

  const data = articlesResult.data ?? []

  const stats = {
    total: data.length,
    visible: data.filter(a => a.display_status === 'all').length,
    adminsOnly: data.filter(a => a.display_status === 'admins_only').length,
    hidden: data.filter(a => a.display_status === 'hidden').length,
    isNew: data.filter(a => a.is_new).length,
    isUpdated: data.filter(a => a.is_updated).length,
    totalViews: data.reduce((acc, a) => acc + (a.view_count || 0), 0),
    totalUniqueViews: data.reduce((acc, a) => acc + (a.unique_view_count || 0), 0),
    totalReads: readsResult.count ?? 0,
    freeCount: data.filter(a => a.access_level === 'free').length,
    basicCount: data.filter(a => a.access_level === 'basic').length,
    proCount: data.filter(a => a.access_level === 'pro').length,
    eliteCount: data.filter(a => a.access_level === 'elite').length
  }

  return { data: stats, error: null }
}

// Кэшированная версия для публичного использования (5 минут)
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export const getCachedArticleStats = unstable_cache(
  async () => {
    return getArticleStats()
  },
  ['article-stats'],
  { revalidate: 300, tags: ['articles'] }
)

export async function incrementArticleViewBySlug(slug: string) {
  const supabase = await createClient()

  const [{ data: article }, { data: { user } }] = await Promise.all([
    supabase.from('articles').select('id').eq('slug', slug).single(),
    supabase.auth.getUser()
  ])

  if (!article?.id) return { success: false }

  const { error } = await (supabase as any).rpc('increment_article_view', {
    p_article_id: article.id,
    p_user_id: user?.id ?? null
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
