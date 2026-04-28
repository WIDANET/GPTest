import type { Medication } from "../domain/types";
import { promisifyRequest, withStore } from "./db";

export const medicationRepo = {
  async create(medication: Medication): Promise<Medication> {
    return withStore("medications", "readwrite", async (store) => {
      await promisifyRequest(store.add(medication));
      return medication;
    });
  },

  async upsert(medication: Medication): Promise<Medication> {
    return withStore("medications", "readwrite", async (store) => {
      await promisifyRequest(store.put(medication));
      return medication;
    });
  },

  async getById(id: string): Promise<Medication | undefined> {
    return withStore("medications", "readonly", async (store) => {
      const medication = await promisifyRequest(store.get(id));
      return medication ?? undefined;
    });
  },

  async listAll(): Promise<Medication[]> {
    return withStore("medications", "readonly", (store) => promisifyRequest(store.getAll()));
  },

  async deleteById(id: string): Promise<void> {
    return withStore("medications", "readwrite", async (store) => {
      await promisifyRequest(store.delete(id));
    });
  },

  async clear(): Promise<void> {
    return withStore("medications", "readwrite", async (store) => {
      await promisifyRequest(store.clear());
    });
  },
};
