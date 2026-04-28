import type { Log } from "../domain/types";
import { promisifyRequest, withStore } from "./db";

export const logRepo = {
  async create(log: Log): Promise<Log> {
    return withStore("logs", "readwrite", async (store) => {
      await promisifyRequest(store.add(log));
      return log;
    });
  },

  async upsert(log: Log): Promise<Log> {
    return withStore("logs", "readwrite", async (store) => {
      await promisifyRequest(store.put(log));
      return log;
    });
  },

  async getById(id: string): Promise<Log | undefined> {
    return withStore("logs", "readonly", async (store) => {
      const log = await promisifyRequest(store.get(id));
      return log ?? undefined;
    });
  },

  async listAll(): Promise<Log[]> {
    return withStore("logs", "readonly", (store) => promisifyRequest(store.getAll()));
  },

  async listByMedicationId(medicationId: string): Promise<Log[]> {
    return withStore("logs", "readonly", async (store) => {
      const index = store.index("medicationId");
      return promisifyRequest(index.getAll(medicationId));
    });
  },

  async listByDateRange(startISO: string, endISO: string): Promise<Log[]> {
    return withStore("logs", "readonly", async (store) => {
      const index = store.index("takenAt");
      const range = IDBKeyRange.bound(startISO, endISO);
      return promisifyRequest(index.getAll(range));
    });
  },

  async listByMedicationAndDateRange(medicationId: string, startISO: string, endISO: string): Promise<Log[]> {
    return withStore("logs", "readonly", async (store) => {
      const index = store.index("medicationId_takenAt");
      const range = IDBKeyRange.bound([medicationId, startISO], [medicationId, endISO]);
      return promisifyRequest(index.getAll(range));
    });
  },

  async deleteById(id: string): Promise<void> {
    return withStore("logs", "readwrite", async (store) => {
      await promisifyRequest(store.delete(id));
    });
  },

  async clear(): Promise<void> {
    return withStore("logs", "readwrite", async (store) => {
      await promisifyRequest(store.clear());
    });
  },
};
