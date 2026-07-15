const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Formats a Date as a JST calendar date string (YYYY-MM-DD), regardless of
 * the runtime's local timezone (Vercel functions run in UTC; the LAN server
 * may not). Do not use `toISOString().slice(0, 10)` — that returns the UTC
 * calendar date, which is one day behind JST between 00:00-08:59 JST.
 */
export function toLocalDateStr(d: Date): string {
  const jst = new Date(d.getTime() + JST_OFFSET_MS);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayJST(): string {
  return toLocalDateStr(new Date());
}

export function tomorrowJST(): string {
  return toLocalDateStr(new Date(Date.now() + 24 * 60 * 60 * 1000));
}
