/**
 * Fechas como strings ISO "YYYY-MM-DD", siempre en hora de Lima (UTC-5, sin horario de verano).
 * Trabajar con strings evita los clásicos errores de zona horaria.
 */

export type ISODate = string;

const LIMA_OFFSET_HOURS = 5;

export const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
export const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const WEEKDAYS_SHORT = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toISO(y: number, m: number, d: number): ISODate {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function parseISO(iso: ISODate) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function utc(iso: ISODate) {
  const { y, m, d } = parseISO(iso);
  return Date.UTC(y, m - 1, d);
}

/** Hoy en Lima */
export function limaToday(now: Date = new Date()): ISODate {
  const lima = new Date(now.getTime() - LIMA_OFFSET_HOURS * 3600_000);
  return toISO(lima.getUTCFullYear(), lima.getUTCMonth() + 1, lima.getUTCDate());
}

/** Instante exacto (ms) de la medianoche de Lima de esa fecha */
export function limaMidnight(iso: ISODate) {
  return utc(iso) + LIMA_OFFSET_HOURS * 3600_000;
}

export function addDays(iso: ISODate, days: number): ISODate {
  const t = new Date(utc(iso) + days * 86_400_000);
  return toISO(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function diffDays(from: ISODate, to: ISODate) {
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** 0 = domingo … 6 = sábado */
export function weekday(iso: ISODate) {
  return new Date(utc(iso)).getUTCDay();
}

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** n-ésimo día de la semana de un mes (ej. 2º domingo de mayo) */
export function nthWeekday(y: number, m: number, wd: number, n: number): ISODate {
  const first = weekday(toISO(y, m, 1));
  const day = 1 + ((wd - first + 7) % 7) + (n - 1) * 7;
  return toISO(y, m, day);
}

export function isValidISO(iso: string | null | undefined): iso is ISODate {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { y, m, d } = parseISO(iso);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

/** "sábado 3 de octubre" */
export function formatLong(iso: ISODate, withYear = false) {
  const { y, m, d } = parseISO(iso);
  return `${WEEKDAYS[weekday(iso)]} ${d} de ${MONTHS[m - 1]}${withYear ? ` de ${y}` : ""}`;
}

/** "3 de octubre" */
export function formatDayMonth(iso: ISODate) {
  const { m, d } = parseISO(iso);
  return `${d} de ${MONTHS[m - 1]}`;
}

/** "3 oct" */
export function formatShort(iso: ISODate) {
  const { m, d } = parseISO(iso);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

export function relativeDays(days: number) {
  if (days === 0) return "¡Hoy!";
  if (days === 1) return "Mañana";
  if (days === 2) return "Pasado mañana";
  if (days < 0) return `Hace ${Math.abs(days)} días`;
  return `En ${days} días`;
}

/** Matriz de semanas (lunes a domingo) para un mes; null = celda vacía */
export function monthMatrix(y: number, m: number): (ISODate | null)[][] {
  const first = (weekday(toISO(y, m, 1)) + 6) % 7; // lunes = 0
  const total = daysInMonth(y, m);
  const cells: (ISODate | null)[] = Array(first).fill(null);
  for (let d = 1; d <= total; d++) cells.push(toISO(y, m, d));
  while (cells.length % 7) cells.push(null);
  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Próxima ocurrencia (hoy incluido) de un día/mes que se repite cada año */
export function nextMonthDay(month: number, day: number, from: ISODate = limaToday()): ISODate {
  const { y } = parseISO(from);
  for (let year = y; year <= y + 4; year++) {
    const iso = toISO(year, month, Math.min(day, daysInMonth(year, month)));
    if (diffDays(from, iso) >= 0) return iso;
  }
  return toISO(y + 1, month, Math.min(day, 28));
}

/** "sábado 3 de octubre" → "Sábado 3 de octubre" */
export function ucfirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
