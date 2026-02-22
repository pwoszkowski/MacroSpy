import type { APIRoute } from "astro";
import { z } from "zod";
import { FavoritesService } from "../../../lib/services/favorites.service";
import { updateFavoriteSchema } from "../../../lib/schemas/favorites";
import type { UpdateFavoriteCommand } from "../../../types";

export const prerender = false;

const favoriteIdSchema = z.string().uuid("Invalid favorite ID format");

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const idValidation = favoriteIdSchema.safeParse(params.id);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid favorite ID",
          details: idValidation.error.flatten().formErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bodyValidation = updateFavoriteSchema.safeParse(body);
    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: bodyValidation.error.flatten().fieldErrors,
          formErrors: bodyValidation.error.flatten().formErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const favoritesService = new FavoritesService(locals.supabase);
    const command: UpdateFavoriteCommand = bodyValidation.data;
    const updatedFavorite = await favoritesService.update(user.id, idValidation.data, command);

    if (!updatedFavorite) {
      return new Response(JSON.stringify({ error: "Resource not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedFavorite), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating favorite:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const idValidation = favoriteIdSchema.safeParse(params.id);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid favorite ID",
          details: idValidation.error.flatten().formErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const favoritesService = new FavoritesService(locals.supabase);
    const deleted = await favoritesService.delete(user.id, idValidation.data);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Resource not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
