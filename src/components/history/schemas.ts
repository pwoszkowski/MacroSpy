import { z } from "zod";

/**
 * Schema for meal form (add/edit).
 * Validates all required nutritional data and consumed_at timestamp.
 */
export const mealFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  calories: z.coerce.number().min(0, "Kalorie muszą być nieujemne"),
  protein: z.coerce.number().min(0, "Białko musi być nieujemne"),
  fat: z.coerce.number().min(0, "Tłuszcze muszą być nieujemne"),
  carbs: z.coerce.number().min(0, "Węglowodany muszą być nieujemne"),
  fiber: z.coerce.number().min(0, "Błonnik musi być nieujemny").optional(),
  consumed_at: z.string().datetime("Nieprawidłowa data i godzina"),
});

export type MealFormValues = z.infer<typeof mealFormSchema>;
