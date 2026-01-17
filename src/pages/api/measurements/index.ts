import type { APIRoute } from "astro";
import { z } from "zod";
import { MeasurementService } from "../../../lib/services/measurement.service";
import type { LogMeasurementCommand } from "../../../types";

export const prerender = false;

/**
 * Zod schema for validating LogMeasurementCommand
 */
const logMeasurementSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  weight: z.number().positive("Weight must be greater than 0"),
  body_fat_percentage: z
    .number()
    .min(0, "Body fat percentage must be between 0 and 100")
    .max(100, "Body fat percentage must be between 0 and 100")
    .nullable()
    .optional(),
  muscle_percentage: z
    .number()
    .min(0, "Muscle percentage must be between 0 and 100")
    .max(100, "Muscle percentage must be between 0 and 100")
    .nullable()
    .optional(),
});

/**
 * GET /api/measurements
 * Retrieves measurement history for the authenticated user.
 * Query params:
 *   - limit: Maximum number of records to return (default: 30)
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = locals.user.id;

    // Parse and validate query parameter
    const limitParam = url.searchParams.get("limit");
    let limit = 30; // default

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return new Response(
          JSON.stringify({
            error: "Invalid limit parameter",
            message: "Limit must be a number between 1 and 100",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      limit = parsedLimit;
    }

    // Fetch measurements using service
    const measurementService = new MeasurementService(locals.supabase);
    const measurements = await measurementService.getMeasurements(userId, limit);

    return new Response(JSON.stringify(measurements), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching measurements:", error);
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
 * POST /api/measurements
 * Creates a new body measurement for the authenticated user.
 * Body: LogMeasurementCommand (JSON)
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
    const validationResult = logMeasurementSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log measurement using service
    const measurementService = new MeasurementService(locals.supabase);
    const command: LogMeasurementCommand = {
      date: validationResult.data.date,
      weight: validationResult.data.weight,
      body_fat_percentage: validationResult.data.body_fat_percentage ?? null,
      muscle_percentage: validationResult.data.muscle_percentage ?? null,
    };
    const createdMeasurement = await measurementService.logMeasurement(userId, command);

    return new Response(JSON.stringify(createdMeasurement), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error logging measurement:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
