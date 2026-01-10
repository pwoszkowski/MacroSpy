import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient as BaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Typed Supabase client for use across the application.
 * Use this type instead of importing from @supabase/supabase-js directly.
 */
export type SupabaseClient = BaseClient<Database>;
