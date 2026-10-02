/**
 * Lo que la tienda recuerda en el dispositivo del cliente (sin cuentas ni contraseñas).
 * Todo va en try/catch: si el navegador bloquea el almacenamiento, la web sigue funcionando.
 */

const ME_KEY = "curiosiika:mis-datos";
const ORDERS_KEY = "curiosiika:mis-pedidos";
const DRAFT_PREFIX = "curiosiika:borrador:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

// ── Nombre y celular ──────────────────────────────────────────
export type Me = { name?: string; phone?: string };
export const getMe = () => read<Me>(ME_KEY, {});
export const saveMe = (me: Me) => write(ME_KEY, me);

// ── Pedidos hechos desde este dispositivo ─────────────────────
export type MyOrder = { code: string; phone: string; savedAt: string };

export function getMyOrders(): MyOrder[] {
  const list = read<MyOrder[]>(ORDERS_KEY, []);
  return Array.isArray(list) ? list.filter((o) => o && typeof o.code === "string" && typeof o.phone === "string") : [];
}

export function rememberOrder(code: string, phone: string) {
  const list = getMyOrders().filter((o) => o.code !== code);
  write(ORDERS_KEY, [{ code, phone, savedAt: new Date().toISOString() }, ...list].slice(0, 20));
}

export function forgetOrder(code: string) {
  write(ORDERS_KEY, getMyOrders().filter((o) => o.code !== code));
}

// ── Borrador del formulario de compra ─────────────────────────
export const getDraft = <T>(name: string) => read<Partial<T> | null>(DRAFT_PREFIX + name, null);
export const saveDraft = (name: string, draft: unknown) => write(DRAFT_PREFIX + name, draft);
export const clearDraft = (name: string) => remove(DRAFT_PREFIX + name);
