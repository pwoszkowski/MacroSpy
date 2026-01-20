import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddMealFABProps {
  onClick: () => void;
}

/**
 * Floating Action Button for quick meal addition.
 * Mobile: Centered above bottom navigation bar
 * Desktop: Fixed in bottom-right corner
 */
export function AddMealFAB({ onClick }: AddMealFABProps) {
  return (
    <Button
      size="lg"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 rounded-full w-14 h-14 md:w-16 md:h-16 shadow-lg hover:shadow-xl transition-all z-50"
      onClick={onClick}
      aria-label="Dodaj posiłek"
      data-test-id="add-meal-button"
    >
      <Plus className="h-6 w-6 md:h-7 md:w-7" />
    </Button>
  );
}
