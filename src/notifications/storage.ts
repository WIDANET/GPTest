import { NotificationSettings } from "./types";

const SETTINGS_STORAGE_KEY = "notification-settings.v1";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  leadMinutes: 10,
  lagMinutes: 30,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "07:00",
  },
  missedDoseDelayMinutes: 60,
};

function isSettingsShape(value: unknown): value is NotificationSettings {
  if (!value || typeof value !== "object") return false;
  const candidate = value as NotificationSettings;

  return (
    typeof candidate.enabled === "boolean" &&
    typeof candidate.leadMinutes === "number" &&
    typeof candidate.lagMinutes === "number" &&
    typeof candidate.missedDoseDelayMinutes === "number" &&
    candidate.quietHours != null &&
    typeof candidate.quietHours.enabled === "boolean" &&
    typeof candidate.quietHours.start === "string" &&
    typeof candidate.quietHours.end === "string"
  );
}

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    const parsed = JSON.parse(raw);
    if (!isSettingsShape(parsed)) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      quietHours: {
        ...DEFAULT_NOTIFICATION_SETTINGS.quietHours,
        ...parsed.quietHours,
      },
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
