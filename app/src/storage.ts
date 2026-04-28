import type { AppData } from './types';

const STORAGE_KEY = 'medtrack.data.v1';

const EMPTY_DATA: AppData = {
  medications: [],
  logs: []
};

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_DATA;
    }

    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : []
    };
  } catch {
    return EMPTY_DATA;
  }
}

export function saveAppData(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export { STORAGE_KEY };
