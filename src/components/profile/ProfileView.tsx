import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BioDataForm } from "./BioDataForm";
import { DietaryGoalsForm } from "./DietaryGoalsForm";
import { SettingsForm } from "./SettingsForm";
import { useProfileData } from "./useProfileData";
import { updateProfile, setDietaryGoal } from "@/lib/api";
import type { UpdateProfileCommand, SetDietaryGoalCommand } from "@/types";
import { toast } from "sonner";
import { User } from "lucide-react";

interface ProfileViewProps {
  user?: {
    id: string;
    email: string;
  } | null;
}

export function ProfileView({ user }: ProfileViewProps = {}) {
  const { profile, currentGoal, isLoading, error, refetch } = useProfileData();
  const [activeTab, setActiveTab] = useState("profile");

  const handleProfileUpdate = async (data: UpdateProfileCommand) => {
    try {
      await updateProfile(data);
      await refetch();
      toast.success("Profil został zaktualizowany");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się zaktualizować profilu";
      toast.error("Błąd aktualizacji", {
        description: errorMessage,
      });
      throw err;
    }
  };

  const handleGoalUpdate = async (data: SetDietaryGoalCommand) => {
    try {
      await setDietaryGoal(data);
      await refetch();
      toast.success("Cele dietetyczne zostały zapisane");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać celów";
      toast.error("Błąd zapisywania", {
        description: errorMessage,
      });
      throw err;
    }
  };

  if (isLoading) {
    return (
      <PageLayout currentPath="/profile" showAddMealButton={false} user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Ładowanie profilu...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout currentPath="/profile" showAddMealButton={false} user={user}>
        <div className="flex items-center justify-center p-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Błąd</CardTitle>
              <CardDescription>Nie udało się załadować profilu</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout currentPath="/profile" showAddMealButton={false} user={user}>
        <div className="flex items-center justify-center p-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Brak danych profilu</CardTitle>
              <CardDescription>Nie znaleziono danych użytkownika</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/profile" showAddMealButton={false}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profil użytkownika</h1>
            <p className="text-muted-foreground">Zarządzaj swoimi danymi i ustawieniami</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Dane profilowe</TabsTrigger>
            <TabsTrigger value="goals">Cele dietetyczne</TabsTrigger>
            <TabsTrigger value="settings">Ustawienia</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dane biometryczne</CardTitle>
                <CardDescription>
                  Podstawowe informacje wykorzystywane do obliczeń zapotrzebowania kalorycznego
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BioDataForm initialData={profile} onSave={handleProfileUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cele dietetyczne</CardTitle>
                <CardDescription>
                  Ustaw swoje dzienne cele makroskładnikowe lub skorzystaj z kalkulatora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DietaryGoalsForm initialGoal={currentGoal} userProfile={profile} onSave={handleGoalUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia aplikacji</CardTitle>
                <CardDescription>Personalizuj wygląd i zachowanie aplikacji</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
