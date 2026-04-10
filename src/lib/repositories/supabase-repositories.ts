import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export class TasksRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByUser(userId: string) {
    return this.client
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true, nullsFirst: false });
  }
}

export class EventsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByUser(userId: string) {
    return this.client
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("starts_at", { ascending: true });
  }
}

export class FinanceRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByUser(userId: string) {
    return this.client
      .from("financial_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
  }
}
