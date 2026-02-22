import { z } from "zod";

const nameSchema = z.string().trim().min(3, "Nazwa musi mieć co najmniej 3 znaki").max(255, "Nazwa jest za długa");

const nonNegativeNumberSchema = z.coerce.number().min(0, "Wartość musi być nieujemna");

const consumedAtSchema = z
  .string()
  .trim()
  .min(1, "Data i godzina są wymagane")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Nieprawidłowa data i godzina");

export const editFavoriteFormSchema = z.object({
  name: nameSchema,
  calories: nonNegativeNumberSchema,
  protein: nonNegativeNumberSchema,
  fat: nonNegativeNumberSchema,
  carbs: nonNegativeNumberSchema,
  fiber: nonNegativeNumberSchema,
});

export const logFavoriteFormSchema = editFavoriteFormSchema.extend({
  consumed_at: consumedAtSchema,
});

export type EditFavoriteFormValues = z.infer<typeof editFavoriteFormSchema>;
export type LogFavoriteFormValues = z.infer<typeof logFavoriteFormSchema>;
