import type { SupabaseClient } from "../../db/supabase.client";
import type { Meal, MealDto, MealListResponse, MealSummary, CreateMealCommand, UpdateMealCommand } from "../../types";

/**
 * Service for managing user meals (CRUD operations).
 * Ensures data isolation by user_id.
 */
export class MealService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get meals for a specific user and date, with aggregated summary.
   * @param userId - User ID from authenticated session
   * @param date - Date in YYYY-MM-DD format (default: today)
   * @returns MealListResponse with meals array and summary
   */
  async getMealsByDate(userId: string, date?: string): Promise<MealListResponse> {
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Query meals for the user on the specified date
    const { data: meals, error } = await this.supabase
      .from("meals")
      .select("id, name, calories, protein, fat, carbs, fiber, ai_suggestion, consumed_at")
      .eq("user_id", userId)
      .gte("consumed_at", `${targetDate}T00:00:00.000Z`)
      .lt("consumed_at", this.getNextDay(targetDate))
      .order("consumed_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch meals: ${error.message}`);
    }

    // Calculate summary (aggregate on application side)
    const summary = this.calculateSummary(meals || []);

    return {
      data: (meals || []) as MealDto[],
      summary,
    };
  }

  /**
   * Create a new meal for the user.
   * @param userId - User ID from authenticated session
   * @param command - Meal data to create
   * @returns Created MealDto
   */
  async createMeal(userId: string, command: CreateMealCommand): Promise<MealDto> {
    const { data: meal, error } = await this.supabase
      .from("meals")
      .insert({
        user_id: userId,
        name: command.name,
        calories: command.calories,
        protein: command.protein,
        fat: command.fat,
        carbs: command.carbs,
        fiber: command.fiber ?? null,
        consumed_at: command.consumed_at,
        ai_suggestion: command.ai_suggestion ?? null,
        original_prompt: command.original_prompt ?? null,
        is_image_analyzed: command.is_image_analyzed ?? null,
        last_ai_context: command.last_ai_context ?? null,
      })
      .select("id, name, calories, protein, fat, carbs, fiber, ai_suggestion, consumed_at")
      .single();

    if (error) {
      throw new Error(`Failed to create meal: ${error.message}`);
    }

    if (!meal) {
      throw new Error("Failed to create meal: No data returned");
    }

    return meal as MealDto;
  }

  /**
   * Update an existing meal. Only the owner can update their meals.
   * @param userId - User ID from authenticated session
   * @param mealId - Meal ID to update
   * @param command - Partial meal data to update
   * @returns Updated MealDto or null if not found/unauthorized
   */
  async updateMeal(userId: string, mealId: string, command: UpdateMealCommand): Promise<MealDto | null> {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {};

    if (command.name !== undefined) updateData.name = command.name;
    if (command.calories !== undefined) updateData.calories = command.calories;
    if (command.protein !== undefined) updateData.protein = command.protein;
    if (command.fat !== undefined) updateData.fat = command.fat;
    if (command.carbs !== undefined) updateData.carbs = command.carbs;
    if (command.fiber !== undefined) updateData.fiber = command.fiber;
    if (command.consumed_at !== undefined) updateData.consumed_at = command.consumed_at;
    if (command.ai_suggestion !== undefined) updateData.ai_suggestion = command.ai_suggestion;
    if (command.original_prompt !== undefined) updateData.original_prompt = command.original_prompt;
    if (command.is_image_analyzed !== undefined) updateData.is_image_analyzed = command.is_image_analyzed;
    if (command.last_ai_context !== undefined) updateData.last_ai_context = command.last_ai_context;

    // Update with user_id check for security
    const { data: meal, error } = await this.supabase
      .from("meals")
      .update(updateData)
      .eq("id", mealId)
      .eq("user_id", userId) // Security: ensure user owns the meal
      .select("id, name, calories, protein, fat, carbs, fiber, ai_suggestion, consumed_at")
      .single();

    if (error) {
      // Check if error is due to no rows found
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to update meal: ${error.message}`);
    }

    return meal as MealDto;
  }

  /**
   * Delete a meal. Only the owner can delete their meals.
   * @param userId - User ID from authenticated session
   * @param mealId - Meal ID to delete
   * @returns true if deleted, false if not found/unauthorized
   */
  async deleteMeal(userId: string, mealId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("meals")
      .delete({ count: "exact" })
      .eq("id", mealId)
      .eq("user_id", userId); // Security: ensure user owns the meal

    if (error) {
      throw new Error(`Failed to delete meal: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  /**
   * Calculate summary of macronutrients from meals array.
   * @param meals - Array of meals
   * @returns MealSummary with totals
   */
  private calculateSummary(meals: Partial<Meal>[]): MealSummary {
    return meals.reduce(
      (acc, meal) => ({
        total_calories: acc.total_calories + (meal.calories ?? 0),
        total_protein: acc.total_protein + (meal.protein ?? 0),
        total_fat: acc.total_fat + (meal.fat ?? 0),
        total_carbs: acc.total_carbs + (meal.carbs ?? 0),
        total_fiber: acc.total_fiber + (meal.fiber ?? 0),
      }),
      {
        total_calories: 0,
        total_protein: 0,
        total_fat: 0,
        total_carbs: 0,
        total_fiber: 0,
      }
    );
  }

  /**
   * Get next day in YYYY-MM-DD format for date range queries.
   * @param dateString - Date in YYYY-MM-DD format
   * @returns Next day timestamp
   */
  private getNextDay(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return `${date.toISOString().split("T")[0]}T00:00:00.000Z`;
  }
}
