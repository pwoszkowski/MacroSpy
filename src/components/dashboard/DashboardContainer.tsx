import { useState } from 'react';
import { DateHeader } from './DateHeader';
import { NutritionSummary } from './NutritionSummary';
import { MealList } from './MealList';
import { AddMealFAB } from './AddMealFAB';
import { SkeletonNutritionSummary } from './SkeletonNutritionSummary';
import { SkeletonMealCard } from './SkeletonMealCard';
import { AddMealDialog } from './composer/AddMealDialog';
import { useDashboardData } from '@/components/hooks/useDashboardData';
import type { MealListResponse, UserProfileResponse } from '@/types';

interface DashboardContainerProps {
  initialMeals: MealListResponse;
  userProfile: UserProfileResponse;
}

/**
 * Main Dashboard container component.
 * Manages state for selected date and coordinates all dashboard subcomponents.
 */
export function DashboardContainer({ initialMeals, userProfile }: DashboardContainerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading, error, refetch } = useDashboardData(selectedDate, initialMeals);

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleAddMeal = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleMealSaved = () => {
    // Odśwież dane po zapisaniu posiłku
    refetch();
  };

  const handleMealClick = (mealId: string) => {
    // Navigate to meal details/edit (optional in MVP)
    console.log('Meal clicked:', mealId);
    // Future: navigate to meal detail/edit page
  };

  // Error state
  if (error && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Błąd wczytywania danych</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Date Header */}
      <DateHeader selectedDate={selectedDate} onDateChange={handleDateChange} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Nutrition Summary Section */}
        {isLoading && !data ? (
          <SkeletonNutritionSummary />
        ) : (
          <NutritionSummary
            current={data?.summary || {
              total_calories: 0,
              total_protein: 0,
              total_fat: 0,
              total_carbs: 0,
              total_fiber: 0,
            }}
            targets={userProfile.current_goal}
          />
        )}

        {/* Meals List */}
        {isLoading && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonMealCard key={i} />
            ))}
          </div>
        ) : data ? (
          <MealList meals={data.data} onMealClick={handleMealClick} />
        ) : null}
      </main>

      {/* Floating Action Button */}
      <AddMealFAB onClick={handleAddMeal} />

      {/* Add Meal Dialog */}
      <AddMealDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleMealSaved}
      />
    </div>
  );
}
