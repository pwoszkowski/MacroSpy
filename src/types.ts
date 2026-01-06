import type { Database, Json } from './db/database.types';

// ==========================================
// 1. Database Entity Helpers
// ==========================================

/**
 * Helper type to extract Row definitions from the Supabase Database type.
 */
export type TableRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

/**
 * Raw Database Entities
 * Directly mapped to Supabase tables.
 */
export type Profile = TableRow<'profiles'>;
export type DietaryGoal = TableRow<'dietary_goals'>;
export type Meal = TableRow<'meals'>;
export type BodyMeasurement = TableRow<'body_measurements'>;


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
  | 'id'
  | 'name'
  | 'calories'
  | 'protein'
  | 'fat'
  | 'carbs'
  | 'fiber'
  | 'ai_suggestion'
  | 'consumed_at'
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
 * Omits system fields (id, created_at, user_id) and updated_at.
 */
export type CreateMealCommand = Omit<
  Meal,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'fiber'
> & {
  // Enforce fiber as number (nullable in DB, but usually required 0+ in logic, assuming optional in input means 0 or handled)
  // However, based on API Plan logic 4.1, fiber must be >= 0.
  // We allow null in DB, but let's make it optional in input, defaulting to null or 0 in backend.
  fiber?: number | null; 
};

/**
 * Command to update an existing meal.
 */
export type UpdateMealCommand = Partial<CreateMealCommand>;


// ==========================================
// 4. Dietary Goals & Profile
// ==========================================

export type ProfileDto = Pick<Profile, 'height' | 'gender' | 'birth_date'>;

/**
 * Represents the active dietary goal settings.
 */
export type DietaryGoalDto = Pick<
  DietaryGoal,
  | 'calories_target'
  | 'protein_target'
  | 'fat_target'
  | 'carbs_target'
  | 'fiber_target'
  | 'start_date'
>;

export interface UserProfileResponse {
  profile: ProfileDto;
  current_goal: DietaryGoalDto | null;
}

export type UpdateProfileCommand = ProfileDto;

export type SetDietaryGoalCommand = DietaryGoalDto;


// ==========================================
// 5. Body Measurements
// ==========================================

export type MeasurementDto = Pick<
  BodyMeasurement,
  'id' | 'date' | 'weight' | 'body_fat_percentage' | 'muscle_percentage'
>;

/**
 * Command to log a new measurement.
 */
export type LogMeasurementCommand = Omit<
  BodyMeasurement,
  'id' | 'created_at' | 'user_id'
>;

