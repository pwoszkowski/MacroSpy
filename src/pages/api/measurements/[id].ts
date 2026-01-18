import type { APIRoute } from "astro";
import { MeasurementService } from "../../../lib/services/measurement.service";

export const prerender = false;

/**
 * DELETE /api/measurements/[id]
 * Deletes a specific measurement for the authenticated user.
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
