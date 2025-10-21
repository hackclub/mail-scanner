export type Status = "idle" | "processing" | "success" | "error" | "duplicate" | "apiKeyUpdated";

export interface HistoryItem {
  id: string;
  ts: number;
  status: Exclude<Status, "idle" | "processing">;
  message: string;
}

export interface AppState {
  status: Status;
  apiKey: string;
  lastLetterId: string | null;
  message: string;
  history: HistoryItem[];
}
