import type { APIRoute } from "astro";
import { z } from "zod";
import { createAiService } from "../../../lib/services/ai.service";
import type { TDEECalculationRequest } from "../../../types";

export const prerender = false;

/**
 * Zod schema for TDEE calculation request validation
 */
const TDEECalculationRequestSchema = z.object({
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Gender must be 'male' or 'female'" }),
  }),
  weight_kg: z
    .number()
    .positive("Weight must be a positive number")
    .min(20, "Weight must be at least 20 kg")
    .max(500, "Weight must be less than 500 kg"),
  height_cm: z
    .number()
    .positive("Height must be a positive number")
    .min(100, "Height must be at least 100 cm")
    .max(300, "Height must be less than 300 cm"),
  age: z
    .number()
    .int("Age must be a whole number")
    .positive("Age must be a positive number")
    .min(13, "Age must be at least 13 years")
    .max(120, "Age must be less than 120 years"),
  activity_level: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"], {
    errorMap: () => ({
      message:
        "Activity level must be one of: sedentary, lightly_active, moderately_active, very_active, extremely_active",
    }),
  }),
});

/**
 * POST /api/ai/calculate-tdee
 *
 * Calculates Total Daily Energy Expenditure (TDEE) and suggests optimal macronutrient targets.
 * Uses hybrid approach: mathematical calculations (Mifflin-St Jeor) + AI recommendations.
 *
 * Authentication: Not required (public endpoint for onboarding)
 * Rate limiting: Strongly recommended
 *
 * Activity levels:
 * - sedentary: Little to no exercise
 * - lightly_active: Light exercise 1-3 days/week
 * - moderately_active: Moderate exercise 3-5 days/week
 * - very_active: Hard exercise 6-7 days/week
 * - extremely_active: Very hard exercise, physical job, or training twice per day
 *
 * Request body:
 * {
 *   "gender": "male",
 *   "weight_kg": 75,
 *   "height_cm": 180,
 *   "age": 30,
 *   "activity_level": "moderately_active"
 * }
 *
 * Response:
 * {
 *   "bmr": 1750,
 *   "tdee": 2712,
 *   "suggested_targets": {
 *     "calories": 2712,
 *     "protein": 150,
 *     "fat": 75,
 *     "carbs": 340,
 *     "fiber": 30
 *   }
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Step 1: Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validation = TDEECalculationRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid request data",
          details: validation.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const tdeeRequest = validation.data as TDEECalculationRequest;

    // Step 2: Call AI service for TDEE calculation
    try {
      const aiService = createAiService();
      const result = await aiService.calculateTDEE(tdeeRequest);

      // Step 3: Return successful response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (aiError) {
      // AI service specific errors
      console.error("AI Service Error:", aiError);

      const errorMessage = aiError instanceof Error ? aiError.message : "TDEE calculation failed";

      return new Response(
        JSON.stringify({
          error: "AI Service Error",
          message: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    // Unexpected errors
    console.error("Unexpected error in /api/ai/calculate-tdee:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
