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
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          profile_completed_at: string | null
          role: 'user' | 'admin'
          subscription_status: 'active' | 'inactive' | 'canceled'
          subscription_tier: Database['public']['Enums']['subscription_tier']
          subscription_expires_at: string | null
          payment_method_info: Json | null
          // Новые поля для ЮKassa
          payment_method_id: string | null
          auto_renew_enabled: boolean
          subscription_duration_months: number
          next_billing_date: string | null
          failed_payment_attempts: number
          last_payment_date: string | null
          // Telegram авторизация
          telegram_id: string | null
          telegram_username: string | null
          stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: 'user' | 'admin'
          subscription_status?: 'active' | 'inactive' | 'canceled'
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          subscription_expires_at?: string | null
          payment_method_info?: Json | null
          // Новые поля для ЮKassa
          payment_method_id?: string | null
          auto_renew_enabled?: boolean
          subscription_duration_months?: number
          next_billing_date?: string | null
          failed_payment_attempts?: number
          last_payment_date?: string | null
          // Telegram авторизация
          telegram_id?: string | null
          telegram_username?: string | null
          stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: 'user' | 'admin'
          subscription_status?: 'active' | 'inactive' | 'canceled'
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          subscription_expires_at?: string | null
          payment_method_info?: Json | null
          // Новые поля для ЮKassa
          payment_method_id?: string | null
          auto_renew_enabled?: boolean
          subscription_duration_months?: number
          next_billing_date?: string | null
          failed_payment_attempts?: number
          last_payment_date?: string | null
          // Telegram авторизация
          telegram_id?: string | null
          telegram_username?: string | null
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
          duration_months: number
          discount_percentage: number
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
          duration_months?: number
          discount_percentage?: number
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
          duration_months?: number
          discount_percentage?: number
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
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          yookassa_payment_id: string
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'canceled' | 'failed'
          payment_type: 'initial' | 'recurring' | 'upgrade' | 'one_time' | null
          payment_method_id: string | null
          error_message: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          yookassa_payment_id: string
          amount: number
          currency?: string
          status: 'pending' | 'succeeded' | 'canceled' | 'failed'
          payment_type?: 'initial' | 'recurring' | 'upgrade' | 'one_time' | null
          payment_method_id?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string | null
          yookassa_payment_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'canceled' | 'failed'
          payment_type?: 'initial' | 'recurring' | 'upgrade' | 'one_time' | null
          payment_method_id?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      auth_exchange_codes: {
        Row: {
          id: string
          code: string
          user_id: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          user_id: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          user_id?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_exchange_codes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      free_content: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: string
          video_url?: string | null
          is_published?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string
          video_url?: string | null
          is_published?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
