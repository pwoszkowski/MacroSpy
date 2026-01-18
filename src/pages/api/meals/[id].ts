import type { APIRoute } from "astro";
import { z } from "zod";
import { MealService } from "../../../lib/services/meal.service";
import type { UpdateMealCommand } from "../../../types";

export const prerender = false;

/**
 * Zod schema for validating UUID parameter
 */
const uuidSchema = z.string().uuid("Invalid meal ID format");

/**
 * Zod schema for validating UpdateMealCommand (partial update)
 */
const updateMealSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").max(255, "Name too long").optional(),
    calories: z.number().min(0, "Calories must be non-negative").optional(),
    protein: z.number().min(0, "Protein must be non-negative").optional(),
    fat: z.number().min(0, "Fat must be non-negative").optional(),
    carbs: z.number().min(0, "Carbs must be non-negative").optional(),
    fiber: z.number().min(0, "Fiber must be non-negative").nullable().optional(),
    consumed_at: z.string().datetime("Invalid datetime format").optional(),
    ai_suggestion: z.string().nullable().optional(),
    original_prompt: z.string().nullable().optional(),
    is_image_analyzed: z.boolean().nullable().optional(),
    last_ai_context: z.any().nullable().optional(), // Json type
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided for update" });

/**
 * PATCH /api/meals/[id]
 * Updates an existing meal.
 * Path param: id (UUID)
 * Body: UpdateMealCommand (partial JSON)
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // Get authenticated user
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Validate meal ID parameter
    const idValidation = uuidSchema.safeParse(params.id);

    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid meal ID",
          details: idValidation.error.flatten().formErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mealId = idValidation.data;

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
    const validationResult = updateMealSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update meal using service
    const mealService = new MealService(locals.supabase);
    const command: UpdateMealCommand = validationResult.data;
    const updatedMeal = await mealService.updateMeal(userId, mealId, command);

    // Check if meal was found and updated
    if (!updatedMeal) {
      return new Response(JSON.stringify({ error: "Meal not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedMeal), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error updating meal:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * DELETE /api/meals/[id]
 * Deletes an existing meal.
 * Path param: id (UUID)
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Get authenticated user
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Validate meal ID parameter
    const idValidation = uuidSchema.safeParse(params.id);

    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid meal ID",
          details: idValidation.error.flatten().formErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mealId = idValidation.data;

    // Delete meal using service
    const mealService = new MealService(locals.supabase);
    const deleted = await mealService.deleteMeal(userId, mealId);

    // Check if meal was found and deleted
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Meal not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 204 No Content on successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
