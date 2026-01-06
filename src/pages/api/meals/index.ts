import type { APIRoute } from 'astro';
import { z } from 'zod';
import { MealService } from '../../../lib/services/meal.service';
import type { CreateMealCommand } from '../../../types';

export const prerender = false;

/**
 * Zod schema for validating date query parameter (YYYY-MM-DD format)
 */
const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

/**
 * Zod schema for validating CreateMealCommand
 */
const createMealSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  calories: z.number().min(0, 'Calories must be non-negative'),
  protein: z.number().min(0, 'Protein must be non-negative'),
  fat: z.number().min(0, 'Fat must be non-negative'),
  carbs: z.number().min(0, 'Carbs must be non-negative'),
  fiber: z.number().min(0, 'Fiber must be non-negative').nullable().optional(),
  consumed_at: z.string().datetime('Invalid datetime format'),
  ai_suggestion: z.string().nullable().optional(),
  original_prompt: z.string().nullable().optional(),
  is_image_analyzed: z.boolean().nullable().optional(),
  last_ai_context: z.any().nullable().optional(), // Json type
});

/**
 * GET /api/meals
 * Retrieves meals for a specific date with summary.
 * Query params: date (optional, YYYY-MM-DD format, defaults to today)
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date') || undefined;
    
    const validationResult = dateQuerySchema.safeParse({ date: dateParam });
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid query parameters',
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch meals using service
    const mealService = new MealService(locals.supabase);
    const response = await mealService.getMealsByDate(user.id, validationResult.data.date);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching meals:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/meals
 * Creates a new meal for the authenticated user.
 * Body: CreateMealCommand (JSON)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const validationResult = createMealSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create meal using service
    const mealService = new MealService(locals.supabase);
    const command: CreateMealCommand = validationResult.data;
    const createdMeal = await mealService.createMeal(user.id, command);

    return new Response(
      JSON.stringify(createdMeal),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating meal:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

