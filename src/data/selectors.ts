import type { Log, Medication } from "../domain/types";

export interface DurationProgress {
  completedDays: number;
  plannedDays: number | null;
}

export interface MedicationTodayStatus {
  medicationId: string;
  status: "completed" | "pending";
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function eachDay(startDateISO: string, endDateISO: string): string[] {
  const result: string[] = [];
  const cursor = new Date(`${startDateISO}T00:00:00.000Z`);
  const end = new Date(`${endDateISO}T00:00:00.000Z`);

  while (cursor <= end) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

function medicationTakenDays(medicationId: string, logs: Log[]): Set<string> {
  const days = new Set<string>();
  for (const log of logs) {
    if (log.medicationId === medicationId) {
      days.add(toDateOnly(log.takenAt));
    }
  }
  return days;
}

export function getCompletedDaysVsPlannedDuration(
  medication: Medication,
  logs: Log[],
  nowISO: string = new Date().toISOString(),
): DurationProgress {
  const takenDays = medicationTakenDays(medication.id, logs);
  const completedDays = [...takenDays].filter((day) => day >= medication.startDate).length;

  if (medication.durationType === "ongoing") {
    return { completedDays, plannedDays: null };
  }

  return {
    completedDays,
    plannedDays: medication.durationDays ?? 0,
  };
}

export function getCurrentStreak(medication: Medication, logs: Log[], nowISO: string = new Date().toISOString()): number {
  const takenDays = medicationTakenDays(medication.id, logs);
  const today = toDateOnly(nowISO);
  let streak = 0;

  const cursor = new Date(`${today}T00:00:00.000Z`);
  while (cursor.toISOString().slice(0, 10) >= medication.startDate) {
    const day = cursor.toISOString().slice(0, 10);
    if (!takenDays.has(day)) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function getAdherencePercentage(
  medication: Medication,
  logs: Log[],
  nowISO: string = new Date().toISOString(),
): number {
  const today = toDateOnly(nowISO);
  const start = medication.startDate;

  let lastPlannedDay = today;
  if (medication.durationType === "fixed" && medication.durationDays && medication.durationDays > 0) {
    const endDate = new Date(`${medication.startDate}T00:00:00.000Z`);
    endDate.setUTCDate(endDate.getUTCDate() + medication.durationDays - 1);
    const plannedEnd = endDate.toISOString().slice(0, 10);
    lastPlannedDay = plannedEnd < today ? plannedEnd : today;
  }

  if (lastPlannedDay < start) {
    return 0;
  }

  const plannedDays = eachDay(start, lastPlannedDay).length;
  if (plannedDays === 0) {
    return 0;
  }

  const completedDays = medicationTakenDays(medication.id, logs);
  const completedInRange = eachDay(start, lastPlannedDay).filter((day) => completedDays.has(day)).length;

  return Math.round((completedInRange / plannedDays) * 10000) / 100;
}

export function getTodayStatusPerMedication(
  medications: Medication[],
  logs: Log[],
  nowISO: string = new Date().toISOString(),
): MedicationTodayStatus[] {
  const today = toDateOnly(nowISO);
  const takenByMedication = new Map<string, Set<string>>();

  for (const med of medications) {
    takenByMedication.set(med.id, medicationTakenDays(med.id, logs));
  }

  return medications.map((medication) => {
    const takenDays = takenByMedication.get(medication.id) ?? new Set<string>();
    return {
      medicationId: medication.id,
      status: takenDays.has(today) ? "completed" : "pending",
    };
  });
}
