import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { TodayHeader } from "./TodayHeader";
import { NutritionSummary } from "./NutritionSummary";
import { MealList } from "./MealList";
import { AddMealFAB } from "./AddMealFAB";
import { SkeletonNutritionSummary } from "./SkeletonNutritionSummary";
import { SkeletonMealCard } from "./SkeletonMealCard";
import { AddMealDialog } from "./composer/AddMealDialog";
import { useDashboardData } from "@/components/hooks/useDashboardData";
import type { MealListResponse, UserProfileResponse } from "@/types";

interface DashboardContainerProps {
  initialMeals: MealListResponse;
  userProfile: UserProfileResponse;
  user?: {
    id: string;
    email: string;
  } | null;
}

/**
 * Main Dashboard container component.
 * Always displays today's data. Use History view to browse other dates.
 */
export function DashboardContainer({ initialMeals, userProfile, user }: DashboardContainerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const today = new Date();
  const { data, isLoading, error, refetch } = useDashboardData(today, initialMeals);

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
    console.log("Meal clicked:", mealId);
    // Future: navigate to meal detail/edit page
  };

  // Error state
  if (error && !data) {
    return (
      <PageLayout currentPath="/" showAddMealButton={false} user={user}>
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
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/" showAddMealButton={false} user={user}>
      {/* Today's date header */}
      <TodayHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Nutrition Summary Section */}
        {isLoading && !data ? (
          <SkeletonNutritionSummary />
        ) : (
          <NutritionSummary
            current={
              data?.summary || {
                total_calories: 0,
                total_protein: 0,
                total_fat: 0,
                total_carbs: 0,
                total_fiber: 0,
              }
            }
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
      </div>

      {/* Floating Action Button */}
      <AddMealFAB onClick={handleAddMeal} />

      {/* Add Meal Dialog */}
      <AddMealDialog isOpen={isDialogOpen} onClose={handleDialogClose} onSuccess={handleMealSaved} />
    </PageLayout>
  );
}
