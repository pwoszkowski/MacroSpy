import { useState, useEffect, useCallback } from "react";
import { getUserProfile } from "@/lib/api";
import type { ProfileDto, DietaryGoalDto } from "@/types";

interface UseProfileDataReturn {
  profile: ProfileDto | null;
  currentGoal: DietaryGoalDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing user profile data
 * Handles profile information and current dietary goals
 */
export function useProfileData(): UseProfileDataReturn {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [currentGoal, setCurrentGoal] = useState<DietaryGoalDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserProfile();
      setProfile(data.profile);
      setCurrentGoal(data.current_goal);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać danych profilu";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    currentGoal,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
