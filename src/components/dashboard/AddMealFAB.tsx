import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddMealFABProps {
  onClick: () => void;
}

/**
 * Floating Action Button for quick meal addition.
 * Positioned at bottom-right corner of the viewport.
 */
export function AddMealFAB({ onClick }: AddMealFABProps) {
  return (
    <Button
      size="lg"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg hover:shadow-xl transition-shadow z-50"
      onClick={onClick}
      aria-label="Dodaj posiłek"
    >
      <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
    </Button>
  );
}
