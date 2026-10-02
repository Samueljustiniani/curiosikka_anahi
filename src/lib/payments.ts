/** Redondeo a céntimos */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Monto para separar (adelanto). null si aún no se puede calcular
 * (todo el pedido es "a cotizar") o si la tienda no pide adelanto.
 */
export function depositFor(subtotal: number, percent: number) {
  if (!subtotal || subtotal <= 0 || percent <= 0) return null;
  return round2((subtotal * Math.min(percent, 100)) / 100);
}

export type PaymentState = "sin_pago" | "adelanto" | "pagado";

export function paymentState(subtotal: number, paid: number, hasQuote: boolean): PaymentState {
  if (!paid || paid <= 0) return "sin_pago";
  if (!hasQuote && subtotal > 0 && paid >= subtotal) return "pagado";
  return "adelanto";
}

export const PAYMENT_LABEL: Record<PaymentState, { label: string; tone: string }> = {
  sin_pago: { label: "Sin pago", tone: "bg-shell text-ink-3 ring-ink/10" },
  adelanto: { label: "Adelanto", tone: "bg-butter-soft text-[#7a5600] ring-butter/40" },
  pagado: { label: "Pagado", tone: "bg-teal-soft text-teal-deep ring-teal/30" },
};

/** Recalcula subtotal y "a cotizar" a partir de los productos del pedido */
export function totalsFromItems(items: { price: number | null; qty: number }[]) {
  const subtotal = round2(items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0));
  const hasQuote = items.some((i) => i.price === null);
  return { subtotal, hasQuote };
}
