import type { APIRoute } from "astro";
import { FavoritesLimitExceededError, FavoritesService } from "../../../lib/services/favorites.service";
import { createFavoriteSchema, listFavoritesQuerySchema } from "../../../lib/schemas/favorites";
import type { CreateFavoriteCommand } from "../../../types";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const rawSearch = url.searchParams.get("search");
    const rawSort = url.searchParams.get("sort");

    const queryValidation = listFavoritesQuerySchema.safeParse({
      search: rawSearch && rawSearch.trim().length > 0 ? rawSearch : undefined,
      sort: rawSort ?? undefined,
    });

    if (!queryValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: queryValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const favoritesService = new FavoritesService(locals.supabase);
    const favorites = await favoritesService.getAll(user.id, queryValidation.data);

    return new Response(JSON.stringify(favorites), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
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

    const validation = createFavoriteSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const favoritesService = new FavoritesService(locals.supabase);
    const command: CreateFavoriteCommand = validation.data;
    const createdFavorite = await favoritesService.create(user.id, command);

    return new Response(JSON.stringify(createdFavorite), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof FavoritesLimitExceededError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error creating favorite:", error);
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
