import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MeasurementForm } from "./MeasurementForm";
import type { MeasurementFormValues } from "./schemas";

interface MeasurementLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: MeasurementFormValues) => Promise<void>;
}

export function MeasurementLogDialog({ isOpen, onClose, onSuccess }: MeasurementLogDialogProps) {
  const handleSubmit = async (data: MeasurementFormValues) => {
    await onSuccess(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj pomiar</DialogTitle>
          <DialogDescription>Wprowadź swoją wagę i opcjonalnie procent tłuszczu i mięśni.</DialogDescription>
        </DialogHeader>
        <MeasurementForm onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
