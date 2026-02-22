import { z } from "zod";

export const favoriteSortValues = ["newest", "name_asc"] as const;

export const listFavoritesQuerySchema = z.object({
  search: z.string().trim().min(1).max(255).optional(),
  sort: z.enum(favoriteSortValues).default("newest"),
});

export const createFavoriteSchema = z.object({
  name: z.string().trim().min(3, "Nazwa musi mieć co najmniej 3 znaki").max(255, "Nazwa jest za długa"),
  calories: z.number().int().min(0, "Kalorie muszą być większe lub równe 0"),
  protein: z.number().min(0, "Białko musi być większe lub równe 0"),
  fat: z.number().min(0, "Tłuszcz musi być większy lub równy 0"),
  carbs: z.number().min(0, "Węglowodany muszą być większe lub równe 0"),
  fiber: z.number().min(0, "Błonnik musi być większy lub równy 0").default(0),
});

export const updateFavoriteSchema = createFavoriteSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Przynajmniej jedno pole jest wymagane do aktualizacji",
});

export type ListFavoritesQueryDTO = z.infer<typeof listFavoritesQuerySchema>;
export type CreateFavoriteDTO = z.infer<typeof createFavoriteSchema>;
export type UpdateFavoriteDTO = z.infer<typeof updateFavoriteSchema>;
