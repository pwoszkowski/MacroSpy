import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/login",
  "/register",
  "/forgot-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/callback",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Route offline jest prerenderowana statycznie i nie powinna wymagać sesji.
  if (url.pathname === "/offline" || url.pathname === "/offline/") {
    return next();
  }

  // Create Supabase server instance with cookie handling
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  locals.supabase = supabase;

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    locals.user = {
      email: user.email,
      id: user.id,
    };
  }

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    // If logged-in user tries to access auth pages, redirect to home or onboarding
    if (user && (url.pathname === "/login" || url.pathname === "/register" || url.pathname === "/forgot-password")) {
      // Check if user has completed onboarding
      const { data: goals } = await supabase
        .from("dietary_goals")
        .select("calories_target, protein_target, fat_target, carbs_target")
        .eq("user_id", user.id)
        .single();

      const hasCompletedOnboarding =
        goals &&
        goals.calories_target > 0 &&
        goals.protein_target > 0 &&
        goals.fat_target > 0 &&
        goals.carbs_target > 0;

      return redirect(hasCompletedOnboarding ? "/" : "/onboarding");
    }
    return next();
  }

  // For protected routes
  if (!user) {
    // Redirect to login for protected routes
    return redirect("/login");
  }

  // Check if user has completed onboarding (has dietary goals set)
  const { data: goals } = await supabase
    .from("dietary_goals")
    .select("calories_target, protein_target, fat_target, carbs_target")
    .eq("user_id", user.id)
    .single();

  const hasCompletedOnboarding =
    goals && goals.calories_target > 0 && goals.protein_target > 0 && goals.fat_target > 0 && goals.carbs_target > 0;

  // Allow access to specific endpoints during onboarding
  const isAiEndpoint = url.pathname.startsWith("/api/ai/");
  const isOnboardingApiEndpoint =
    url.pathname === "/api/profile" || url.pathname === "/api/goals" || url.pathname === "/api/measurements";

  // Force onboarding for users who haven't completed it
  if (!hasCompletedOnboarding && !isAiEndpoint && !isOnboardingApiEndpoint && url.pathname !== "/onboarding") {
    return redirect("/onboarding");
  }

  return next();
});
