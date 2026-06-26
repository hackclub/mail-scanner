import type { Letter } from "../types";

const API_BASE = "";

export async function markLetterMailed(
  apiKey: string,
  letterId: string
): Promise<Response> {
  const url = `${API_BASE}/api/letters/${encodeURIComponent(letterId)}/mark_mailed`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return res;
}

// Fetch a letter, expanding its timeline so we can inspect USPS IV-MTR
// tracking events (used to tell "mailed and tracked" from "mailed but the
// post office never scanned it").
export async function getLetter(
  apiKey: string,
  letterId: string
): Promise<{ letter: Letter } | null> {
  const url = `${API_BASE}/api/letters/${encodeURIComponent(
    letterId
  )}?expand=events`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}
