export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blink_conversations: {
        Row: {
          content: string
          context_data: Json | null
          created_at: string
          id: string
          message_type: string
          session_id: string
          speaker: string
          user_id: string
        }
        Insert: {
          content: string
          context_data?: Json | null
          created_at?: string
          id?: string
          message_type: string
          session_id: string
          speaker: string
          user_id: string
        }
        Update: {
          content?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          message_type?: string
          session_id?: string
          speaker?: string
          user_id?: string
        }
        Relationships: []
      }
      blink_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      blink_workflows: {
        Row: {
          agent_responses: Json | null
          context_data: Json
          created_at: string
          id: string
          parsed_data: Json | null
          status: string
          updated_at: string
          user_id: string
          workflow_type: Database["public"]["Enums"]["workflow_type"]
        }
        Insert: {
          agent_responses?: Json | null
          context_data?: Json
          created_at?: string
          id?: string
          parsed_data?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_type: Database["public"]["Enums"]["workflow_type"]
        }
        Update: {
          agent_responses?: Json | null
          context_data?: Json
          created_at?: string
          id?: string
          parsed_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_type?: Database["public"]["Enums"]["workflow_type"]
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          buyer_id: string | null
          created_at: string | null
          currency: string
          escrow_address: string | null
          expires_at: string | null
          id: string
          payment_method: string
          product_id: string
          release_conditions: Json | null
          seller_id: string | null
          status: string
          updated_at: string | null
          user_id: string
          x402_payment_id: string | null
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          created_at?: string | null
          currency?: string
          escrow_address?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string
          product_id: string
          release_conditions?: Json | null
          seller_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          x402_payment_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          created_at?: string | null
          currency?: string
          escrow_address?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string
          product_id?: string
          release_conditions?: Json | null
          seller_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          x402_payment_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          trust_points: number | null
          trust_points_history: Json | null
          trust_score_v2: number | null
          updated_at: string | null
          user_level: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          trust_points?: number | null
          trust_points_history?: Json | null
          trust_score_v2?: number | null
          updated_at?: string | null
          user_level?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          trust_points?: number | null
          trust_points_history?: Json | null
          trust_score_v2?: number | null
          updated_at?: string | null
          user_level?: number | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_trust_points: {
        Args: { user_uuid: string; points: number; reason: string }
        Returns: undefined
      }
    }
    Enums: {
      workflow_type:
        | "product_inquiry"
        | "product_purchase"
        | "itinerary_upload"
        | "logistics_request"
        | "local_intel"
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
      workflow_type: [
        "product_inquiry",
        "product_purchase",
        "itinerary_upload",
        "logistics_request",
        "local_intel",
      ],
    },
  },
} as const
