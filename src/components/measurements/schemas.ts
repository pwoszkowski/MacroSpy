import { z } from "zod";

/**
 * Zod schema for measurement form validation
 */
export const measurementFormSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Wymagany format YYYY-MM-DD")
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return selectedDate <= today;
      },
      { message: "Data nie może być z przyszłości" }
    ),
  weight: z
    .number({ invalid_type_error: "Waga jest wymagana" })
    .positive("Waga musi być dodatnia")
    .min(20, "Waga musi być większa niż 20 kg")
    .max(300, "Waga musi być mniejsza niż 300 kg"),
  body_fat_percentage: z
    .number()
    .min(0, "Procent tłuszczu musi być między 0 a 100")
    .max(100, "Procent tłuszczu musi być między 0 a 100")
    .optional()
    .nullable(),
  muscle_percentage: z
    .number()
    .min(0, "Procent mięśni musi być między 0 a 100")
    .max(100, "Procent mięśni musi być między 0 a 100")
    .optional()
    .nullable(),
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;
