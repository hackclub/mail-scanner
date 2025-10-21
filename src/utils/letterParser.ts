export function parseLetterId(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  
  if (s.includes('hack.club')) {
    const match = s.match(/hack\.club\/(ltr![a-z0-9]+)/i);
    return match ? match[1].toLowerCase() : null;
  }
  
  const match = s.match(/ltr![a-z0-9]+/i);
  return match ? match[0].toLowerCase() : null;
}
