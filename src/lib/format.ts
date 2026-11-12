export function daysAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return "today";
  if (d === 1) return "1d ago";
  return `${d}d ago`;
}

/** "2026-07-06: Go live." -> { date: "2026-07-06", text: "Go live." } */
export function splitDatedLine(s: string): { date: string | null; text: string } {
  const m = s.match(/^(\d{4}-\d{2}-\d{2})\s*[:—-]\s*([\s\S]*)$/);
  return m ? { date: m[1], text: m[2].trim() } : { date: null, text: s };
}
