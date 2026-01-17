import type { APIRoute } from "astro";
import { z } from "zod";
import { GoalService } from "../../../lib/services/goal.service";
import type { SetDietaryGoalCommand } from "../../../types";

export const prerender = false;

/**
 * Zod schema for validating SetDietaryGoalCommand
 */
const setDietaryGoalSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  calories_target: z
    .number()
    .int("Calories target must be an integer")
    .min(500, "Calories target must be at least 500")
    .max(10000, "Calories target must be at most 10000"),
  protein_target: z.number().int("Protein target must be an integer").min(0, "Protein target must be non-negative"),
  fat_target: z.number().int("Fat target must be an integer").min(0, "Fat target must be non-negative"),
  carbs_target: z.number().int("Carbs target must be an integer").min(0, "Carbs target must be non-negative"),
  fiber_target: z
    .number()
    .int("Fiber target must be an integer")
    .min(0, "Fiber target must be non-negative")
    .nullable()
    .optional(),
});

/**
 * POST /api/goals
 * Creates a new dietary goal for the authenticated user.
 * The goal becomes active based on its start_date.
 * Body: SetDietaryGoalCommand (JSON)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = locals.user.id;

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const validationResult = setDietaryGoalSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create goal using service
    const goalService = new GoalService(locals.supabase);
    const command: SetDietaryGoalCommand = {
      ...validationResult.data,
      fiber_target: validationResult.data.fiber_target ?? null,
    };
    const createdGoal = await goalService.createGoal(userId, command);

    return new Response(JSON.stringify(createdGoal), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating dietary goal:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
