export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      candidate: {
        Row: {
          application_source: Database["public"]["Enums"]["application_source"]
          created_at: string
          deletion_review_date: string | null
          documents_path: string | null
          email: string | null
          first_name: string
          follow_up_date: string | null
          foreign_qualification_recognition: Database["public"]["Enums"]["foreign_qualification_recognition"]
          id: string
          last_name: string
          mobility: Database["public"]["Enums"]["mobility"]
          next_step: string | null
          notes: string | null
          nursing_qualification:
            | Database["public"]["Enums"]["nursing_qualification"]
            | null
          phone: string | null
          priority: Database["public"]["Enums"]["candidate_priority"] | null
          rejection_reason:
            | Database["public"]["Enums"]["rejection_reason"]
            | null
          stage: Database["public"]["Enums"]["pipeline_stage"]
          stage_order: number
          status: Database["public"]["Enums"]["candidate_status"]
          team_feedback_status: Database["public"]["Enums"]["team_feedback_status"]
          team_proposal: string | null
          updated_at: string
        }
        Insert: {
          application_source: Database["public"]["Enums"]["application_source"]
          created_at?: string
          deletion_review_date?: string | null
          documents_path?: string | null
          email?: string | null
          first_name: string
          follow_up_date?: string | null
          foreign_qualification_recognition?: Database["public"]["Enums"]["foreign_qualification_recognition"]
          id?: string
          last_name: string
          mobility?: Database["public"]["Enums"]["mobility"]
          next_step?: string | null
          notes?: string | null
          nursing_qualification?:
            | Database["public"]["Enums"]["nursing_qualification"]
            | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["candidate_priority"] | null
          rejection_reason?:
            | Database["public"]["Enums"]["rejection_reason"]
            | null
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          stage_order?: number
          status?: Database["public"]["Enums"]["candidate_status"]
          team_feedback_status?: Database["public"]["Enums"]["team_feedback_status"]
          team_proposal?: string | null
          updated_at?: string
        }
        Update: {
          application_source?: Database["public"]["Enums"]["application_source"]
          created_at?: string
          deletion_review_date?: string | null
          documents_path?: string | null
          email?: string | null
          first_name?: string
          follow_up_date?: string | null
          foreign_qualification_recognition?: Database["public"]["Enums"]["foreign_qualification_recognition"]
          id?: string
          last_name?: string
          mobility?: Database["public"]["Enums"]["mobility"]
          next_step?: string | null
          notes?: string | null
          nursing_qualification?:
            | Database["public"]["Enums"]["nursing_qualification"]
            | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["candidate_priority"] | null
          rejection_reason?:
            | Database["public"]["Enums"]["rejection_reason"]
            | null
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          stage_order?: number
          status?: Database["public"]["Enums"]["candidate_status"]
          team_feedback_status?: Database["public"]["Enums"]["team_feedback_status"]
          team_proposal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      talent_pool_consent: {
        Row: {
          accepted: boolean
          answered_at: string | null
          candidate_id: string
          created_at: string
          id: string
          proof_metadata: Json | null
          state: Database["public"]["Enums"]["consent_state"]
          updated_at: string
        }
        Insert: {
          accepted?: boolean
          answered_at?: string | null
          candidate_id: string
          created_at?: string
          id?: string
          proof_metadata?: Json | null
          state?: Database["public"]["Enums"]["consent_state"]
          updated_at?: string
        }
        Update: {
          accepted?: boolean
          answered_at?: string | null
          candidate_id?: string
          created_at?: string
          id?: string
          proof_metadata?: Json | null
          state?: Database["public"]["Enums"]["consent_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_pool_consent_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
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
      application_source:
        | "email"
        | "phone"
        | "partner_referral"
        | "employee_referral"
        | "job_portal"
        | "agency"
        | "website"
        | "walk_in"
        | "other"
      candidate_priority: "a" | "b" | "c" | "d"
      candidate_status:
        | "active"
        | "on_hold"
        | "hired"
        | "rejected"
        | "talent_pool"
        | "withdrawn"
      consent_state: "draft" | "sent" | "answered"
      foreign_qualification_recognition:
        | "not_applicable"
        | "not_started"
        | "pending"
        | "partially_recognized"
        | "fully_recognized"
        | "rejected"
      mobility: "own_car" | "license_no_car" | "no_license" | "unknown"
      nursing_qualification:
        | "examined_nurse"
        | "nursing_assistant"
        | "nursing_aide_1yr"
        | "care_assistant_unqualified"
        | "other"
        | "none"
      pipeline_stage:
        | "new"
        | "screening"
        | "phone_screen"
        | "interview"
        | "trial_day"
        | "offer"
        | "hired"
      rejection_reason:
        | "no_reply"
        | "position_filled"
        | "unqualified"
        | "language_issues"
        | "salary_mismatch"
        | "declined_by_candidate"
        | "no_show"
        | "duplicate"
        | "spam"
        | "other"
      team_feedback_status:
        | "not_requested"
        | "pending"
        | "positive"
        | "negative"
        | "more_info_needed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_source: [
        "email",
        "phone",
        "partner_referral",
        "employee_referral",
        "job_portal",
        "agency",
        "website",
        "walk_in",
        "other",
      ],
      candidate_priority: ["a", "b", "c", "d"],
      candidate_status: [
        "active",
        "on_hold",
        "hired",
        "rejected",
        "talent_pool",
        "withdrawn",
      ],
      consent_state: ["draft", "sent", "answered"],
      foreign_qualification_recognition: [
        "not_applicable",
        "not_started",
        "pending",
        "partially_recognized",
        "fully_recognized",
        "rejected",
      ],
      mobility: ["own_car", "license_no_car", "no_license", "unknown"],
      nursing_qualification: [
        "examined_nurse",
        "nursing_assistant",
        "nursing_aide_1yr",
        "care_assistant_unqualified",
        "other",
        "none",
      ],
      pipeline_stage: [
        "new",
        "screening",
        "phone_screen",
        "interview",
        "trial_day",
        "offer",
        "hired",
      ],
      rejection_reason: [
        "no_reply",
        "position_filled",
        "unqualified",
        "language_issues",
        "salary_mismatch",
        "declined_by_candidate",
        "no_show",
        "duplicate",
        "spam",
        "other",
      ],
      team_feedback_status: [
        "not_requested",
        "pending",
        "positive",
        "negative",
        "more_info_needed",
      ],
    },
  },
} as const

