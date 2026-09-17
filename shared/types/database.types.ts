export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string
          title: string
          issuer: string
          description: string | null
          achievement_date: string | null
          certificate_url: string | null
          image_url: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          issuer: string
          description?: string | null
          achievement_date?: string | null
          certificate_url?: string | null
          image_url?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          issuer?: string
          description?: string | null
          achievement_date?: string | null
          certificate_url?: string | null
          image_url?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      ai_api_keys: {
        Row: {
          id: string
          key_prefix: string
          key_hash: string
          label: string | null
          is_active: boolean
          last_used_at: string | null
          created_at: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          key_prefix: string
          key_hash: string
          label?: string | null
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
        Update: {
          id?: string
          key_prefix?: string
          key_hash?: string
          label?: string | null
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      ai_models: {
        Row: {
          id: string
          provider_id: string
          model_name: string
          display_name: string
          input_price: number | null
          output_price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          model_name: string
          display_name: string
          input_price?: number | null
          output_price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          model_name?: string
          display_name?: string
          input_price?: number | null
          output_price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["provider_id"]
          isOneToOne: false
          referencedRelation: "ai_providers"
          referencedColumns: ["id"]
        }
        ]
      }
      ai_providers: {
        Row: {
          id: string
          name: string
          base_url: string
          secret_api_key: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          base_url: string
          secret_api_key?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          base_url?: string
          secret_api_key?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      ai_rate_limits: {
        Row: {
          id: string
          identifier: string
          window_type: string
          request_count: number
          window_started_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          identifier: string
          window_type: string
          request_count?: number
          window_started_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          identifier?: string
          window_type?: string
          request_count?: number
          window_started_at?: string
          expires_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      ai_router_settings: {
        Row: {
          id: string
          is_enabled: boolean
          monthly_token_limit: number
          requests_per_minute: number
          requests_per_hour: number
          requests_per_day: number
          quota_exceeded_message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_enabled?: boolean
          monthly_token_limit?: number
          requests_per_minute?: number
          requests_per_hour?: number
          requests_per_day?: number
          quota_exceeded_message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_enabled?: boolean
          monthly_token_limit?: number
          requests_per_minute?: number
          requests_per_hour?: number
          requests_per_day?: number
          quota_exceeded_message?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      ai_usage_logs: {
        Row: {
          id: string
          api_key_id: string | null
          provider_id: string | null
          model_id: string | null
          request_id: string
          input_tokens: number
          output_tokens: number
          total_tokens: number
          status_code: number
          latency_ms: number | null
          error_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          api_key_id?: string | null
          provider_id?: string | null
          model_id?: string | null
          request_id: string
          input_tokens?: number
          output_tokens?: number
          total_tokens?: number
          status_code: number
          latency_ms?: number | null
          error_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          api_key_id?: string | null
          provider_id?: string | null
          model_id?: string | null
          request_id?: string
          input_tokens?: number
          output_tokens?: number
          total_tokens?: number
          status_code?: number
          latency_ms?: number | null
          error_code?: string | null
          created_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["api_key_id"]
          isOneToOne: false
          referencedRelation: "ai_api_keys"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: ""
          columns: ["model_id"]
          isOneToOne: false
          referencedRelation: "ai_models"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: ""
          columns: ["provider_id"]
          isOneToOne: false
          referencedRelation: "ai_providers"
          referencedColumns: ["id"]
        }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          session_id: string
          visitor_id: string
          event_name: string
          path: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          visitor_id: string
          event_name: string
          path?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          visitor_id?: string
          event_name?: string
          path?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["session_id"]
          isOneToOne: false
          referencedRelation: "analytics_sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: ""
          columns: ["visitor_id"]
          isOneToOne: false
          referencedRelation: "analytics_visitors"
          referencedColumns: ["id"]
        }
        ]
      }
      analytics_pageviews: {
        Row: {
          id: string
          session_id: string
          visitor_id: string
          path: string
          title: string | null
          viewed_at: string
          duration_ms: number | null
        }
        Insert: {
          id?: string
          session_id: string
          visitor_id: string
          path: string
          title?: string | null
          viewed_at?: string
          duration_ms?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          visitor_id?: string
          path?: string
          title?: string | null
          viewed_at?: string
          duration_ms?: number | null
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["session_id"]
          isOneToOne: false
          referencedRelation: "analytics_sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: ""
          columns: ["visitor_id"]
          isOneToOne: false
          referencedRelation: "analytics_visitors"
          referencedColumns: ["id"]
        }
        ]
      }
      analytics_sessions: {
        Row: {
          id: string
          visitor_id: string
          started_at: string
          last_activity_at: string
          landing_page: string | null
          exit_page: string | null
          referrer: string | null
        }
        Insert: {
          id?: string
          visitor_id: string
          started_at?: string
          last_activity_at?: string
          landing_page?: string | null
          exit_page?: string | null
          referrer?: string | null
        }
        Update: {
          id?: string
          visitor_id?: string
          started_at?: string
          last_activity_at?: string
          landing_page?: string | null
          exit_page?: string | null
          referrer?: string | null
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["visitor_id"]
          isOneToOne: false
          referencedRelation: "analytics_visitors"
          referencedColumns: ["id"]
        }
        ]
      }
      analytics_visitors: {
        Row: {
          id: string
          visitor_hash: string
          first_seen_at: string
          last_seen_at: string
          country: string | null
          region: string | null
          device_type: string | null
          browser: string | null
          os: string | null
        }
        Insert: {
          id?: string
          visitor_hash: string
          first_seen_at?: string
          last_seen_at?: string
          country?: string | null
          region?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
        }
        Update: {
          id?: string
          visitor_hash?: string
          first_seen_at?: string
          last_seen_at?: string
          country?: string | null
          region?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["post_id"]
          isOneToOne: false
          referencedRelation: "blog_posts"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: ""
          columns: ["tag_id"]
          isOneToOne: false
          referencedRelation: "blog_tags"
          referencedColumns: ["id"]
        }
        ]
      }
      blog_posts: {
        Row: {
          id: string
          author_id: string | null
          category_id: string | null
          title: string
          slug: string
          excerpt: string | null
          content: Json | null
          thumbnail_url: string | null
          status: string
          published_at: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          category_id?: string | null
          title: string
          slug: string
          excerpt?: string | null
          content?: Json | null
          thumbnail_url?: string | null
          status?: string
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          category_id?: string | null
          title?: string
          slug?: string
          excerpt?: string | null
          content?: Json | null
          thumbnail_url?: string | null
          status?: string
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["author_id"]
          isOneToOne: false
          referencedRelation: "users"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: ""
          columns: ["category_id"]
          isOneToOne: false
          referencedRelation: "blog_categories"
          referencedColumns: ["id"]
        }
        ]
      }
      blog_tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      documents: {
        Row: {
          id: string
          name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          version: string | null
          is_active: boolean
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          version?: string | null
          is_active?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_path?: string
          file_type?: string | null
          file_size?: number | null
          version?: string | null
          is_active?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      educations: {
        Row: {
          id: string
          institution: string
          degree: string
          field: string | null
          description: string | null
          start_date: string
          end_date: string | null
          logo_url: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution: string
          degree: string
          field?: string | null
          description?: string | null
          start_date: string
          end_date?: string | null
          logo_url?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution?: string
          degree?: string
          field?: string | null
          description?: string | null
          start_date?: string
          end_date?: string | null
          logo_url?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      experiences: {
        Row: {
          id: string
          title: string
          organization: string
          description: string | null
          location: string | null
          start_date: string
          end_date: string | null
          is_current: boolean
          logo_url: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          organization: string
          description?: string | null
          location?: string | null
          start_date: string
          end_date?: string | null
          is_current?: boolean
          logo_url?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          organization?: string
          description?: string | null
          location?: string | null
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          logo_url?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      github_repositories: {
        Row: {
          id: string
          github_id: number
          name: string
          full_name: string
          description: string | null
          html_url: string
          homepage_url: string | null
          language: string | null
          stars: number
          forks: number
          pushed_at: string | null
          is_featured: boolean
          is_visible: boolean
          display_order: number
          synced_at: string
        }
        Insert: {
          id?: string
          github_id: number
          name: string
          full_name: string
          description?: string | null
          html_url: string
          homepage_url?: string | null
          language?: string | null
          stars?: number
          forks?: number
          pushed_at?: string | null
          is_featured?: boolean
          is_visible?: boolean
          display_order?: number
          synced_at?: string
        }
        Update: {
          id?: string
          github_id?: number
          name?: string
          full_name?: string
          description?: string | null
          html_url?: string
          homepage_url?: string | null
          language?: string | null
          stars?: number
          forks?: number
          pushed_at?: string | null
          is_featured?: boolean
          is_visible?: boolean
          display_order?: number
          synced_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      github_settings: {
        Row: {
          id: string
          username: string | null
          max_projects: number
          auto_sync: boolean
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          max_projects?: number
          auto_sync?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          max_projects?: number
          auto_sync?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      navigation_items: {
        Row: {
          id: string
          label: string
          path: string
          icon: string | null
          display_order: number
          is_visible: boolean
          is_external: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          path: string
          icon?: string | null
          display_order?: number
          is_visible?: boolean
          is_external?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          path?: string
          icon?: string | null
          display_order?: number
          is_visible?: boolean
          is_external?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string
          title: string | null
          short_description: string | null
          description: string | null
          avatar_url: string | null
          location: string | null
          email: string | null
          phone: string | null
          github_username: string | null
          website_url: string | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          short_description?: string | null
          description?: string | null
          avatar_url?: string | null
          location?: string | null
          email?: string | null
          phone?: string | null
          github_username?: string | null
          website_url?: string | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          short_description?: string | null
          description?: string | null
          avatar_url?: string | null
          location?: string | null
          email?: string | null
          phone?: string | null
          github_username?: string | null
          website_url?: string | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      site_settings: {
        Row: {
          id: string
          site_name: string
          logo_url: string | null
          favicon_url: string | null
          meta_title: string | null
          meta_description: string | null
          og_image_url: string | null
          maintenance_mode: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          site_name: string
          logo_url?: string | null
          favicon_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image_url?: string | null
          maintenance_mode?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          logo_url?: string | null
          favicon_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image_url?: string | null
          maintenance_mode?: boolean
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      socials: {
        Row: {
          id: string
          platform: string
          username: string | null
          url: string
          icon: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          username?: string | null
          url: string
          icon?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          username?: string | null
          url?: string
          icon?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: []
          isOneToOne: false
          referencedRelation: ""
          referencedColumns: []
        }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
        {
          foreignKeyName: ""
          columns: ["id"]
          isOneToOne: false
          referencedRelation: "users"
          referencedColumns: ["id"]
        }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ai_rate_limit_hit: {
        Args: {
          p_identifier: string
          p_window_type: string
          p_window_seconds: number
          p_limit: number
        }
        Returns: {
          allowed: boolean
          current_count: number
          reset_at: string
        }[]
      }
      is_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
