import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        const cookieHeader = context.headers.get("Cookie") ?? "";
        const parsed = parseCookieHeader(cookieHeader);
        return parsed;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

// Keep the old client for client-side usage (not SSR)
import { createClient } from "@supabase/supabase-js";
export const supabaseClient = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY || process.env.SUPABASE_KEY
);

/**
 * Typed Supabase client for use across the application.
 * Use this type instead of importing from @supabase/supabase-js directly.
 */
export type SupabaseClient = ReturnType<typeof createSupabaseServerInstance>;
