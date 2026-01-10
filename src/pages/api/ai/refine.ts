import type { APIRoute } from "astro";
import { z } from "zod";
import { createAiService } from "../../../lib/services/ai.service";
import type { RefineMealRequest } from "../../../types";

export const prerender = false;

/**
 * Zod schema for meal refinement request validation
 */
const RefineMealRequestSchema = z.object({
  previous_context: z.any(), // JSON from previous AI response
  correction_prompt: z
    .string()
    .min(2, "Correction prompt must be at least 2 characters long")
    .max(1000, "Correction prompt is too long"),
});

/**
 * POST /api/ai/refine
 *
 * Refines a previously analyzed meal based on user corrections or clarifications.
 * This endpoint allows for iterative refinement of meal analysis through conversation.
 *
 * Authentication: Not required (will be added later)
 * Rate limiting: Recommended (AI resource protection)
 *
 * Request body:
 * {
 *   "previous_context": { ... }, // Full ai_context from previous analyze/refine response
 *   "correction_prompt": "Actually it was a large portion, about 300g"
 * }
 *
 * Response: Same format as /api/ai/analyze
 * {
 *   "name": "Scrambled Eggs with Whole Wheat Toast (Large)",
 *   "calories": 450,
 *   "protein": 28,
 *   ...
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

    const validation = RefineMealRequestSchema.safeParse(body);
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

    const refineMealRequest = validation.data as RefineMealRequest;

    // Step 2: Validate previous_context exists
    if (!refineMealRequest.previous_context) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "previous_context is required for meal refinement",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Call AI service
    try {
      const aiService = createAiService();
      const result = await aiService.refineMeal(refineMealRequest);

      // Step 4: Return successful response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (aiError) {
      // AI service specific errors
      console.error("AI Service Error:", aiError);

      const errorMessage = aiError instanceof Error ? aiError.message : "AI refinement failed";

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
    console.error("Unexpected error in /api/ai/refine:", error);

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
