import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "./schemas";
import { Loader2, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormValues) => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  onBack,
  isLoading = false,
  error,
  success
}: ForgotPasswordFormProps) {
  const submitHandler = onSubmit || (async (data: ForgotPasswordFormValues) => {
    // Placeholder - backend będzie zaimplementowany później
    console.log("Forgot password attempt:", data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja API call
  });

  const backHandler = onBack || (() => {
    // Placeholder - nawigacja będzie zaimplementowana później
    console.log("Back to login");
    window.location.href = "/login";
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmitHandler = async (data: ForgotPasswordFormValues) => {
    try {
      await submitHandler(data);
    } catch (error) {
      console.error("Forgot password form submission error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Resetowanie hasła</h2>
        <p className="text-muted-foreground">
          Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła
        </p>
      </div>

      {/* Formularz */}
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        {/* Sukces */}
        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-md">
            {success}
          </div>
        )}

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

        {/* Przycisk wysyłania */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wysyłanie...
            </>
          ) : (
            "Wyślij link resetujący"
          )}
        </Button>
      </form>

      {/* Link powrotu */}
      <div className="text-center">
        <button
          type="button"
          onClick={backHandler}
          className="inline-flex items-center text-sm text-primary hover:underline font-medium"
          disabled={isLoading || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do logowania
        </button>
      </div>
    </div>
  );
}