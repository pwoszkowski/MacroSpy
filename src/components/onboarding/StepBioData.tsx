/**
 * Krok 1: Formularz zbierający podstawowe dane biometryczne
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateAge, type BioData, type Gender } from "@/types/onboarding";

interface StepBioDataProps {
  data: BioData;
  onUpdate: (data: Partial<BioData>) => void;
  errors?: Partial<Record<keyof BioData, string>>;
}

export function StepBioData({ data, onUpdate, errors = {} }: StepBioDataProps) {
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof BioData, string>>>({});

  const validateBirthDate = (birthDate: string): string | null => {
    if (!birthDate) return "Data urodzenia jest wymagana";
    const age = calculateAge(birthDate);
    if (age < 10) return "Musisz mieć co najmniej 10 lat";
    if (age > 120) return "Nieprawidłowa data urodzenia";
    return null;
  };

  const validateHeight = (height: number): string | null => {
    if (!height || height === 0) return "Wzrost jest wymagany";
    if (height < 50) return "Wzrost musi być większy niż 50 cm";
    if (height > 300) return "Wzrost musi być mniejszy niż 300 cm";
    return null;
  };

  const validateWeight = (weight: number): string | null => {
    if (!weight || weight === 0) return "Waga jest wymagana";
    if (weight < 10) return "Waga musi być większa niż 10 kg";
    if (weight > 500) return "Waga musi być mniejsza niż 500 kg";
    return null;
  };
  const handleGenderChange = (value: string) => {
    onUpdate({ gender: value as Gender });
    setValidationErrors((prev) => ({ ...prev, gender: undefined }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onUpdate({ birthDate: value });
    
    if (value) {
      const error = validateBirthDate(value);
      setValidationErrors((prev) => ({ ...prev, birthDate: error || undefined }));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const height = isNaN(value) ? 0 : value;
    onUpdate({ height });
    
    if (e.target.value) {
      const error = validateHeight(height);
      setValidationErrors((prev) => ({ ...prev, height: error || undefined }));
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const weight = isNaN(value) ? 0 : value;
    onUpdate({ weight });
    
    if (e.target.value) {
      const error = validateWeight(weight);
      setValidationErrors((prev) => ({ ...prev, weight: error || undefined }));
    }
  };

  // Łączenie błędów z props i lokalnej walidacji
  const displayErrors = { ...validationErrors, ...errors };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Twoje dane biometryczne</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Potrzebujemy kilku informacji, aby obliczyć Twoje zapotrzebowanie kaloryczne
        </p>
      </div>

      {/* Płeć */}
      <div className="space-y-3">
        <Label htmlFor="gender">Płeć</Label>
        <RadioGroup value={data.gender} onValueChange={handleGenderChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="font-normal cursor-pointer">
              Mężczyzna
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="font-normal cursor-pointer">
              Kobieta
            </Label>
          </div>
        </RadioGroup>
        {displayErrors.gender && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{displayErrors.gender}</p>
        )}
      </div>

      {/* Data urodzenia */}
      <div className="space-y-2">
        <Label htmlFor="birthDate">Data urodzenia</Label>
        <Input
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={handleBirthDateChange}
          max={new Date().toISOString().split("T")[0]}
          aria-invalid={!!displayErrors.birthDate}
        />
        {displayErrors.birthDate && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{displayErrors.birthDate}</p>
        )}
      </div>

      {/* Wzrost */}
      <div className="space-y-2">
        <Label htmlFor="height">Wzrost (cm)</Label>
        <Input
          id="height"
          type="number"
          min="50"
          max="300"
          step="1"
          value={data.height || ""}
          onChange={handleHeightChange}
          placeholder="np. 175"
          aria-invalid={!!displayErrors.height}
        />
        {displayErrors.height && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{displayErrors.height}</p>
        )}
      </div>

      {/* Waga */}
      <div className="space-y-2">
        <Label htmlFor="weight">Waga (kg)</Label>
        <Input
          id="weight"
          type="number"
          min="10"
          max="500"
          step="0.1"
          value={data.weight || ""}
          onChange={handleWeightChange}
          placeholder="np. 70"
          aria-invalid={!!displayErrors.weight}
        />
        {displayErrors.weight && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{displayErrors.weight}</p>
        )}
      </div>
    </div>
  );
}
