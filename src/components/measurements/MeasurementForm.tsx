import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { measurementFormSchema, type MeasurementFormValues } from "./schemas";

interface MeasurementFormProps {
  onSubmit: (data: MeasurementFormValues) => Promise<void>;
  onCancel: () => void;
}

export function MeasurementForm({ onSubmit, onCancel }: MeasurementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      weight: undefined,
      body_fat_percentage: null,
      muscle_percentage: null,
    },
  });

  const onSubmitHandler = async (data: MeasurementFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Data *</Label>
        <Input id="date" type="date" {...register("date")} aria-invalid={!!errors.date} />
        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Waga (kg) *</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          placeholder="np. 75.5"
          {...register("weight", { valueAsNumber: true })}
          aria-invalid={!!errors.weight}
        />
        {errors.weight && <p className="text-sm text-red-500">{errors.weight.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body_fat_percentage">Procent tłuszczu (%)</Label>
        <Input
          id="body_fat_percentage"
          type="number"
          step="0.1"
          placeholder="np. 20.5"
          {...register("body_fat_percentage", {
            setValueAs: (v) => (v === "" ? null : parseFloat(v)),
          })}
          aria-invalid={!!errors.body_fat_percentage}
        />
        {errors.body_fat_percentage && <p className="text-sm text-red-500">{errors.body_fat_percentage.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="muscle_percentage">Procent mięśni (%)</Label>
        <Input
          id="muscle_percentage"
          type="number"
          step="0.1"
          placeholder="np. 40.5"
          {...register("muscle_percentage", {
            setValueAs: (v) => (v === "" ? null : parseFloat(v)),
          })}
          aria-invalid={!!errors.muscle_percentage}
        />
        {errors.muscle_percentage && <p className="text-sm text-red-500">{errors.muscle_percentage.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>
    </form>
  );
}
