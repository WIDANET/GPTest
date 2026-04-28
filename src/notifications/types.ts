export type NotificationPermissionState = NotificationPermission | "unsupported";

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface NotificationSettings {
  enabled: boolean;
  leadMinutes: number;
  lagMinutes: number;
  quietHours: QuietHours;
  missedDoseDelayMinutes: number;
}

export interface MedicationScheduleEntry {
  medicationId: string;
  medicationName: string;
  scheduledAt: string; // ISO timestamp
}

export interface MedicationLogEntry {
  medicationId: string;
  loggedAt: string; // ISO timestamp
}
