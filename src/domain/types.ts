export type FrequencyType = "daily" | "custom";

export type DurationType = "ongoing" | "fixed";

/**
 * A medication plan.
 */
export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequencyType: FrequencyType;
  /** HH:mm values in local time */
  times: string[];
  /** ISO date string, e.g. 2026-04-28 */
  startDate: string;
  durationType: DurationType;
  durationDays?: number;
}

/**
 * A record that a medication was taken.
 */
export interface Log {
  id: string;
  medicationId: string;
  /** ISO timestamp */
  takenAt: string;
  /** true when entered manually, false when captured from scheduled interaction */
  manual: boolean;
}
