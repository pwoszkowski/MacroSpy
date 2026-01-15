import { useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { DaySelector } from "@/components/dashboard/DaySelector";
import { DaySummary } from "./DaySummary";
import { MealList } from "./MealList";
import { MealDialog } from "./MealDialog";
import { AddMealFAB } from "@/components/dashboard/AddMealFAB";
import { useHistoryMeals } from "./useHistoryMeals";
import type { MealDto, CreateMealCommand, UpdateMealCommand } from "@/types";
import type { MealFormValues } from "./schemas";

/**
 * Main container for History view.
 * Manages state and coordinates all history subcomponents.
 */
export function HistoryView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealDto | null>(null);

  const { meals, summary, isLoading, error, refresh, createMeal, updateMeal, deleteMeal } =
    useHistoryMeals(selectedDate);

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setIsDialogOpen(true);
  };

  const handleEditMeal = (meal: MealDto) => {
    setEditingMeal(meal);
    setIsDialogOpen(true);
  };

  const handleDeleteMeal = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten posiłek? Ta operacja jest nieodwracalna.");
    if (!confirmed) return;

    try {
      await deleteMeal(id);
      toast.success("Posiłek został usunięty");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się usunąć posiłku");
    }
  };

  const handleDialogSubmit = async (data: MealFormValues) => {
    try {
      if (editingMeal) {
        // Update existing meal
        const updateCommand: UpdateMealCommand = {
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber,
          consumed_at: data.consumed_at,
        };
        await updateMeal(editingMeal.id, updateCommand);
        toast.success("Posiłek został zaktualizowany");
      } else {
        // Create new meal
        const createCommand: CreateMealCommand = {
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber,
          consumed_at: data.consumed_at,
        };
        await createMeal(createCommand);
        toast.success("Posiłek został dodany");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd");
      throw err; // Re-throw to prevent dialog from closing
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMeal(null);
  };

  // Error state
  if (error && meals.length === 0) {
    return (
      <PageLayout currentPath="/history" showAddMealButton={false}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4" role="img" aria-label="Błąd">
              ⚠️
            </div>
            <h3 className="text-lg font-semibold mb-2">Błąd wczytywania danych</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">{error}</p>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/history" showAddMealButton={false}>
      {/* Date Selector - sticky below header */}
      <div className="sticky top-14 md:top-16 z-30 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <DaySelector selectedDate={selectedDate} onSelect={handleDateChange} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Historia Posiłków</h1>

        <div className="space-y-6">
          {/* Day Summary */}
          <DaySummary summary={summary} isLoading={isLoading} />

          {/* Meals List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Posiłki</h2>
            <MealList meals={meals} isLoading={isLoading} onEdit={handleEditMeal} onDelete={handleDeleteMeal} />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <AddMealFAB onClick={handleAddMeal} />

      {/* Meal Dialog */}
      <MealDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialData={editingMeal || undefined}
        defaultDate={selectedDate}
      />
    </PageLayout>
  );
}
