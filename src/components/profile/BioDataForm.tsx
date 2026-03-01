import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bioDataSchema, type BioDataFormValues } from "./schemas";
import type { ProfileDto, UpdateProfileCommand } from "@/types";
import { useNetworkStatus } from "@/components/hooks/useNetworkStatus";
import { toast } from "sonner";

interface BioDataFormProps {
  initialData: ProfileDto;
  onSave: (data: UpdateProfileCommand) => Promise<void>;
}

export function BioDataForm({ initialData, onSave }: BioDataFormProps) {
  const { isOnline } = useNetworkStatus();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BioDataFormValues>({
    resolver: zodResolver(bioDataSchema),
    defaultValues: {
      height: initialData.height || undefined,
      gender: initialData.gender || undefined,
      birth_date: initialData.birth_date || "",
    },
  });

  const gender = watch("gender");

  const onSubmitHandler = async (data: BioDataFormValues) => {
    if (!isOnline) {
      toast.error("Połącz się z internetem, aby zapisać dane.");
      return;
    }

    try {
      await onSave(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="height">Wzrost (cm) *</Label>
        <Input id="height" type="number" placeholder="np. 175" {...register("height")} aria-invalid={!!errors.height} />
        {errors.height && <p className="text-sm text-red-500">{errors.height.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Płeć *</Label>
        <Select
          value={gender}
          onValueChange={(value) => setValue("gender", value as "male" | "female", { shouldValidate: true })}
        >
          <SelectTrigger id="gender" aria-invalid={!!errors.gender}>
            <SelectValue placeholder="Wybierz płeć" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Mężczyzna</SelectItem>
            <SelectItem value="female">Kobieta</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Data urodzenia *</Label>
        <Input id="birth_date" type="date" {...register("birth_date")} aria-invalid={!!errors.birth_date} />
        {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date.message}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting || !isOnline}>
          {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
      {!isOnline && <p className="text-sm text-destructive">Połącz się z internetem, aby zapisać dane.</p>}
    </form>
  );
}
