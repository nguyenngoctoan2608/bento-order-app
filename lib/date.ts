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

/**
 * JST calendar year/month(0-indexed)/date for a Date, independent of the
 * runtime's local timezone. Use this instead of getFullYear()/getMonth()/
 * getDate() for any "is it day 16 yet" style threshold check.
 */
export function jstDateParts(d: Date): { year: number; month: number; date: number } {
  const jst = new Date(d.getTime() + JST_OFFSET_MS);
  return { year: jst.getUTCFullYear(), month: jst.getUTCMonth(), date: jst.getUTCDate() };
}

/**
 * 16日締めの集計期間（当月16日〜翌月15日）をJST基準で返す。
 * start/endは共に日付境界（0時）をDate.UTCで構築しているため、サーバーの
 * タイムゾーンがUTC(Vercel)でもJST(LAN)でも、getMonth()/getDate()や
 * toLocalDateStr()で読み戻したときに同じ日付になる。
 *
 * 期間に注文が含まれるかどうかを判定する際は、このDateオブジェクトを
 * 別の方法でパースした日付と比較しないこと（タイムゾーン解釈の違いで
 * 境界日の注文が漏れる）。必ず toLocalDateStr() で文字列化してから
 * deliveryDate文字列と比較する。
 */
export function getBillingPeriod(now: Date): { start: Date; end: Date } {
  const { year, month, date } = jstDateParts(now);
  if (date >= 16) {
    return {
      start: new Date(Date.UTC(year, month, 16)),
      end:   new Date(Date.UTC(year, month + 1, 15)),
    };
  }
  return {
    start: new Date(Date.UTC(year, month - 1, 16)),
    end:   new Date(Date.UTC(year, month, 15)),
  };
}
