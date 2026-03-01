import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/components/hooks/useNetworkStatus";

/**
 * Wyświetla stan połączenia i sygnalizuje przejścia online/offline.
 */
export function NetworkStatus() {
  const { isOnline } = useNetworkStatus();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isOnline) {
      toast.success("Połączenie z internetem zostało przywrócone.");
      return;
    }

    toast.info("Jesteś offline. Wyświetlam zapisane dane.");
  }, [isOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-100"
    >
      Jesteś offline. Wyświetlam zapisane dane.
    </div>
  );
}
