import type { APIRoute } from "astro";
import { z } from "zod";
import { ProfileService } from "../../../lib/services/profile.service";
import type { UpdateProfileCommand } from "../../../types";

export const prerender = false;

/**
 * Zod schema for validating UpdateProfileCommand
 */
const updateProfileSchema = z.object({
  height: z
    .number()
    .int("Height must be an integer")
    .min(50, "Height must be at least 50 cm")
    .max(300, "Height must be at most 300 cm"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Gender must be 'male' or 'female'" }),
  }),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      },
      { message: "Age must be between 13 and 120 years" }
    ),
});

/**
 * PUT /api/profile
 * Updates the authenticated user's profile data (height, gender, birth_date).
 * Body: UpdateProfileCommand (JSON)
 */
export const PUT: APIRoute = async ({ request, locals }) => {
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
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update profile using service
    const profileService = new ProfileService(locals.supabase);
    const command: UpdateProfileCommand = validationResult.data;
    const updatedProfile = await profileService.updateProfile(userId, command);

    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
