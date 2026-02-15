import { z } from "zod";

export const composerMealSchema = z.object({
  name: z.string().trim().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  calories: z.coerce.number().min(0, "Kalorie muszą być nieujemne"),
  protein: z.coerce.number().min(0, "Białko musi być nieujemne"),
  fat: z.coerce.number().min(0, "Tłuszcze muszą być nieujemne"),
  carbs: z.coerce.number().min(0, "Węglowodany muszą być nieujemne"),
  fiber: z.coerce.number().min(0, "Błonnik musi być nieujemny"),
});

export type ComposerMealValues = z.infer<typeof composerMealSchema>;
