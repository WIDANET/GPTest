export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule: string;
  goalDays: number;
  createdAt: string;
};

export type MedicationLog = {
  id: string;
  medicationId: string;
  timestamp: string;
};

export type AppData = {
  medications: Medication[];
  logs: MedicationLog[];
};
