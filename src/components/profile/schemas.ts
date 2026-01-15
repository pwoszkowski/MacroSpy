import { z } from "zod";

/**
 * Zod schema dla formularza danych biometrycznych
 */
export const bioDataSchema = z.object({
  height: z.coerce.number().min(50, "Wzrost musi być większy niż 50 cm").max(300, "Wzrost musi być mniejszy niż 300 cm"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Wybierz płeć" }),
  }),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Wymagany format YYYY-MM-DD")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        return calculatedAge >= 10 && calculatedAge <= 120;
      },
      { message: "Wiek musi być w przedziale 10-120 lat" }
    ),
});

/**
 * Typ dla formularza danych biometrycznych
 */
export type BioDataFormValues = z.infer<typeof bioDataSchema>;

/**
 * Zod schema dla formularza celów dietetycznych
 */
export const dietaryGoalsSchema = z.object({
  calories_target: z.coerce.number().min(500, "Minimum 500 kalorii").max(10000, "Maksimum 10000 kalorii"),
  protein_target: z.coerce.number().min(0, "Białko nie może być ujemne"),
  fat_target: z.coerce.number().min(0, "Tłuszcz nie może być ujemny"),
  carbs_target: z.coerce.number().min(0, "Węglowodany nie mogą być ujemne"),
  fiber_target: z.coerce.number().min(0, "Błonnik nie może być ujemny").optional(),
});

/**
 * Typ dla formularza celów dietetycznych
 */
export type DietaryGoalsFormValues = z.infer<typeof dietaryGoalsSchema>;

/**
 * Input dla kalkulatora TDEE (lokalny stan modala)
 */
export interface CalculatorInputs {
  weight: number;
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
}

/**
 * Schemat dla kalkulatora TDEE
 */
export const calculatorInputsSchema = z.object({
  weight: z.coerce.number().min(20, "Waga musi być większa niż 20 kg").max(300, "Waga musi być mniejsza niż 300 kg"),
  activity_level: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"], {
    errorMap: () => ({ message: "Wybierz poziom aktywności" }),
  }),
});

/**
 * Typ motywu
 */
export type Theme = "light" | "dark" | "system";
