import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "./schemas";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onSubmit?: (data: LoginFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const submitHandler =
    onSubmit ||
    (async (data: LoginFormValues) => {
      setFormError(null);
      console.log("Submitting login form:", data);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data:", errorData);
        throw new Error(errorData.error || "Wystąpił błąd podczas logowania");
      }

      const successData = await response.json();
      console.log("Success data:", successData);

      // Successful login - redirect will be handled by page refresh or navigation
      window.location.reload(); // Reload to trigger middleware redirect
    });

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmitHandler = async (data: LoginFormValues) => {
    try {
      setFormError(null);
      await submitHandler(data);
      toast.success("Zalogowano pomyślnie!");
    } catch (error) {
      console.error("Login form submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas logowania";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Witaj ponownie</h2>
        <p className="text-muted-foreground">Zaloguj się do swojego konta MacroSpy</p>
      </div>

      {/* Formularz */}
      <form method="post" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
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
            <p className="text-sm text-destructive animate-in fade-in duration-200">{errors.email.message}</p>
          )}
        </div>

        {/* Hasło */}
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Wprowadź hasło"
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive animate-in fade-in duration-200">{errors.password.message}</p>
          )}
        </div>

        {/* Przycisk logowania */}
        <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logowanie...
            </>
          ) : (
            "Zaloguj się"
          )}
        </Button>
      </form>

      {/* Linki nawigacyjne */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <a href="/register" className="text-primary hover:underline font-medium">
            Zarejestruj się
          </a>
        </p>
        <p className="text-sm">
          <a href="/forgot-password" className="text-primary hover:underline font-medium">
            Zapomniałeś hasła?
          </a>
        </p>
      </div>
    </div>
  );
}
