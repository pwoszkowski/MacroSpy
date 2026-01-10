import type { SupabaseClient } from "../../db/supabase.client";
import type { ProfileDto, UpdateProfileCommand } from "../../types";

/**
 * Service for managing user profile data.
 * Handles anthropometric data (height, gender, birth_date).
 */
export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get profile data for a specific user.
   * @param userId - User ID from authenticated session
   * @returns ProfileDto with user's anthropometric data
   */
  async getProfile(userId: string): Promise<ProfileDto | null> {
    const { data: profile, error } = await this.supabase
      .from("profiles")
      .select("height, gender, birth_date")
      .eq("id", userId)
      .single();

    if (error) {
      // Check if error is due to no rows found
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return profile as ProfileDto;
  }

  /**
   * Update profile data for a user.
   * @param userId - User ID from authenticated session
   * @param command - Profile data to update
   * @returns Updated ProfileDto
   */
  async updateProfile(userId: string, command: UpdateProfileCommand): Promise<ProfileDto> {
    const { data: profile, error } = await this.supabase
      .from("profiles")
      .update({
        height: command.height,
        gender: command.gender,
        birth_date: command.birth_date,
      })
      .eq("id", userId)
      .select("height, gender, birth_date")
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    if (!profile) {
      throw new Error("Failed to update profile: No data returned");
    }

    return profile as ProfileDto;
  }
}
