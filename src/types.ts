import type { Database, Json } from "./db/database.types";

// ==========================================
// 1. Database Entity Helpers
// ==========================================

/**
 * Helper type to extract Row definitions from the Supabase Database type.
 */
export type TableRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

/**
 * Raw Database Entities
 * Directly mapped to Supabase tables.
 */
export type Profile = TableRow<"profiles">;
export type DietaryGoal = TableRow<"dietary_goals">;
export type Meal = TableRow<"meals">;
export type FavoriteMeal = TableRow<"favorite_meals">;
export type BodyMeasurement = TableRow<"body_measurements">;

// ==========================================
// 2. AI Services (Ephemeral/Stateless)
// ==========================================

export interface AnalyzeMealRequest {
  text_prompt: string;
  /** Base64 encoded images */
  images?: string[];
}

export interface AnalyzeMealResponse {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number; // API ensures non-negative, DB allows null but AI usually estimates it
  assistant_response: string;
  dietary_suggestion: string;
  ai_context: Json;
}

export interface RefineMealRequest {
  previous_context: Json;
  correction_prompt: string;
}

export interface TDEECalculationRequest {
  gender: string; // 'male' | 'female' - kept generic string to match DB type usually, but API can validate strictness
  weight_kg: number;
  height_cm: number;
  age: number;
  activity_level: string;
}

export interface GoalTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface TDEECalculationResponse {
  bmr: number;
  tdee: number;
  suggested_targets: GoalTargets;
}

// ==========================================
// 3. Meals (Journal)
// ==========================================

/**
 * Data Transfer Object for displaying a meal in a list.
 * Derived from DB Meal entity.
 */
export type MealDto = Pick<
  Meal,
  "id" | "name" | "calories" | "protein" | "fat" | "carbs" | "fiber" | "ai_suggestion" | "consumed_at"
>;

export interface MealSummary {
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_fiber: number;
}

export interface MealListResponse {
  data: MealDto[];
  summary: MealSummary;
}

/**
 * Command to create a new meal.
 * Contains required nutritional data and optional metadata.
 */
export interface CreateMealCommand {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  consumed_at: string;
  // Optional fields
  fiber?: number | null;
  ai_suggestion?: string | null;
  original_prompt?: string | null;
  is_image_analyzed?: boolean | null;
  last_ai_context?: Json | null;
}

/**
 * Command to update an existing meal.
 */
export type UpdateMealCommand = Partial<CreateMealCommand>;

// ==========================================
// 4. Dietary Goals & Profile
// ==========================================

export type ProfileDto = Pick<Profile, "height" | "gender" | "birth_date">;

/**
 * Represents the active dietary goal settings.
 */
export type DietaryGoalDto = Pick<
  DietaryGoal,
  "calories_target" | "protein_target" | "fat_target" | "carbs_target" | "fiber_target" | "start_date"
>;

export interface UserProfileResponse {
  profile: ProfileDto;
  current_goal: DietaryGoalDto | null;
}

export type UpdateProfileCommand = ProfileDto;

export type SetDietaryGoalCommand = DietaryGoalDto;

// ==========================================
// 5. Favorites (Meal Templates)
// ==========================================

/**
 * DTO for favorite meals list/items.
 * Based on favorite_meals table row.
 */
export type FavoriteMealDto = Pick<
  FavoriteMeal,
  "id" | "name" | "calories" | "protein" | "fat" | "carbs" | "fiber" | "created_at"
>;

/**
 * Query DTO for GET /api/favorites.
 */
export interface ListFavoritesQuery {
  search?: string;
  sort?: "newest" | "name_asc";
}

/**
 * Sort options for favorites view and API.
 */
export type SortOption = "newest" | "name_asc";

/**
 * Modal state used in Favorites view.
 */
export interface FavoritesModalState {
  type: "log" | "edit" | "delete" | null;
  selectedId: string | null;
}

/**
 * Command for POST /api/favorites.
 * Uses DB entity fields and removes server-managed columns.
 */
export type CreateFavoriteCommand = Omit<FavoriteMeal, "id" | "user_id" | "created_at" | "updated_at">;

/**
 * Command for PATCH /api/favorites/[id].
 */
export type UpdateFavoriteCommand = Partial<CreateFavoriteCommand>;

// ==========================================
// 6. Body Measurements
// ==========================================

export type MeasurementDto = Pick<
  BodyMeasurement,
  "id" | "date" | "weight" | "body_fat_percentage" | "muscle_percentage"
>;

/**
 * Command to log a new measurement.
 */
export type LogMeasurementCommand = Omit<BodyMeasurement, "id" | "created_at" | "user_id">;
