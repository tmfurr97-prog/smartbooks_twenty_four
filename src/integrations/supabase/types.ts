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
      admin_corrections: {
        Row: {
          client_user_id: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          preparer_user_id: string
          reason: string | null
          table_name: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          preparer_user_id: string
          reason?: string | null
          table_name: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          preparer_user_id?: string
          reason?: string | null
          table_name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_category: string | null
          category: string
          created_at: string
          file_hash: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          notes: string | null
          storage_path: string
          suggested_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_category?: string | null
          category?: string
          created_at?: string
          file_hash?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          notes?: string | null
          storage_path: string
          suggested_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_category?: string | null
          category?: string
          created_at?: string
          file_hash?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          notes?: string | null
          storage_path?: string
          suggested_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_letters: {
        Row: {
          acknowledged_at: string
          created_at: string
          id: string
          ip_address: string | null
          preparer_id: string | null
          scope_json: Json
          signature_name: string
          tax_year: number
          user_id: string
          version_hash: string
        }
        Insert: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          preparer_id?: string | null
          scope_json: Json
          signature_name: string
          tax_year: number
          user_id: string
          version_hash: string
        }
        Update: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          preparer_id?: string | null
          scope_json?: Json
          signature_name?: string
          tax_year?: number
          user_id?: string
          version_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_letters_preparer_id_fkey"
            columns: ["preparer_id"]
            isOneToOne: false
            referencedRelation: "preparer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estimated_tax_payments: {
        Row: {
          created_at: string
          due_date: string
          estimated_amount: number
          id: string
          paid_amount: number | null
          paid_date: string | null
          quarter: number
          reminder_sent: boolean
          status: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          due_date: string
          estimated_amount?: number
          id?: string
          paid_amount?: number | null
          paid_date?: string | null
          quarter: number
          reminder_sent?: boolean
          status?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          due_date?: string
          estimated_amount?: number
          id?: string
          paid_amount?: number | null
          paid_date?: string | null
          quarter?: number
          reminder_sent?: boolean
          status?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: []
      }
      mileage_trips: {
        Row: {
          created_at: string
          distance_miles: number
          end_location: string
          id: string
          is_round_trip: boolean
          notes: string | null
          purpose: string | null
          start_lat: number | null
          start_lng: number | null
          start_location: string
          trip_date: string
          trip_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          distance_miles?: number
          end_location: string
          id?: string
          is_round_trip?: boolean
          notes?: string | null
          purpose?: string | null
          start_lat?: number | null
          start_lng?: number | null
          start_location: string
          trip_date?: string
          trip_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          distance_miles?: number
          end_location?: string
          id?: string
          is_round_trip?: boolean
          notes?: string | null
          purpose?: string | null
          start_lat?: number | null
          start_lng?: number | null
          start_location?: string
          trip_date?: string
          trip_type?: string
          user_id?: string
        }
        Relationships: []
      }
      preparer_profiles: {
        Row: {
          accepting_clients: boolean
          bio: string | null
          created_at: string
          credentials: string[]
          display_name: string
          headshot_url: string | null
          id: string
          ptin: string | null
          qb_certifications: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepting_clients?: boolean
          bio?: string | null
          created_at?: string
          credentials?: string[]
          display_name: string
          headshot_url?: string | null
          id?: string
          ptin?: string | null
          qb_certifications?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepting_clients?: boolean
          bio?: string | null
          created_at?: string
          credentials?: string[]
          display_name?: string
          headshot_url?: string | null
          id?: string
          ptin?: string | null
          qb_certifications?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      return_scenarios: {
        Row: {
          computed_summary_json: Json | null
          created_at: string
          id: string
          inputs_json: Json
          name: string
          tax_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          computed_summary_json?: Json | null
          created_at?: string
          id?: string
          inputs_json?: Json
          name: string
          tax_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          computed_summary_json?: Json | null
          created_at?: string
          id?: string
          inputs_json?: Json
          name?: string
          tax_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      return_snapshots: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          summary_json: Json
          tax_year: number
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          summary_json: Json
          tax_year: number
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          summary_json?: Json
          tax_year?: number
          user_id?: string
        }
        Relationships: []
      }
      tax_professional_access: {
        Row: {
          access_level: string
          created_at: string
          id: string
          professional_email: string
          professional_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          id?: string
          professional_email: string
          professional_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string
          id?: string
          professional_email?: string
          professional_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_profiles: {
        Row: {
          created_at: string
          expenses: number
          filing_status: Database["public"]["Enums"]["filing_status"]
          home_office_deduction: number
          id: string
          income: number
          mileage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expenses?: number
          filing_status?: Database["public"]["Enums"]["filing_status"]
          home_office_deduction?: number
          id?: string
          income?: number
          mileage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expenses?: number
          filing_status?: Database["public"]["Enums"]["filing_status"]
          home_office_deduction?: number
          id?: string
          income?: number
          mileage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          is_tax_deductible: boolean
          merchant_name: string | null
          name: string
          needs_review: boolean
          notes: string | null
          receipt_url: string | null
          tax_category: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          is_tax_deductible?: boolean
          merchant_name?: string | null
          name: string
          needs_review?: boolean
          notes?: string | null
          receipt_url?: string | null
          tax_category?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          is_tax_deductible?: boolean
          merchant_name?: string | null
          name?: string
          needs_review?: boolean
          notes?: string | null
          receipt_url?: string | null
          tax_category?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expense_date: string
          expense_type: string
          id: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "preparer" | "admin"
      filing_status: "single" | "married" | "head_of_household"
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
      app_role: ["client", "preparer", "admin"],
      filing_status: ["single", "married", "head_of_household"],
    },
  },
} as const
