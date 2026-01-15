import type { APIRoute } from "astro";
import { MeasurementService } from "../../../lib/services/measurement.service";

export const prerender = false;

/**
 * DELETE /api/measurements/[id]
 * Deletes a specific measurement for the authenticated user.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // TODO: Add authentication when ready
    // For now, use a test user_id
    const userId = "d9622d1a-756c-442a-aba9-ef94ad49b174";

    // Validate measurement ID
    const measurementId = params.id;
    if (!measurementId) {
      return new Response(
        JSON.stringify({
          error: "Missing measurement ID",
          message: "Measurement ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete measurement using service
    const measurementService = new MeasurementService(locals.supabase);
    await measurementService.deleteMeasurement(userId, measurementId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting measurement:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
