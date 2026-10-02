import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const PEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

/** S/ 45.00 — o "A cotizar" si no hay precio */
export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return "A cotizar";
  return PEN.format(Number(value)).replace("PEN", "S/").replace(/ /g, " ");
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Deja solo 9 dígitos de un celular peruano, o null si no es válido */
export function normalizePhone(input: string): string | null {
  let v = input.replace(/\D/g, "");
  if (v.length === 11 && v.startsWith("51")) v = v.slice(2);
  return /^9\d{8}$/.test(v) ? v : null;
}

export function formatPhone(phone: string) {
  const v = phone.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
  return v.length === 9 ? `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}` : phone;
}

/** Limpia lo que el usuario tipea o pega en el campo de celular (máximo 9 dígitos peruanos) */
export function sanitizePhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length > 9) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 9);
}

export function pluralize(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Mensaje legible a partir de un error de Supabase/PostgREST */
export function errorMessage(err: unknown, fallback = "Algo salió mal. Inténtalo otra vez.") {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  const e = err as { message?: string; code?: string };
  if (e.code === "PGRST202" || e.code === "PGRST205" || e.code === "42P01")
    return "La base de datos aún no está configurada.";
  if (e.code === "PGRST204" || e.code === "42703")
    return "Falta una actualización de la base de datos: ejecuta supabase/002_pagos_yape.sql en Supabase.";
  return e.message || fallback;
}
