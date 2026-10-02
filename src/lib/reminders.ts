import { diffDays, limaToday, nextMonthDay, type ISODate } from "./dates";

/** Con cuántos días de anticipación conviene escribir al cliente */
export const REMINDER_DAYS_BEFORE = 7;

/** true si ya se le escribió al cliente para la próxima ocurrencia de esa fecha */
export function contactedForNext(lastContactedAt: string | null, next: ISODate) {
  if (!lastContactedAt) return false;
  const d = diffDays(limaToday(new Date(lastContactedAt)), next);
  return d >= 0 && d <= 45;
}

/** Cantidad de fechas que hay que escribir ahora (dentro de la anticipación y aún sin contactar) */
export function countPendingReminders(rows: { month: number; day: number; last_contacted_at: string | null }[], today = limaToday()) {
  return rows.filter((r) => {
    const next = nextMonthDay(r.month, r.day, today);
    return diffDays(today, next) <= REMINDER_DAYS_BEFORE && !contactedForNext(r.last_contacted_at, next);
  }).length;
}
