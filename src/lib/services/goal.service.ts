import type { SupabaseClient } from "../../db/supabase.client";
import type { DietaryGoalDto, SetDietaryGoalCommand } from "../../types";

/**
 * Service for managing user dietary goals.
 * Handles CRUD operations for nutritional targets with effective dates.
 */
export class GoalService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get the current active dietary goal for a user.
   * Returns the most recent goal where start_date <= today.
   * @param userId - User ID from authenticated session
   * @returns DietaryGoalDto or null if no active goal exists
   */
  async getCurrentGoal(userId: string): Promise<DietaryGoalDto | null> {
    const today = new Date().toISOString().split("T")[0];

    const { data: goal, error } = await this.supabase
      .from("dietary_goals")
      .select("calories_target, protein_target, fat_target, carbs_target, fiber_target, start_date")
      .eq("user_id", userId)
      .lte("start_date", today)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Check if error is due to no rows found
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch current goal: ${error.message}`);
    }

    return goal as DietaryGoalDto;
  }

  /**
   * Create a new dietary goal for a user.
   * The goal will become active based on its start_date.
   * @param userId - User ID from authenticated session
   * @param command - Goal data to create
   * @returns Created DietaryGoalDto
   */
  async createGoal(userId: string, command: SetDietaryGoalCommand): Promise<DietaryGoalDto> {
    const { data: goal, error } = await this.supabase
      .from("dietary_goals")
      .insert({
        user_id: userId,
        start_date: command.start_date,
        calories_target: command.calories_target,
        protein_target: command.protein_target,
        fat_target: command.fat_target,
        carbs_target: command.carbs_target,
        fiber_target: command.fiber_target ?? null,
      })
      .select("calories_target, protein_target, fat_target, carbs_target, fiber_target, start_date")
      .single();

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    if (!goal) {
      throw new Error("Failed to create goal: No data returned");
    }

    return goal as DietaryGoalDto;
  }
}
