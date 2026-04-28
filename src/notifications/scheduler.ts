import {
  MedicationLogEntry,
  MedicationScheduleEntry,
  NotificationSettings,
} from "./types";
import { isNotificationSupported } from "./permission";

interface TimeoutHandles {
  reminder: number;
  missedDose: number;
}

export class LocalNotificationScheduler {
  private handles = new Map<string, TimeoutHandles>();

  constructor(private readonly settings: NotificationSettings) {}

  updateSettings(nextSettings: NotificationSettings): LocalNotificationScheduler {
    this.cancelAll();
    return new LocalNotificationScheduler(nextSettings);
  }

  scheduleMedicationNotifications(entries: MedicationScheduleEntry[]): void {
    if (!this.settings.enabled || !isNotificationSupported()) {
      return;
    }

    const now = Date.now();

    for (const entry of entries) {
      const scheduledMs = new Date(entry.scheduledAt).getTime();
      const reminderAtMs = scheduledMs - this.settings.leadMinutes * 60_000;
      const reminderDelay = Math.max(0, reminderAtMs - now);

      const reminderHandle = window.setTimeout(() => {
        if (this.isWithinQuietHours(new Date())) {
          return;
        }

        new Notification(`Medication reminder: ${entry.medicationName}`, {
          body: `Scheduled around ${new Date(entry.scheduledAt).toLocaleTimeString()}`,
          tag: `reminder:${entry.medicationId}:${entry.scheduledAt}`,
        });
      }, reminderDelay);

      const missedDoseAtMs =
        scheduledMs +
        (this.settings.lagMinutes + this.settings.missedDoseDelayMinutes) * 60_000;
      const missedDoseDelay = Math.max(0, missedDoseAtMs - now);

      const missedDoseHandle = window.setTimeout(() => {
        if (this.isWithinQuietHours(new Date())) {
          return;
        }

        new Notification(`Missed dose alert: ${entry.medicationName}`, {
          body:
            "No medication log was detected in your configured dose window. Please review and log if taken.",
          tag: `missed-dose:${entry.medicationId}:${entry.scheduledAt}`,
        });
      }, missedDoseDelay);

      this.handles.set(this.keyFor(entry), {
        reminder: reminderHandle,
        missedDose: missedDoseHandle,
      });
    }
  }

  reconcileWithLogs(entries: MedicationScheduleEntry[], logs: MedicationLogEntry[]): void {
    for (const entry of entries) {
      const hasLogWithinWindow = logs.some((log) => {
        if (log.medicationId !== entry.medicationId) {
          return false;
        }

        const scheduledMs = new Date(entry.scheduledAt).getTime();
        const loggedMs = new Date(log.loggedAt).getTime();

        const startMs = scheduledMs - this.settings.leadMinutes * 60_000;
        const endMs = scheduledMs + this.settings.lagMinutes * 60_000;

        return loggedMs >= startMs && loggedMs <= endMs;
      });

      if (hasLogWithinWindow) {
        const handles = this.handles.get(this.keyFor(entry));
        if (!handles) continue;

        window.clearTimeout(handles.missedDose);
      }
    }
  }

  cancelAll(): void {
    for (const handles of this.handles.values()) {
      window.clearTimeout(handles.reminder);
      window.clearTimeout(handles.missedDose);
    }

    this.handles.clear();
  }

  private keyFor(entry: MedicationScheduleEntry): string {
    return `${entry.medicationId}:${entry.scheduledAt}`;
  }

  private isWithinQuietHours(date: Date): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const minutes = date.getHours() * 60 + date.getMinutes();
    const [startHour, startMinute] = this.settings.quietHours.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = this.settings.quietHours.end.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (start === end) {
      return true;
    }

    if (start < end) {
      return minutes >= start && minutes < end;
    }

    return minutes >= start || minutes < end;
  }
}

export function bootstrapLocalScheduling(
  settings: NotificationSettings,
  scheduledEntries: MedicationScheduleEntry[],
  logs: MedicationLogEntry[]
): LocalNotificationScheduler {
  const scheduler = new LocalNotificationScheduler(settings);
  scheduler.scheduleMedicationNotifications(scheduledEntries);
  scheduler.reconcileWithLogs(scheduledEntries, logs);
  return scheduler;
}
