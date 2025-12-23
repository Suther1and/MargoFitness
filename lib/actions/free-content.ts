"use server"

import { createClient } from "@/lib/supabase/server"

export interface FreeContent {
  id: string
  title: string
  description: string | null
  content: string
  video_url: string | null
  is_published: boolean
  order_index: number
  created_at: string
  updated_at: string
}

/**
 * Получить все опубликованные бесплатные материалы
 */
export async function getPublishedFreeContent(): Promise<{ data: FreeContent[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("free_content")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching free content:", error)
      return { data: null, error: error.message }
    }

    return { data: data as FreeContent[], error: null }
  } catch (error) {
    console.error("Unexpected error fetching free content:", error)
    return { data: null, error: "Не удалось загрузить бесплатные материалы" }
  }
}

/**
 * Получить конкретный бесплатный материал по ID
 */
export async function getFreeContentById(id: string): Promise<{ data: FreeContent | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("free_content")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single()

    if (error) {
      console.error("Error fetching free content:", error)
      return { data: null, error: error.message }
    }

    return { data: data as FreeContent, error: null }
  } catch (error) {
    console.error("Unexpected error fetching free content:", error)
    return { data: null, error: "Не удалось загрузить материал" }
  }
}

// ===================
// ADMIN ACTIONS
// ===================

/**
 * Получить все бесплатные материалы (включая неопубликованные) - только для админа
 */
export async function getAllFreeContent(): Promise<{ data: FreeContent[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("free_content")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching all free content:", error)
      return { data: null, error: error.message }
    }

    return { data: data as FreeContent[], error: null }
  } catch (error) {
    console.error("Unexpected error fetching all free content:", error)
    return { data: null, error: "Не удалось загрузить материалы" }
  }
}

/**
 * Создать новый бесплатный материал
 */
export async function createFreeContent(input: {
  title: string
  description?: string
  content: string
  video_url?: string
  order_index?: number
}): Promise<{ data: FreeContent | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("free_content")
      .insert({
        title: input.title,
        description: input.description || null,
        content: input.content,
        video_url: input.video_url || null,
        order_index: input.order_index || 0,
        is_published: false
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating free content:", error)
      return { data: null, error: error.message }
    }

    return { data: data as FreeContent, error: null }
  } catch (error) {
    console.error("Unexpected error creating free content:", error)
    return { data: null, error: "Не удалось создать материал" }
  }
}

/**
 * Обновить бесплатный материал
 */
export async function updateFreeContent(
  id: string,
  input: {
    title?: string
    description?: string
    content?: string
    video_url?: string
    order_index?: number
  }
): Promise<{ data: FreeContent | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("free_content")
      .update(input)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating free content:", error)
      return { data: null, error: error.message }
    }

    return { data: data as FreeContent, error: null }
  } catch (error) {
    console.error("Unexpected error updating free content:", error)
    return { data: null, error: "Не удалось обновить материал" }
  }
}

/**
 * Переключить статус публикации
 */
export async function toggleFreeContentPublishedStatus(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Получаем текущий статус
    const { data: current, error: fetchError } = await supabase
      .from("free_content")
      .select("is_published")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Переключаем статус
    const { error: updateError } = await supabase
      .from("free_content")
      .update({ is_published: !current.is_published })
      .eq("id", id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error toggling free content status:", error)
    return { success: false, error: "Не удалось изменить статус" }
  }
}

/**
 * Удалить бесплатный материал
 */
export async function deleteFreeContent(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("free_content")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting free content:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error deleting free content:", error)
    return { success: false, error: "Не удалось удалить материал" }
  }
}

