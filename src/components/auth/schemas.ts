import { z } from "zod";

/**
 * Zod schema for login form validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Podaj prawidłowy adres email"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Zod schema for registration form validation
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Podaj prawidłowy adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)|(?=.*[@$!%*?&])/, "Hasło powinno zawierać małe i wielkie litery lub cyfry lub znaki specjalne"),
  confirmPassword: z
    .string()
    .min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Zod schema for forgot password form validation
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Podaj prawidłowy adres email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;