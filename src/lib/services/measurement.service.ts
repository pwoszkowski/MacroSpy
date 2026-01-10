import type { SupabaseClient } from "../../db/supabase.client";
import type { MeasurementDto, LogMeasurementCommand } from "../../types";

/**
 * Service for managing user body measurements.
 * Handles tracking of weight, body fat, and muscle percentage over time.
 */
export class MeasurementService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get measurement history for a user, sorted by date (most recent first).
   * @param userId - User ID from authenticated session
   * @param limit - Maximum number of records to return (default: 30)
   * @returns Array of MeasurementDto objects
   */
  async getMeasurements(userId: string, limit = 30): Promise<MeasurementDto[]> {
    const { data: measurements, error } = await this.supabase
      .from("body_measurements")
      .select("id, date, weight, body_fat_percentage, muscle_percentage")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch measurements: ${error.message}`);
    }

    return (measurements as MeasurementDto[]) ?? [];
  }

  /**
   * Log a new body measurement for a user.
   * @param userId - User ID from authenticated session
   * @param command - Measurement data to log
   * @returns Created MeasurementDto
   */
  async logMeasurement(userId: string, command: LogMeasurementCommand): Promise<MeasurementDto> {
    const { data: measurement, error } = await this.supabase
      .from("body_measurements")
      .insert({
        user_id: userId,
        date: command.date,
        weight: command.weight,
        body_fat_percentage: command.body_fat_percentage ?? null,
        muscle_percentage: command.muscle_percentage ?? null,
      })
      .select("id, date, weight, body_fat_percentage, muscle_percentage")
      .single();

    if (error) {
      throw new Error(`Failed to log measurement: ${error.message}`);
    }

    if (!measurement) {
      throw new Error("Failed to log measurement: No data returned");
    }

    return measurement as MeasurementDto;
  }
}
