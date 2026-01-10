import type { APIRoute } from "astro";
import { z } from "zod";
import { createAiService } from "../../../lib/services/ai.service";
import type { AnalyzeMealRequest } from "../../../types";

export const prerender = false;

/**
 * Zod schema for meal analysis request validation
 */
const AnalyzeMealRequestSchema = z.object({
  text_prompt: z.string().min(2, "Text prompt must be at least 2 characters long").max(2000, "Text prompt is too long"),
  images: z.array(z.string()).max(5, "Maximum 5 images allowed").optional(),
});

/**
 * POST /api/ai/analyze
 *
 * Analyzes a meal from text description and/or images using AI.
 *
 * Authentication: Not required (will be added later)
 * Rate limiting: Recommended (AI resource protection)
 *
 * Request body:
 * {
 *   "text_prompt": "2 eggs and whole wheat toast",
 *   "images": ["base64_encoded_image_1", "base64_encoded_image_2"] // optional
 * }
 *
 * Response:
 * {
 *   "name": "Scrambled Eggs with Whole Wheat Toast",
 *   "calories": 350,
 *   "protein": 20,
 *   "fat": 15,
 *   "carbs": 30,
 *   "fiber": 4,
 *   "assistant_response": "Great protein-rich breakfast choice!",
 *   "dietary_suggestion": "Consider adding vegetables for extra nutrients",
 *   "ai_context": { ... }
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

    const validation = AnalyzeMealRequestSchema.safeParse(body);
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

    const analyzeMealRequest = validation.data as AnalyzeMealRequest;

    // Step 2: Call AI service
    try {
      const aiService = createAiService();
      const result = await aiService.analyzeMeal(analyzeMealRequest);

      // Step 3: Return successful response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (aiError) {
      // AI service specific errors
      console.error("AI Service Error:", aiError);

      const errorMessage = aiError instanceof Error ? aiError.message : "AI analysis failed";

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
    console.error("Unexpected error in /api/ai/analyze:", error);

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
