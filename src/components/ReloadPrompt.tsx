import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Informuje o nowej wersji aplikacji i umożliwia przeładowanie.
 */
export function ReloadPrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisterError() {
      toast.error("Nie udało się zarejestrować aktualizacji aplikacji.");
    },
  });
  const [isRefreshNeeded] = needRefresh;
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!isRefreshNeeded) {
      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      return;
    }

    if (toastIdRef.current !== null) {
      return;
    }

    toastIdRef.current = toast.info("Dostępna jest nowa wersja aplikacji.", {
      duration: Infinity,
      action: {
        label: "Odśwież",
        onClick: () => {
          void updateServiceWorker(true);
        },
      },
      onDismiss: () => {
        toastIdRef.current = null;
      },
    });
  }, [isRefreshNeeded, updateServiceWorker]);

  return null;
}
