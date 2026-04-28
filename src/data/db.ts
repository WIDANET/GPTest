import type { Log, Medication } from "../domain/types";

const DB_NAME = "medication-tracker";
const DB_VERSION = 2;

export const STORES = {
  medications: "medications",
  logs: "logs",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

interface MedicationTrackerDBSchema {
  medications: Medication;
  logs: Log;
}

function runMigrations(db: IDBDatabase, oldVersion: number, tx: IDBTransaction): void {
  if (oldVersion < 1) {
    const medications = db.createObjectStore(STORES.medications, { keyPath: "id" });
    medications.createIndex("name", "name", { unique: false });

    const logs = db.createObjectStore(STORES.logs, { keyPath: "id" });
    logs.createIndex("medicationId", "medicationId", { unique: false });
    logs.createIndex("takenAt", "takenAt", { unique: false });
    logs.createIndex("medicationId_takenAt", ["medicationId", "takenAt"], { unique: false });
  }

  if (oldVersion < 2) {
    const logsStore = tx.objectStore(STORES.logs);
    if (!logsStore.indexNames.contains("takenAt")) {
      logsStore.createIndex("takenAt", "takenAt", { unique: false });
    }
    if (!logsStore.indexNames.contains("medicationId_takenAt")) {
      logsStore.createIndex("medicationId_takenAt", ["medicationId", "takenAt"], { unique: false });
    }
  }
}

let dbPromise: Promise<IDBDatabase> | undefined;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const tx = request.transaction;
      if (!tx) {
        throw new Error("Expected upgrade transaction to be available.");
      }
      runMigrations(db, request.oldVersion, tx);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });

  return dbPromise;
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

export async function withStore<TName extends keyof MedicationTrackerDBSchema, TResult>(
  storeName: TName,
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<TResult> | TResult,
): Promise<TResult> {
  const db = await getDB();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await handler(store);

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Transaction failed."));
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted."));
  });

  return result;
}

export { promisifyRequest, type MedicationTrackerDBSchema };
