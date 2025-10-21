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

export async function getLetterStatus(
  apiKey: string,
  letterId: string
): Promise<{ letter: { id: string; status: string } } | null> {
  const url = `${API_BASE}/api/letters/${encodeURIComponent(letterId)}`;
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
