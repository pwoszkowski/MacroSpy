import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateFavoriteCommand, FavoriteMealDto, ListFavoritesQuery, UpdateFavoriteCommand } from "../../types";

const FAVORITES_LIMIT = 100;

export class FavoritesLimitExceededError extends Error {
  constructor() {
    super("Osiągnięto limit 100 ulubionych posiłków.");
    this.name = "FavoritesLimitExceededError";
  }
}

export class FavoritesService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAll(userId: string, query: ListFavoritesQuery): Promise<FavoriteMealDto[]> {
    let request = this.supabase
      .from("favorite_meals")
      .select("id, name, calories, protein, fat, carbs, fiber, created_at")
      .eq("user_id", userId);

    const normalizedSearch = query.search?.trim();
    if (normalizedSearch) {
      request = request.ilike("name", `%${normalizedSearch}%`);
    }

    request =
      query.sort === "name_asc"
        ? request.order("name", { ascending: true })
        : request.order("created_at", { ascending: false });

    const { data, error } = await request;

    if (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }

    return (data ?? []) as FavoriteMealDto[];
  }

  /**
   * Backward-compatible alias.
   * TODO: remove when all usages are migrated to getAll.
   */
  async findAll(userId: string, query: ListFavoritesQuery): Promise<FavoriteMealDto[]> {
    return this.getAll(userId, query);
  }

  async create(userId: string, command: CreateFavoriteCommand): Promise<FavoriteMealDto> {
    const { count, error: countError } = await this.supabase
      .from("favorite_meals")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", userId);

    if (countError) {
      throw new Error(`Failed to check favorites limit: ${countError.message}`);
    }

    if ((count ?? 0) >= FAVORITES_LIMIT) {
      throw new FavoritesLimitExceededError();
    }

    const { data, error } = await this.supabase
      .from("favorite_meals")
      .insert({
        user_id: userId,
        name: command.name,
        calories: command.calories,
        protein: command.protein,
        fat: command.fat,
        carbs: command.carbs,
        fiber: command.fiber ?? 0,
      })
      .select("id, name, calories, protein, fat, carbs, fiber, created_at")
      .single();

    if (error) {
      throw new Error(`Failed to create favorite: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create favorite: No data returned");
    }

    return data as FavoriteMealDto;
  }

  async update(userId: string, favoriteId: string, command: UpdateFavoriteCommand): Promise<FavoriteMealDto | null> {
    const updateData: Record<string, unknown> = {};

    if (command.name !== undefined) updateData.name = command.name;
    if (command.calories !== undefined) updateData.calories = command.calories;
    if (command.protein !== undefined) updateData.protein = command.protein;
    if (command.fat !== undefined) updateData.fat = command.fat;
    if (command.carbs !== undefined) updateData.carbs = command.carbs;
    if (command.fiber !== undefined) updateData.fiber = command.fiber;

    const { data, error } = await this.supabase
      .from("favorite_meals")
      .update(updateData)
      .eq("id", favoriteId)
      .eq("user_id", userId)
      .select("id, name, calories, protein, fat, carbs, fiber, created_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to update favorite: ${error.message}`);
    }

    return data as FavoriteMealDto;
  }

  async delete(userId: string, favoriteId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from("favorite_meals")
      .delete({ count: "exact" })
      .eq("id", favoriteId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete favorite: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
