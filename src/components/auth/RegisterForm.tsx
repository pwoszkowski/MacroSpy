import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerSchema, type RegisterFormValues } from "./schemas";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const submitHandler = onSubmit || (async (data: RegisterFormValues) => {
    // Placeholder - backend będzie zaimplementowany później
    console.log("Register attempt:", data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja API call
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmitHandler = async (data: RegisterFormValues) => {
    try {
      await submitHandler(data);
    } catch (error) {
      console.error("Register form submission error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Utwórz konto</h2>
        <p className="text-muted-foreground">
          Dołącz do MacroSpy i zacznij monitorować swoją dietę
        </p>
      </div>

      {/* Formularz */}
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        {/* Błąd ogólny */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            {...register("email")}
            aria-invalid={!!errors.email}
            disabled={isLoading || isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Hasło */}
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 znaków"
              {...register("password")}
              aria-invalid={!!errors.password}
              disabled={isLoading || isSubmitting}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading || isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Potwierdzenie hasła */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Powtórz hasło"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
              disabled={isLoading || isSubmitting}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading || isSubmitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Przycisk rejestracji */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tworzenie konta...
            </>
          ) : (
            "Utwórz konto"
          )}
        </Button>
      </form>

      {/* Linki nawigacyjne */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Masz już konto?{" "}
          <a
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}