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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          created_at: string
          email: string | null
          hire_date: string | null
          id: string
          last_interaction: string | null
          name: string
          notes: string | null
          origin: string
          phone: string
          position: string
          recruiter: string
          salary: number | null
          score: number | null
          stage: string
          termination_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          last_interaction?: string | null
          name: string
          notes?: string | null
          origin?: string
          phone: string
          position: string
          recruiter?: string
          salary?: number | null
          score?: number | null
          stage?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          last_interaction?: string | null
          name?: string
          notes?: string | null
          origin?: string
          phone?: string
          position?: string
          recruiter?: string
          salary?: number | null
          score?: number | null
          stage?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          candidate_name: string
          created_at: string
          date: string
          id: string
          job_title: string
          time: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          candidate_name: string
          created_at?: string
          date: string
          id?: string
          job_title: string
          time: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          candidate_name?: string
          created_at?: string
          date?: string
          id?: string
          job_title?: string
          time?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          candidates_count: number
          created_at: string
          department: string
          id: string
          location: string
          recruiter: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          candidates_count?: number
          created_at?: string
          department: string
          id?: string
          location?: string
          recruiter?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          candidates_count?: number
          created_at?: string
          department?: string
          id?: string
          location?: string
          recruiter?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      time_clock_entries: {
        Row: {
          account_owner_id: string
          address: string | null
          clocked_at: string
          created_at: string
          device_info: string | null
          distance_meters: number | null
          entry_type: Database["public"]["Enums"]["time_clock_entry_type"]
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          selfie_url: string | null
          user_id: string
          within_geofence: boolean
        }
        Insert: {
          account_owner_id: string
          address?: string | null
          clocked_at?: string
          created_at?: string
          device_info?: string | null
          distance_meters?: number | null
          entry_type: Database["public"]["Enums"]["time_clock_entry_type"]
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          selfie_url?: string | null
          user_id: string
          within_geofence?: boolean
        }
        Update: {
          account_owner_id?: string
          address?: string | null
          clocked_at?: string
          created_at?: string
          device_info?: string | null
          distance_meters?: number | null
          entry_type?: Database["public"]["Enums"]["time_clock_entry_type"]
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          selfie_url?: string | null
          user_id?: string
          within_geofence?: boolean
        }
        Relationships: []
      }
      time_clock_settings: {
        Row: {
          allowed_radius_meters: number
          created_at: string
          enforce_geofence: boolean
          id: string
          office_address: string | null
          office_latitude: number | null
          office_longitude: number | null
          owner_id: string
          require_selfie: boolean
          updated_at: string
          workday_end: string
          workday_start: string
        }
        Insert: {
          allowed_radius_meters?: number
          created_at?: string
          enforce_geofence?: boolean
          id?: string
          office_address?: string | null
          office_latitude?: number | null
          office_longitude?: number | null
          owner_id: string
          require_selfie?: boolean
          updated_at?: string
          workday_end?: string
          workday_start?: string
        }
        Update: {
          allowed_radius_meters?: number
          created_at?: string
          enforce_geofence?: boolean
          id?: string
          office_address?: string | null
          office_latitude?: number | null
          office_longitude?: number | null
          owner_id?: string
          require_selfie?: boolean
          updated_at?: string
          workday_end?: string
          workday_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_server_time: { Args: never; Returns: string }
    }
    Enums: {
      time_clock_entry_type: "entrada" | "saida"
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
      time_clock_entry_type: ["entrada", "saida"],
    },
  },
} as const
