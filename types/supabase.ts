export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: Database["public"]["Enums"]["achievement_category"]
          color_class: string
          created_at: string | null
          description: string
          icon: string
          icon_url: string | null
          id: string
          is_secret: boolean
          metadata: Json | null
          reward_amount: number | null
          secret_hint: string | null
          sort_order: number
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["achievement_category"]
          color_class: string
          created_at?: string | null
          description: string
          icon: string
          icon_url?: string | null
          id?: string
          is_secret?: boolean
          metadata?: Json | null
          reward_amount?: number | null
          secret_hint?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["achievement_category"]
          color_class?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          icon_url?: string | null
          id?: string
          is_secret?: boolean
          metadata?: Json | null
          reward_amount?: number | null
          secret_hint?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          access_level: string
          category: string | null
          created_at: string
          description: string | null
          display_status: string
          id: string
          image_url: string | null
          is_new: boolean
          is_published: boolean | null
          is_updated: boolean
          reading_time: number | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_status?: string
          id?: string
          image_url?: string | null
          is_new?: boolean
          is_published?: boolean | null
          is_updated?: boolean
          reading_time?: number | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_status?: string
          id?: string
          image_url?: string | null
          is_new?: boolean
          is_published?: boolean | null
          is_updated?: boolean
          reading_time?: number | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      auth_exchange_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      bonus_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          related_payment_id: string | null
          related_user_id: string | null
          type: Database["public"]["Enums"]["bonus_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          related_payment_id?: string | null
          related_user_id?: string | null
          type: Database["public"]["Enums"]["bonus_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          related_payment_id?: string | null
          related_user_id?: string | null
          type?: Database["public"]["Enums"]["bonus_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_transactions_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_weeks: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_published: boolean
          start_date: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_published?: boolean
          start_date: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_published?: boolean
          start_date?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          created_at: string
          date: string
          habits_completed: Json | null
          id: string
          metrics: Json
          notes: string | null
          photo_urls: string[] | null
          updated_at: string
          user_id: string
          weekly_measurements: Json | null
          weekly_photos: Json | null
        }
        Insert: {
          created_at?: string
          date?: string
          habits_completed?: Json | null
          id?: string
          metrics?: Json
          notes?: string | null
          photo_urls?: string[] | null
          updated_at?: string
          user_id: string
          weekly_measurements?: Json | null
          weekly_photos?: Json | null
        }
        Update: {
          created_at?: string
          date?: string
          habits_completed?: Json | null
          id?: string
          metrics?: Json
          notes?: string | null
          photo_urls?: string[] | null
          updated_at?: string
          user_id?: string
          weekly_measurements?: Json | null
          weekly_photos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_settings: {
        Row: {
          enabled_widgets: string[] | null
          goals: Json | null
          habits: Json | null
          streaks: Json | null
          updated_at: string
          user_id: string
          user_params: Json | null
          widget_goals: Json | null
          widgets_in_daily_plan: string[] | null
        }
        Insert: {
          enabled_widgets?: string[] | null
          goals?: Json | null
          habits?: Json | null
          streaks?: Json | null
          updated_at?: string
          user_id: string
          user_params?: Json | null
          widget_goals?: Json | null
          widgets_in_daily_plan?: string[] | null
        }
        Update: {
          enabled_widgets?: string[] | null
          goals?: Json | null
          habits?: Json | null
          streaks?: Json | null
          updated_at?: string
          user_id?: string
          user_params?: Json | null
          widget_goals?: Json | null
          widgets_in_daily_plan?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_library: {
        Row: {
          category: string | null
          created_at: string | null
          default_reps: string | null
          default_rest_seconds: number | null
          default_sets: number | null
          description: string | null
          id: string
          inventory: string | null
          inventory_alternative: string | null
          light_version: string | null
          metadata: Json | null
          name: string
          target_muscles: string[] | null
          technique_steps: string | null
          typical_mistakes: string | null
          updated_at: string | null
          video_script: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_reps?: string | null
          default_rest_seconds?: number | null
          default_sets?: number | null
          description?: string | null
          id: string
          inventory?: string | null
          inventory_alternative?: string | null
          light_version?: string | null
          metadata?: Json | null
          name: string
          target_muscles?: string[] | null
          technique_steps?: string | null
          typical_mistakes?: string | null
          updated_at?: string | null
          video_script?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_reps?: string | null
          default_rest_seconds?: number | null
          default_sets?: number | null
          description?: string | null
          id?: string
          inventory?: string | null
          inventory_alternative?: string | null
          light_version?: string | null
          metadata?: Json | null
          name?: string
          target_muscles?: string[] | null
          technique_steps?: string | null
          typical_mistakes?: string | null
          updated_at?: string | null
          video_script?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          description: string
          id: string
          order_index: number
          reps: string | null
          rest_seconds: number | null
          sets: number | null
          title: string
          video_kinescope_id: string
          video_thumbnail_url: string | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_index: number
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          title: string
          video_kinescope_id: string
          video_thumbnail_url?: string | null
          workout_session_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_index?: number
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          title?: string
          video_kinescope_id?: string
          video_thumbnail_url?: string | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          payment_method_id: string | null
          payment_type: string | null
          product_id: string | null
          status: string
          updated_at: string | null
          user_id: string
          yookassa_payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          payment_method_id?: string | null
          payment_type?: string | null
          product_id?: string | null
          status: string
          updated_at?: string | null
          user_id: string
          yookassa_payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          payment_method_id?: string | null
          payment_type?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          yookassa_payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "subscription_products_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number | null
          duration_months: number | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          price: number
          tier_level: number | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          duration_months?: number | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          price: number
          tier_level?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          duration_months?: number | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          price?: number
          tier_level?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_renew_enabled: boolean | null
          avatar_url: string | null
          created_at: string
          email: string | null
          failed_payment_attempts: number | null
          full_name: string | null
          id: string
          last_payment_date: string | null
          next_billing_date: string | null
          payment_method_id: string | null
          payment_method_info: Json | null
          phone: string | null
          profile_completed_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          stats: Json
          subscription_duration_months: number | null
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status_enum"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          telegram_id: string | null
          telegram_username: string | null
          updated_at: string
          yandex_id: string | null
        }
        Insert: {
          auto_renew_enabled?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          failed_payment_attempts?: number | null
          full_name?: string | null
          id: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_method_id?: string | null
          payment_method_info?: Json | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stats?: Json
          subscription_duration_months?: number | null
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status_enum"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          telegram_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          yandex_id?: string | null
        }
        Update: {
          auto_renew_enabled?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          failed_payment_attempts?: number | null
          full_name?: string | null
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_method_id?: string | null
          payment_method_info?: Json | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stats?: Json
          subscription_duration_months?: number | null
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status_enum"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          telegram_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          yandex_id?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_products: Json | null
          code: string
          created_at: string | null
          created_by: string | null
          discount_type: Database["public"]["Enums"]["promo_discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          usage_count: number
          usage_limit: number | null
        }
        Insert: {
          applicable_products?: Json | null
          code: string
          created_at?: string | null
          created_by?: string | null
          discount_type: Database["public"]["Enums"]["promo_discount_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          usage_count?: number
          usage_limit?: number | null
        }
        Update: {
          applicable_products?: Json | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          discount_type?: Database["public"]["Enums"]["promo_discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          usage_count?: number
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          first_purchase_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          created_at?: string | null
          first_purchase_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          created_at?: string | null
          first_purchase_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bonuses: {
        Row: {
          balance: number
          cashback_level: number
          created_at: string | null
          id: string
          referral_level: number
          total_referral_earnings: number
          total_spent_for_cashback: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          cashback_level?: number
          created_at?: string | null
          id?: string
          referral_level?: number
          total_referral_earnings?: number
          total_spent_for_cashback?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          cashback_level?: number
          created_at?: string | null
          id?: string
          referral_level?: number
          total_referral_earnings?: number
          total_spent_for_cashback?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bonuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          actual_paid_amount: number
          amount: number
          created_at: string
          id: string
          payment_id: string | null
          payment_provider: string | null
          product_id: string
          purchased_days: number
          user_id: string
        }
        Insert: {
          actual_paid_amount?: number
          amount: number
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          product_id: string
          purchased_days?: number
          user_id: string
        }
        Update: {
          actual_paid_amount?: number
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          product_id?: string
          purchased_days?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "subscription_products_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_completions: {
        Row: {
          completed_at: string
          difficulty_rating: number | null
          id: string
          rating: number | null
          user_id: string
          workout_session_id: string
        }
        Insert: {
          completed_at?: string
          difficulty_rating?: number | null
          id?: string
          rating?: number | null
          user_id: string
          workout_session_id: string
        }
        Update: {
          completed_at?: string
          difficulty_rating?: number | null
          id?: string
          rating?: number | null
          user_id?: string
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_completions_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          exercise_library_id: string
          id: string
          order_index: number
          reps: string | null
          rest_seconds: number | null
          session_id: string
          sets: number | null
          updated_at: string | null
          video_kinescope_id: string | null
          video_script: string | null
          video_thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_library_id: string
          id?: string
          order_index?: number
          reps?: string | null
          rest_seconds?: number | null
          session_id: string
          sets?: number | null
          updated_at?: string | null
          video_kinescope_id?: string | null
          video_script?: string | null
          video_thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_library_id?: string
          id?: string
          order_index?: number
          reps?: string | null
          rest_seconds?: number | null
          session_id?: string
          sets?: number | null
          updated_at?: string | null
          video_kinescope_id?: string | null
          video_script?: string | null
          video_thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_library_id_fkey"
            columns: ["exercise_library_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          estimated_duration: number | null
          id: string
          is_demo: boolean | null
          required_tier: Database["public"]["Enums"]["subscription_tier"]
          session_number: number
          title: string
          updated_at: string
          week_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_demo?: boolean | null
          required_tier?: Database["public"]["Enums"]["subscription_tier"]
          session_number: number
          title: string
          updated_at?: string
          week_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_demo?: boolean | null
          required_tier?: Database["public"]["Enums"]["subscription_tier"]
          session_number?: number
          title?: string
          updated_at?: string
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "content_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean
          is_published: boolean
          linked_product_id: string | null
          order_index: number | null
          required_tier: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_kinescope_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          linked_product_id?: string | null
          order_index?: number | null
          required_tier?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_kinescope_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          linked_product_id?: string | null
          order_index?: number | null
          required_tier?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_kinescope_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      subscription_products_view: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          duration_months: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          price: number | null
          price_per_day: number | null
          savings_amount: number | null
          tier_level: number | null
          tier_name: string | null
        }
        Insert: {
          base_price?: never
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          duration_months?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          price?: number | null
          price_per_day?: never
          savings_amount?: never
          tier_level?: number | null
          tier_name?: never
        }
        Update: {
          base_price?: never
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          duration_months?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          price?: number | null
          price_per_day?: never
          savings_amount?: never
          tier_level?: number | null
          tier_name?: never
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_max_streak_for_habit: {
        Args: {
          p_days_of_week: string[]
          p_habit_id: string
          p_user_id: string
        }
        Returns: number
      }
      check_email_exists: {
        Args: { current_user_id: string; email_to_check: string }
        Returns: boolean
      }
      cleanup_expired_exchange_codes: { Args: never; Returns: undefined }
      create_bonus_account_for_user: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_product_by_tier_and_duration: {
        Args: { p_duration_months: number; p_tier_level: number }
        Returns: {
          discount_percentage: number
          duration_months: number
          id: string
          name: string
          price: number
          tier_level: number
        }[]
      }
      get_user_metrics_stats: {
        Args: { p_user_id: string }
        Returns: {
          energy_max_count: number
          total_habit_completions: number
          total_steps: number
          total_water: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      unlock_achievement_for_user: {
        Args: { p_achievement_id: string; p_user_id: string }
        Returns: boolean
      }
      update_diary_streaks: {
        Args: { p_entry_date: string; p_user_id: string }
        Returns: undefined
      }
      update_habits_with_streak_fields: { Args: never; Returns: undefined }
    }
    Enums: {
      achievement_category:
        | "streaks"
        | "metrics"
        | "habits"
        | "weight"
        | "consistency"
        | "workouts"
        | "social"
        | "common"
        | "rare"
        | "epic"
        | "legendary"
        | "absolute"
      bonus_transaction_type:
        | "welcome"
        | "cashback"
        | "referral_bonus"
        | "referral_first"
        | "spent"
        | "admin_adjustment"
        | "achievement"
      promo_discount_type: "percent" | "fixed_amount"
      referral_status: "registered" | "first_purchase_made"
      subscription_status_enum: "active" | "inactive" | "canceled"
      subscription_tier: "free" | "basic" | "pro" | "elite"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_category: [
        "streaks",
        "metrics",
        "habits",
        "weight",
        "consistency",
        "workouts",
        "social",
        "common",
        "rare",
        "epic",
        "legendary",
        "absolute",
      ],
      bonus_transaction_type: [
        "welcome",
        "cashback",
        "referral_bonus",
        "referral_first",
        "spent",
        "admin_adjustment",
        "achievement",
      ],
      promo_discount_type: ["percent", "fixed_amount"],
      referral_status: ["registered", "first_purchase_made"],
      subscription_status_enum: ["active", "inactive", "canceled"],
      subscription_tier: ["free", "basic", "pro", "elite"],
      user_role: ["user", "admin"],
    },
  },
} as const
