import type { HistoryItem } from "../types";

const STORAGE_KEYS = {
  API_KEY: "hc_mail.apiKey",
  HISTORY: "hc_mail.history",
};

const MAX_HISTORY_ITEMS = 200;

export function loadApiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
}

export function saveApiKey(apiKey: string): void {
  localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
}

export function loadHistory(): HistoryItem[] {
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryItem[]): void {
  const limited = history.slice(-MAX_HISTORY_ITEMS);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limited));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}
