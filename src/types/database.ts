export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          priority: "low" | "medium" | "high";
          status: "todo" | "in_progress" | "done";
          due_date: string | null;
          estimated_minutes: number | null;
          scheduled_start: string | null;
          scheduled_end: string | null;
          tags: string[];
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          priority?: "low" | "medium" | "high";
          status?: "todo" | "in_progress" | "done";
          due_date?: string | null;
          estimated_minutes?: number | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          tags?: string[];
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          title: string;
          description: string | null;
          amount: number | null;
          starts_at: string;
          ends_at: string;
          location: string | null;
          is_all_day: boolean;
          recurrence_type: "once" | "monthly" | "yearly" | null;
          recurrence_day_of_month: number | null;
          recurrence_month: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          title: string;
          description?: string | null;
          amount?: number | null;
          starts_at: string;
          ends_at: string;
          location?: string | null;
          is_all_day?: boolean;
          recurrence_type?: "once" | "monthly" | "yearly" | null;
          recurrence_day_of_month?: number | null;
          recurrence_month?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_events"]["Insert"]>;
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          duration_minutes: number;
          break_minutes: number;
          status: "planned" | "running" | "paused" | "completed";
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          duration_minutes: number;
          break_minutes: number;
          status?: "planned" | "running" | "paused" | "completed";
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["focus_sessions"]["Insert"]>;
      };
      financial_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          date: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["financial_transactions"]["Insert"]>;
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: "light" | "dark" | "system";
          pomodoro_focus_minutes: number;
          pomodoro_break_minutes: number;
          compact_mode: boolean;
          week_starts_on: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: "light" | "dark" | "system";
          pomodoro_focus_minutes?: number;
          pomodoro_break_minutes?: number;
          compact_mode?: boolean;
          week_starts_on?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_preferences"]["Insert"]>;
      };
    };
  };
}
