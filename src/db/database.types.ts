export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      body_measurements: {
        Row: {
          body_fat_percentage: number | null;
          created_at: string;
          date: string;
          id: string;
          muscle_percentage: number | null;
          user_id: string;
          weight: number;
        };
        Insert: {
          body_fat_percentage?: number | null;
          created_at?: string;
          date: string;
          id?: string;
          muscle_percentage?: number | null;
          user_id: string;
          weight: number;
        };
        Update: {
          body_fat_percentage?: number | null;
          created_at?: string;
          date?: string;
          id?: string;
          muscle_percentage?: number | null;
          user_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dietary_goals: {
        Row: {
          activity_level: string | null;
          bmr: number | null;
          calories_target: number;
          carbs_target: number;
          created_at: string;
          fat_target: number;
          fiber_target: number | null;
          id: string;
          protein_target: number;
          start_date: string;
          tdee: number | null;
          user_id: string;
        };
        Insert: {
          activity_level?: string | null;
          bmr?: number | null;
          calories_target: number;
          carbs_target: number;
          created_at?: string;
          fat_target: number;
          fiber_target?: number | null;
          id?: string;
          protein_target: number;
          start_date: string;
          tdee?: number | null;
          user_id: string;
        };
        Update: {
          activity_level?: string | null;
          bmr?: number | null;
          calories_target?: number;
          carbs_target?: number;
          created_at?: string;
          fat_target?: number;
          fiber_target?: number | null;
          id?: string;
          protein_target?: number;
          start_date?: string;
          tdee?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dietary_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      favorite_meals: {
        Row: {
          calories: number;
          carbs: number;
          created_at: string;
          fat: number;
          fiber: number;
          id: string;
          name: string;
          protein: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calories: number;
          carbs: number;
          created_at?: string;
          fat: number;
          fiber?: number;
          id?: string;
          name: string;
          protein: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calories?: number;
          carbs?: number;
          created_at?: string;
          fat?: number;
          fiber?: number;
          id?: string;
          name?: string;
          protein?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorite_meals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      meals: {
        Row: {
          ai_suggestion: string | null;
          calories: number;
          carbs: number;
          consumed_at: string;
          created_at: string;
          fat: number;
          fiber: number | null;
          id: string;
          is_image_analyzed: boolean | null;
          last_ai_context: Json | null;
          name: string;
          original_prompt: string | null;
          protein: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_suggestion?: string | null;
          calories: number;
          carbs: number;
          consumed_at: string;
          created_at?: string;
          fat: number;
          fiber?: number | null;
          id?: string;
          is_image_analyzed?: boolean | null;
          last_ai_context?: Json | null;
          name: string;
          original_prompt?: string | null;
          protein: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_suggestion?: string | null;
          calories?: number;
          carbs?: number;
          consumed_at?: string;
          created_at?: string;
          fat?: number;
          fiber?: number | null;
          id?: string;
          is_image_analyzed?: boolean | null;
          last_ai_context?: Json | null;
          name?: string;
          original_prompt?: string | null;
          protein?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          birth_date: string | null;
          created_at: string;
          gender: string | null;
          height: number | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          birth_date?: string | null;
          created_at?: string;
          gender?: string | null;
          height?: number | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          birth_date?: string | null;
          created_at?: string;
          gender?: string | null;
          height?: number | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
