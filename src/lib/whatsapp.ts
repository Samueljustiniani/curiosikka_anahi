import { BRAND } from "./config";
import { formatLong } from "./dates";
import { getOccasion } from "./occasions";
import { formatPhone, formatPrice } from "./utils";

export function waLink(text: string, phone: string = BRAND.whatsapp) {
  const to = phone.replace(/\D/g, "");
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

/** Enlace para escribirle a un cliente (desde el admin) */
export function waToCustomer(phone: string, text: string) {
  const v = phone.replace(/\D/g, "");
  return waLink(text, v.length === 9 ? `51${v}` : v);
}

export const WA_GREETING = `¡Hola ${BRAND.name}! 💖 Quisiera más información sobre sus detalles.`;

export function productInquiry(p: { name: string; price: number | null; url?: string }) {
  return [
    `¡Hola ${BRAND.name}! 💖`,
    `Me interesa: *${p.name}* (${formatPrice(p.price)}).`,
    p.url ? p.url : "",
    "¿Me cuentan cómo puedo separarlo?",
  ]
    .filter(Boolean)
    .join("\n");
}

export function customIdeaMessage(data: { name?: string; occasion?: string; date?: string; idea?: string }) {
  const occ = getOccasion(data.occasion)?.name;
  return [
    `¡Hola ${BRAND.name}! ✨ Tengo una idea para un detalle personalizado.`,
    data.name ? `Soy ${data.name}.` : "",
    occ ? `Ocasión: ${occ}` : "",
    data.date ? `Para el: ${formatLong(data.date, true)}` : "",
    data.idea ? `Mi idea: ${data.idea}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export type OrderMessageInput = {
  code?: string | null;
  name: string;
  phone: string;
  date: string;
  timeSlot?: string;
  occasion?: string;
  deliveryType: "recojo" | "delivery";
  district?: string;
  address?: string;
  recipient?: string;
  dedication?: string;
  notes?: string;
  items: { name: string; qty: number; price: number | null; note?: string }[];
  subtotal: number;
  hasQuote: boolean;
};

export function orderMessage(o: OrderMessageInput) {
  const occ = getOccasion(o.occasion)?.name ?? o.occasion;
  const lines: string[] = [];
  lines.push(
    o.items.length
      ? `¡Hola ${BRAND.name}! 💖 Quiero *separar* mi pedido.`
      : `¡Hola ${BRAND.name}! ✨ Quiero un detalle *personalizado*.`
  );
  if (o.code) lines.push(`Código: *${o.code}*`);
  lines.push("");
  if (o.items.length) {
    lines.push("🎁 *Mi pedido*");
    o.items.forEach((it) => {
      lines.push(`• ${it.qty} × ${it.name} — ${formatPrice(it.price === null ? null : it.price * it.qty)}`);
      if (it.note) lines.push(`   ✎ ${it.note}`);
    });
    lines.push(`Subtotal: *${formatPrice(o.subtotal)}*${o.hasQuote ? " + productos a cotizar" : ""}`);
    lines.push("");
  }
  lines.push(`📅 Para: *${formatLong(o.date, true)}*${o.timeSlot ? ` (${o.timeSlot})` : ""}`);
  if (occ) lines.push(`🎉 Ocasión: ${occ}`);
  lines.push(
    o.deliveryType === "delivery"
      ? `🚚 Delivery${o.district ? ` · ${o.district}` : ""}${o.address ? ` · ${o.address}` : ""}`
      : "🏠 Recojo en tienda"
  );
  if (o.recipient) lines.push(`🎀 Para: ${o.recipient}`);
  if (o.dedication) lines.push(`💌 Dedicatoria: "${o.dedication}"`);
  if (o.notes) lines.push(`📝 ${o.notes}`);
  lines.push("");
  lines.push(`👤 ${o.name} · ${formatPhone(o.phone)}`);
  lines.push("Quedo atento(a) para coordinar el pago y los detalles. ¡Gracias!");
  return lines.join("\n");
}

// ── Mensajes del panel hacia el cliente ─────────────────────────────
type StatusOrder = { code: string; customer_name: string; delivery_date: string; status: string };

export function statusMessage(o: StatusOrder) {
  const first = o.customer_name.split(" ")[0];
  const date = formatLong(o.delivery_date);
  switch (o.status) {
    case "confirmado":
      return `¡Hola ${first}! 💖 Tu pedido *${o.code}* para el ${date} está *confirmado*. ¡Gracias por confiar en ${BRAND.name}!`;
    case "en_preparacion":
      return `¡Hola ${first}! ✨ Ya estamos preparando tu pedido *${o.code}* con mucho cariño.`;
    case "listo":
      return `¡Hola ${first}! 🎁 Tu pedido *${o.code}* ya está *listo*. Coordinemos la entrega.`;
    case "entregado":
      return `¡Hola ${first}! 💝 Gracias por elegir ${BRAND.name}. Esperamos que tu detalle haya sido una gran sorpresa.`;
    case "cancelado":
      return `Hola ${first}, te escribimos por tu pedido *${o.code}* para el ${date}, que figura como cancelado.`;
    default:
      return `¡Hola ${first}! 💖 Recibimos tu separación *${o.code}* para el ${date}. Te escribimos para coordinar los detalles.`;
  }
}

export function reminderMessage(r: { label: string; person_name: string | null }, customerName: string | null, dateText: string) {
  const first = customerName?.split(" ")[0];
  const who = r.person_name ? ` de ${r.person_name}` : "";
  return `¡Hola${first ? ` ${first}` : ""}! 💝 Te escribimos de ${BRAND.name}: se acerca *${r.label}${who}* (${dateText}). ¿Te ayudamos a preparar un detalle especial?`;
}

// ── Pagos ───────────────────────────────────────────────────────────
type YapeInfo = { yape_number: string | null; yape_name: string | null; deposit_percent: number };

function yapeLine(y: YapeInfo) {
  if (!y.yape_number) return "";
  return ` al *${formatPhone(y.yape_number)}*${y.yape_name ? ` (${y.yape_name})` : ""}`;
}

/** Del cliente a la tienda: ya pagó y manda su comprobante */
export function paymentProofLine(amount: number | null) {
  return amount
    ? `💳 Ya yapeé *${formatPrice(amount)}* para separar mi pedido. Te envío mi comprobante 📎`
    : "💳 Ya hice mi pago por Yape. Te envío mi comprobante 📎";
}

/** De la tienda al cliente: el precio final y cuánto pagar para separar */
export function priceQuoteMessage(
  o: { code: string; customer_name: string; subtotal: number; paid_amount: number },
  y: YapeInfo
) {
  const first = o.customer_name.split(" ")[0];
  const pending = Math.max(0, o.subtotal - o.paid_amount);
  const deposit = y.deposit_percent > 0 && y.deposit_percent < 100 ? Math.round(o.subtotal * y.deposit_percent) / 100 : null;
  const lines = [`¡Hola ${first}! 💖 El total de tu pedido *${o.code}* es *${formatPrice(o.subtotal)}*.`];
  if (o.paid_amount > 0) {
    lines.push(`Ya recibimos ${formatPrice(o.paid_amount)}. Falta: *${formatPrice(pending)}*.`);
  } else if (deposit) {
    lines.push(`Para separarlo puedes yapear *${formatPrice(deposit)}* (${y.deposit_percent}% de adelanto)${yapeLine(y)}.`);
  } else {
    lines.push(`Puedes pagarlo por Yape${yapeLine(y)}.`);
  }
  lines.push("Envíanos tu comprobante por aquí. ¡Gracias! ✨");
  return lines.join("\n");
}

/** De la tienda al cliente: confirmación de pago recibido */
export function paymentReceivedMessage(o: { code: string; customer_name: string; subtotal: number; paid_amount: number; has_quote_items: boolean }) {
  const first = o.customer_name.split(" ")[0];
  const pending = Math.max(0, o.subtotal - o.paid_amount);
  return [
    `¡Hola ${first}! 💖 Recibimos tu pago de *${formatPrice(o.paid_amount)}*. Tu pedido *${o.code}* ya está asegurado.`,
    pending > 0 && !o.has_quote_items ? `Saldo pendiente: *${formatPrice(pending)}* (lo puedes pagar a la entrega).` : "",
    "¡Gracias por confiar en " + BRAND.name + "! ✨",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Respuesta rápida para Facebook/Instagram: manda a la tienda */
export function storeLinkReply(url: string, productName?: string) {
  return productName
    ? `¡Hola! 💖 Aquí puedes ver *${productName}* con sus fotos y precio, y separarlo para la fecha que quieras: ${url}`
    : `¡Hola! 💖 Aquí puedes ver todos nuestros detalles con precios y separar el tuyo para la fecha que quieras: ${url}`;
}
