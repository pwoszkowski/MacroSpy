import type {
  MeasurementDto,
  LogMeasurementCommand,
  UserProfileResponse,
  UpdateProfileCommand,
  SetDietaryGoalCommand,
  DietaryGoalDto,
} from "@/types";

/**
 * Frontend API client for communicating with backend endpoints.
 */

// ==========================================
// Profile & Goals API
// ==========================================

/**
 * Get current user profile and active dietary goal
 * @returns UserProfileResponse with profile and current goal
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  const response = await fetch("/api/profile/me");

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user profile: ${error}`);
  }

  return response.json();
}

/**
 * Update user profile data
 * @param command - Profile data to update
 * @returns Updated profile
 */
export async function updateProfile(command: UpdateProfileCommand): Promise<void> {
  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update profile: ${error}`);
  }
}

/**
 * Set new dietary goals (creates new goal record with start_date)
 * @param command - Goal data including start_date
 * @returns Created goal
 */
export async function setDietaryGoal(command: SetDietaryGoalCommand): Promise<DietaryGoalDto> {
  const response = await fetch("/api/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set dietary goal: ${error}`);
  }

  return response.json();
}

// ==========================================
// Measurements API
// ==========================================

/**
 * Get user measurements history
 * @param limit - Maximum number of records to return
 * @returns Array of MeasurementDto objects
 */
export async function getMeasurements(limit = 30): Promise<MeasurementDto[]> {
  const response = await fetch(`/api/measurements?limit=${limit}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch measurements: ${error}`);
  }

  return response.json();
}

/**
 * Log a new body measurement
 * @param command - Measurement data to log
 * @returns Created MeasurementDto
 */
export async function logMeasurement(command: LogMeasurementCommand): Promise<MeasurementDto> {
  const response = await fetch("/api/measurements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to log measurement: ${error}`);
  }

  return response.json();
}

/**
 * Delete a body measurement
 * @param measurementId - ID of the measurement to delete
 */
export async function deleteMeasurement(measurementId: string): Promise<void> {
  const response = await fetch(`/api/measurements/${measurementId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete measurement: ${error}`);
  }
}
