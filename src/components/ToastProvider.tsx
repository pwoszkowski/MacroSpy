import { Toaster } from "@/components/ui/sonner";

/**
 * Wrapper komponentu Toaster dla toast notifications.
 * Używany w Layout.astro do obsługi powiadomień w całej aplikacji.
 */
export function ToastProvider() {
  return <Toaster position="top-center" richColors />;
}
