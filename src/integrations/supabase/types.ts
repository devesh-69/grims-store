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
      alert_rules: {
        Row: {
          channels: Json
          condition: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          metric_name: string
          name: string
          recipients: Json
          threshold: number
          updated_at: string
        }
        Insert: {
          channels?: Json
          condition: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metric_name: string
          name: string
          recipients?: Json
          threshold: number
          updated_at?: string
        }
        Update: {
          channels?: Json
          condition?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metric_name?: string
          name?: string
          recipients?: Json
          threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string
          category: string | null
          content: string
          cover_image: string
          created_at: string
          excerpt: string
          id: string
          published_at: string | null
          seo: Json | null
          slug: string
          social_preview: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          cover_image: string
          created_at?: string
          excerpt: string
          id?: string
          published_at?: string | null
          seo?: Json | null
          slug: string
          social_preview?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          cover_image?: string
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          seo?: Json | null
          slug?: string
          social_preview?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          created_by: string | null
          detailed_description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_new: boolean | null
          name: string
          original_price: number | null
          price: number | null
          rating: number | null
          review_count: number | null
          short_description: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by?: string | null
          detailed_description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name: string
          original_price?: number | null
          price?: number | null
          rating?: number | null
          review_count?: number | null
          short_description: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string | null
          detailed_description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name?: string
          original_price?: number | null
          price?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          custom_attributes: Json | null
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          location: string | null
          referral_code: string | null
          signup_source: string | null
          spend: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          custom_attributes?: Json | null
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          location?: string | null
          referral_code?: string | null
          signup_source?: string | null
          spend?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          custom_attributes?: Json | null
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          location?: string | null
          referral_code?: string | null
          signup_source?: string | null
          spend?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "report_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          created_at: string
          created_by: string | null
          downloaded_count: number | null
          file_path: string
          format: string
          id: string
          scheduled_id: string | null
          size_bytes: number | null
          template_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          downloaded_count?: number | null
          file_path: string
          format: string
          id?: string
          scheduled_id?: string | null
          size_bytes?: number | null
          template_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          downloaded_count?: number | null
          file_path?: string
          format?: string
          id?: string
          scheduled_id?: string | null
          size_bytes?: number | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_scheduled_id_fkey"
            columns: ["scheduled_id"]
            isOneToOne: false
            referencedRelation: "scheduled_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_exports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_shares: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          share_token: string
          template_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          share_token: string
          template_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          share_token?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_shares_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          chart_config: Json
          chart_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          sql_query: string
          updated_at: string
        }
        Insert: {
          chart_config?: Json
          chart_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          sql_query: string
          updated_at?: string
        }
        Update: {
          chart_config?: Json
          chart_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          sql_query?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_segments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filter_criteria: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_criteria: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_criteria?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          format: string[]
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipients: Json
          schedule: string
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          format?: string[]
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipients?: Json
          schedule: string
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          format?: string[]
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipients?: Json
          schedule?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wishlists: {
        Row: {
          created_at: string
          id: number
          product_ids: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          product_ids: Json
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          product_ids?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlist_products: {
        Row: {
          created_at: string
          id: number
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          product_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_productss_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_productss_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      blog_with_authors: {
        Row: {
          author_id: string | null
          author_name: string | null
          avatar_url: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          published_at: string | null
          seo: Json | null
          slug: string | null
          social_preview: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      user_cohorts: {
        Row: {
          avg_spend: number | null
          cohort_month: string | null
          total_spend: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_kpis: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          value: number
          change_percentage: number
          period: string
        }[]
      }
    }
    Enums: {
      user_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "moderator", "user"],
    },
  },
} as const
