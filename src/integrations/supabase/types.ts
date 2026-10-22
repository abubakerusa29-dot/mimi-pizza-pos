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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      pos_invoices: {
        Row: {
          address: string
          area: string | null
          created_at: string
          dispatched_at: string | null
          id: string
          lines: Json
          order_no: number
          order_type: string
          phone: string
          rider: string | null
          status: string | null
          table_no: string
        }
        Insert: {
          address?: string
          area?: string | null
          created_at?: string
          dispatched_at?: string | null
          id?: string
          lines?: Json
          order_no: number
          order_type?: string
          phone?: string
          rider?: string | null
          status?: string | null
          table_no?: string
        }
        Update: {
          address?: string
          area?: string | null
          created_at?: string
          dispatched_at?: string | null
          id?: string
          lines?: Json
          order_no?: number
          order_type?: string
          phone?: string
          rider?: string | null
          status?: string | null
          table_no?: string
        }
        Relationships: []
      }
      pos_security: {
        Row: {
          failed_attempts: number
          id: number
          locked_until: string | null
          pin_hash: string
          updated_at: string
        }
        Insert: {
          failed_attempts?: number
          id?: number
          locked_until?: string | null
          pin_hash: string
          updated_at?: string
        }
        Update: {
          failed_attempts?: number
          id?: number
          locked_until?: string | null
          pin_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_settings: {
        Row: {
          areas: Json
          id: number
          menu_overrides: Json
          restaurant: Json
          riders: Json
          updated_at: string
        }
        Insert: {
          areas?: Json
          id?: number
          menu_overrides?: Json
          restaurant?: Json
          riders?: Json
          updated_at?: string
        }
        Update: {
          areas?: Json
          id?: number
          menu_overrides?: Json
          restaurant?: Json
          riders?: Json
          updated_at?: string
        }
        Relationships: []
      }
      public_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          label: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          kind: string
          label?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          label?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          hidden: boolean
          id: string
          invoice_no: string
          name: string
          phone: string
          rating: number
          reply: string
          service: string
          starred: boolean
        }
        Insert: {
          comment: string
          created_at?: string
          hidden?: boolean
          id?: string
          invoice_no?: string
          name: string
          phone: string
          rating: number
          reply?: string
          service?: string
          starred?: boolean
        }
        Update: {
          comment?: string
          created_at?: string
          hidden?: boolean
          id?: string
          invoice_no?: string
          name?: string
          phone?: string
          rating?: number
          reply?: string
          service?: string
          starred?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      public_menu_overrides: { Args: never; Returns: Json }
      public_reviews: {
        Args: never
        Returns: {
          comment: string
          created_at: string
          id: string
          name: string
          rating: number
          reply: string
          service: string
          starred: boolean
          verified: boolean
        }[]
      }
      reset_all_data: { Args: never; Returns: undefined }
      track_order: {
        Args: { _order_no: number }
        Returns: {
          created_at: string
          dispatched_at: string
          order_no: number
          order_type: string
          rider: string
          status: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
