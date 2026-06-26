export type Status = "idle" | "processing" | "success" | "error" | "duplicate" | "apiKeyUpdated";

export interface HistoryItem {
  id: string;
  ts: number;
  status: Exclude<Status, "idle" | "processing">;
  message: string;
}

// A single entry in a letter's timeline, as returned by the theseus API
// (`letter.events`). `source` is "USPS IV-MTR" for real postal scans, or
// "Hack Club" / "You!" for the printed/mailed/received milestones.
export interface LetterEvent {
  happened_at: string;
  source: string;
  location?: string;
  facility?: string;
  description?: string;
  extra_info?: string;
}

export interface Letter {
  id: string;
  // aasm_state: "pending" | "printed" | "mailed" | "received"
  status: string;
  // Present when the request is made with `?expand=events`.
  events?: LetterEvent[];
}

export interface AppState {
  status: Status;
  apiKey: string;
  lastLetterId: string | null;
  message: string;
  history: HistoryItem[];
}
