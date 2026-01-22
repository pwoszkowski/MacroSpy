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
  // Import server environment variables
  const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } = import.meta.env;

  const supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, {
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

// Global client removed - all components should use createSupabaseServerInstance
// or Astro.locals.supabase for SSR contexts

/**
 * Typed Supabase client for use across the application.
 * Use this type instead of importing from @supabase/supabase-js directly.
 */
export type SupabaseClient = ReturnType<typeof createSupabaseServerInstance>;
