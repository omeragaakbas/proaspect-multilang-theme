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
      admin_settings: {
        Row: {
          company_logo_url: string | null
          contractor_id: string
          created_at: string
          default_payment_terms: string | null
          default_vat_rate: number | null
          id: string
          invoice_prefix: string | null
          invoice_template_settings: Json | null
          next_invoice_number: number | null
          updated_at: string
        }
        Insert: {
          company_logo_url?: string | null
          contractor_id: string
          created_at?: string
          default_payment_terms?: string | null
          default_vat_rate?: number | null
          id?: string
          invoice_prefix?: string | null
          invoice_template_settings?: Json | null
          next_invoice_number?: number | null
          updated_at?: string
        }
        Update: {
          company_logo_url?: string | null
          contractor_id?: string
          created_at?: string
          default_payment_terms?: string | null
          default_vat_rate?: number | null
          id?: string
          invoice_prefix?: string | null
          invoice_template_settings?: Json | null
          next_invoice_number?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          export_type: string
          file_url: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type: string
          file_url?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type?: string
          file_url?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      client_access_tokens: {
        Row: {
          client_id: string
          created_at: string
          email: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          token?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_json: Json | null
          archived: boolean
          billing_email: string | null
          contact_email: string | null
          contact_name: string | null
          contractor_id: string
          created_at: string
          id: string
          name_i18n: Json
          updated_at: string
        }
        Insert: {
          address_json?: Json | null
          archived?: boolean
          billing_email?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contractor_id: string
          created_at?: string
          id?: string
          name_i18n?: Json
          updated_at?: string
        }
        Update: {
          address_json?: Json | null
          archived?: boolean
          billing_email?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contractor_id?: string
          created_at?: string
          id?: string
          name_i18n?: Json
          updated_at?: string
        }
        Relationships: []
      }
      contractor_profiles: {
        Row: {
          address_json: Json | null
          company_name: string
          created_at: string
          default_hourly_rate: number
          iban: string | null
          id: string
          invoice_prefix: string | null
          kvk: string | null
          notification_preferences: Json | null
          team_owner_id: string | null
          timezone: string
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          address_json?: Json | null
          company_name: string
          created_at?: string
          default_hourly_rate?: number
          iban?: string | null
          id?: string
          invoice_prefix?: string | null
          kvk?: string | null
          notification_preferences?: Json | null
          team_owner_id?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          address_json?: Json | null
          company_name?: string
          created_at?: string
          default_hourly_rate?: number
          iban?: string | null
          id?: string
          invoice_prefix?: string | null
          kvk?: string | null
          notification_preferences?: Json | null
          team_owner_id?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_cents: number
          category: string
          contractor_id: string
          created_at: string
          currency: string
          date: string
          description: string | null
          id: string
          project_id: string | null
          receipt_url: string | null
          updated_at: string
          vat_amount_cents: number | null
          vat_deductible: boolean
        }
        Insert: {
          amount_cents: number
          category: string
          contractor_id: string
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          project_id?: string | null
          receipt_url?: string | null
          updated_at?: string
          vat_amount_cents?: number | null
          vat_deductible?: boolean
        }
        Update: {
          amount_cents?: number
          category?: string
          contractor_id?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          project_id?: string | null
          receipt_url?: string | null
          updated_at?: string
          vat_amount_cents?: number | null
          vat_deductible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          time_entry_id: string | null
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity: number
          time_entry_id?: string | null
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          time_entry_id?: string | null
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          contractor_id: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          line_items: Json
          name: string
          notes: string | null
          payment_terms: string | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          contractor_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          line_items?: Json
          name: string
          notes?: string | null
          payment_terms?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          contractor_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          line_items?: Json
          name?: string
          notes?: string | null
          payment_terms?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_approved_at: string | null
          client_approved_by: string | null
          client_id: string
          contractor_id: string
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          last_reminder_at: string | null
          notes: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_link: string | null
          payment_method: string | null
          payment_terms: string | null
          pdf_url: string | null
          recurring_invoice_id: string | null
          reminder_sent_at: string | null
          sent_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_cents: number
          total_cents: number
          ubl_url: string | null
          updated_at: string
          vat_amount_cents: number
          vat_rate: number
          viewed_at: string | null
        }
        Insert: {
          client_approved_at?: string | null
          client_approved_by?: string | null
          client_id: string
          contractor_id: string
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          last_reminder_at?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          recurring_invoice_id?: string | null
          reminder_sent_at?: string | null
          sent_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          ubl_url?: string | null
          updated_at?: string
          vat_amount_cents?: number
          vat_rate?: number
          viewed_at?: string | null
        }
        Update: {
          client_approved_at?: string | null
          client_approved_by?: string | null
          client_id?: string
          contractor_id?: string
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          last_reminder_at?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          recurring_invoice_id?: string | null
          reminder_sent_at?: string | null
          sent_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          ubl_url?: string | null
          updated_at?: string
          vat_amount_cents?: number
          vat_rate?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_recurring_invoice_id_fkey"
            columns: ["recurring_invoice_id"]
            isOneToOne: false
            referencedRelation: "recurring_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          preferred_locale: Database["public"]["Enums"]["locale"] | null
          ui_theme: Database["public"]["Enums"]["ui_theme"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          preferred_locale?: Database["public"]["Enums"]["locale"] | null
          ui_theme?: Database["public"]["Enums"]["ui_theme"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          preferred_locale?: Database["public"]["Enums"]["locale"] | null
          ui_theme?: Database["public"]["Enums"]["ui_theme"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_view_prefs: {
        Row: {
          created_at: string
          id: string
          locale: Database["public"]["Enums"]["locale"]
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          locale: Database["public"]["Enums"]["locale"]
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          locale?: Database["public"]["Enums"]["locale"]
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_view_prefs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived: boolean
          client_id: string
          code: string | null
          contractor_id: string
          created_at: string
          description_i18n: Json | null
          hourly_rate: number | null
          id: string
          name_i18n: Json
          po_number: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean
          client_id: string
          code?: string | null
          contractor_id: string
          created_at?: string
          description_i18n?: Json | null
          hourly_rate?: number | null
          id?: string
          name_i18n?: Json
          po_number?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean
          client_id?: string
          code?: string | null
          contractor_id?: string
          created_at?: string
          description_i18n?: Json | null
          hourly_rate?: number | null
          id?: string
          name_i18n?: Json
          po_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          client_id: string
          contractor_id: string
          created_at: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          last_generated_at: string | null
          next_invoice_date: string
          notes: string | null
          payment_terms: string | null
          start_date: string
          template_id: string | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          client_id: string
          contractor_id: string
          created_at?: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_invoice_date: string
          notes?: string | null
          payment_terms?: string | null
          start_date: string
          template_id?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          client_id?: string
          contractor_id?: string
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_invoice_date?: string
          notes?: string | null
          payment_terms?: string | null
          start_date?: string
          template_id?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          contractor_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          contractor_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          contractor_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          approved_at: string | null
          attachments: Json | null
          contractor_id: string
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          hours: number
          id: string
          project_id: string
          rejected_at: string | null
          rejection_reason: string | null
          start_time: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          attachments?: Json | null
          contractor_id: string
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          hours: number
          id?: string
          project_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          start_time?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          attachments?: Json | null
          contractor_id?: string
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          hours?: number
          id?: string
          project_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          start_time?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: { contractor_uuid: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ADMIN" | "CONTRACTOR"
      locale: "nl" | "en" | "tr"
      ui_theme: "LIGHT" | "DARK" | "SYSTEM"
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
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
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["ADMIN", "CONTRACTOR"],
      locale: ["nl", "en", "tr"],
      ui_theme: ["LIGHT", "DARK", "SYSTEM"],
    },
  },
} as const
