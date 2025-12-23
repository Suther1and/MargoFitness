export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          role: 'user' | 'admin'
          subscription_status: 'active' | 'inactive' | 'canceled'
          subscription_tier: Database['public']['Enums']['subscription_tier']
          subscription_expires_at: string | null
          payment_method_info: Json | null
          stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          role?: 'user' | 'admin'
          subscription_status?: 'active' | 'inactive' | 'canceled'
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          subscription_expires_at?: string | null
          payment_method_info?: Json | null
          stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          role?: 'user' | 'admin'
          subscription_status?: 'active' | 'inactive' | 'canceled'
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          subscription_expires_at?: string | null
          payment_method_info?: Json | null
          stats?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          type: 'subscription_tier' | 'one_time_pack'
          name: string
          description: string | null
          price: number
          tier_level: number | null
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'subscription_tier' | 'one_time_pack'
          name: string
          description?: string | null
          price: number
          tier_level?: number | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'subscription_tier' | 'one_time_pack'
          name?: string
          description?: string | null
          price?: number
          tier_level?: number | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          user_id: string
          product_id: string
          payment_provider: string | null
          payment_id: string | null
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          payment_provider?: string | null
          payment_id?: string | null
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          payment_provider?: string | null
          payment_id?: string | null
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      content_weeks: {
        Row: {
          id: string
          start_date: string
          end_date: string
          title: string | null
          description: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          start_date: string
          end_date: string
          title?: string | null
          description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          start_date?: string
          end_date?: string
          title?: string | null
          description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          id: string
          week_id: string
          session_number: number
          required_tier: Database['public']['Enums']['subscription_tier']
          title: string
          description: string | null
          cover_image_url: string | null
          estimated_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          week_id: string
          session_number: number
          required_tier?: Database['public']['Enums']['subscription_tier']
          title: string
          description?: string | null
          cover_image_url?: string | null
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          week_id?: string
          session_number?: number
          required_tier?: Database['public']['Enums']['subscription_tier']
          title?: string
          description?: string | null
          cover_image_url?: string | null
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_week_id_fkey"
            columns: ["week_id"]
            referencedRelation: "content_weeks"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: {
          id: string
          workout_session_id: string
          order_index: number
          title: string
          description: string
          video_kinescope_id: string
          video_thumbnail_url: string | null
          sets: number | null
          reps: string | null
          rest_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_session_id: string
          order_index: number
          title: string
          description: string
          video_kinescope_id: string
          video_thumbnail_url?: string | null
          sets?: number | null
          reps?: string | null
          rest_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_session_id?: string
          order_index?: number
          title?: string
          description?: string
          video_kinescope_id?: string
          video_thumbnail_url?: string | null
          sets?: number | null
          reps?: string | null
          rest_seconds?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_workout_completions: {
        Row: {
          id: string
          user_id: string
          workout_session_id: string
          completed_at: string
          rating: number | null
          difficulty_rating: number | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_session_id: string
          completed_at?: string
          rating?: number | null
          difficulty_rating?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_session_id?: string
          completed_at?: string
          rating?: number | null
          difficulty_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_completions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_completions_workout_session_id_fkey"
            columns: ["workout_session_id"]
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'basic' | 'pro' | 'elite'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
