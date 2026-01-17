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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submitHandler = onSubmit || (async (data: RegisterFormValues) => {
    setFormError(null);
    console.log('Submitting register form:', data);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.error || 'Wystąpił błąd podczas rejestracji');
    }

    const successData = await response.json();
    console.log('Success data:', successData);

    // If registration requires email confirmation, show success message
    if (successData.requiresConfirmation) {
      setRegistrationSuccess(true);
      toast.success("Konto zostało utworzone! Sprawdź swoją skrzynkę email i kliknij w link potwierdzający.");
    } else {
      // If no confirmation needed, redirect will be handled by page refresh or navigation
      window.location.reload(); // Reload to trigger middleware redirect
    }
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
      setFormError(null);
      await submitHandler(data);
    } catch (error) {
      console.error("Register form submission error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas rejestracji';
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Show success message after successful registration
  if (registrationSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            Konto zostało utworzone!
          </h2>
          <p className="text-muted-foreground">
            Wysłaliśmy link potwierdzający na Twój adres email. Kliknij w niego, aby aktywować konto i móc się zalogować.
          </p>
          <div className="pt-4">
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Przejdź do logowania
            </a>
          </div>
        </div>
      </div>
    );
  }

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
        {(error || formError) && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
            {error || formError}
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