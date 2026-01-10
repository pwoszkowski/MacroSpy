import type { APIRoute } from "astro";
import { ProfileService } from "../../../lib/services/profile.service";
import { GoalService } from "../../../lib/services/goal.service";
import type { UserProfileResponse } from "../../../types";

export const prerender = false;

/**
 * GET /api/profile/me
 * Retrieves the authenticated user's profile and current dietary goal.
 * Returns aggregated data: profile (height, gender, birth_date) and current_goal.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // TODO: Add authentication when ready
    // For now, use a test user_id
    const userId = "d9622d1a-756c-442a-aba9-ef94ad49b174";

    // Initialize services
    const profileService = new ProfileService(locals.supabase);
    const goalService = new GoalService(locals.supabase);

    // Fetch profile and current goal in parallel
    const [profile, currentGoal] = await Promise.all([
      profileService.getProfile(userId),
      goalService.getCurrentGoal(userId),
    ]);

    // Check if profile exists (should always exist due to trigger, but handle edge case)
    if (!profile) {
      return new Response(
        JSON.stringify({
          error: "Profile not found",
          message: "User profile does not exist",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construct response
    const response: UserProfileResponse = {
      profile,
      current_goal: currentGoal,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
