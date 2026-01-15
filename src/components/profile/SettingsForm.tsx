import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/hooks/useTheme";
import type { Theme } from "./schemas";

export function SettingsForm() {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: Theme; label: string; description: string }[] = [
    {
      value: "light",
      label: "Jasny",
      description: "Zawsze używaj jasnego motywu",
    },
    {
      value: "dark",
      label: "Ciemny",
      description: "Zawsze używaj ciemnego motywu",
    },
    {
      value: "system",
      label: "Systemowy",
      description: "Automatycznie dopasuj do ustawień systemu",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Wygląd</h3>
        <p className="text-sm text-muted-foreground">Dostosuj wygląd aplikacji do swoich preferencji</p>
      </div>

      <div className="space-y-4">
        <Label>Motyw</Label>
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          {themeOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-3">
              <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
              <div className="flex-1 space-y-1">
                <Label htmlFor={option.value} className="cursor-pointer font-medium">
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
