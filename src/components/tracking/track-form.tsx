"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Ban, CalendarDays, Check, Home, Loader, Search, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/button";
import { YapePayCard } from "@/components/checkout/yape-pay-card";
import { depositFor, round2 } from "@/lib/payments";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatLong, formatShort, ucfirst } from "@/lib/dates";
import { cn, errorMessage, formatPhone, formatPrice, normalizePhone, sanitizePhoneInput } from "@/lib/utils";
import { ORDER_STATUSES, STATUS_LABEL, type OrderItem, type OrderStatus } from "@/lib/types";
import { useSite } from "@/components/providers/site-provider";
import { paymentProofLine, waLink } from "@/lib/whatsapp";
import { BRAND } from "@/lib/config";
import { forgetOrder, getMe, getMyOrders, rememberOrder } from "@/lib/device-store";

type Tracked = {
  code: string;
  status: OrderStatus;
  delivery_date: string;
  time_slot: string | null;
  delivery_type: "recojo" | "delivery";
  items: OrderItem[];
  subtotal: number;
  has_quote_items: boolean;
  paid_amount: number;
  created_at: string;
  updated_at: string;
};

const FLOW: OrderStatus[] = ["pendiente", "confirmado", "en_preparacion", "listo", "entregado"];
const STATUS_TEXT: Record<OrderStatus, string> = {
  pendiente: "Recibimos tu separación. Escríbenos por WhatsApp si aún no lo hiciste.",
  confirmado: "Tu pedido está confirmado. ¡Gracias por tu confianza!",
  en_preparacion: "Estamos creando tu detalle con mucho cariño.",
  listo: "¡Tu detalle está listo!",
  entregado: "Pedido entregado. ¡Esperamos que haya sido una gran sorpresa!",
  cancelado: "Este pedido fue cancelado. Escríbenos si tienes dudas.",
};

export function TrackForm() {
  const params = useSearchParams();
  const { whatsapp } = useSite();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Tracked | null>(null);
  const [notFound, setNotFound] = useState(false);
  /** Pedidos hechos desde este dispositivo (se cargan solos al entrar) */
  const [mine, setMine] = useState<Tracked[] | null>(null);

  const fetchOrders = async (c: string | null, p: string): Promise<Tracked[]> => {
    const { data, error } = await getSupabaseBrowser().rpc("track_order", {
      p_code: c && c.trim() ? c.trim().toUpperCase() : null,
      p_phone: p,
    });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return rows.map((row) => ({
      ...row,
      subtotal: Number(row.subtotal),
      paid_amount: Number(row.paid_amount ?? 0),
    }));
  };

  useEffect(() => {
    const me = getMe();
    if (me.phone) setPhone(sanitizePhoneInput(me.phone));
    const wanted = (params.get("codigo") ?? "").trim().toUpperCase();
    const saved = getMyOrders();
    if (wanted && me.phone && !saved.some((o) => o.code === wanted)) {
      saved.unshift({ code: wanted, phone: me.phone, savedAt: "" });
    }

    if (!isSupabaseConfigured) {
      setMine([]);
      return;
    }

    const cleanPhone = me.phone ? normalizePhone(me.phone) : null;

    if (saved.length > 0) {
      Promise.all(saved.map((o) => fetchOrders(o.code, o.phone).then((rows) => rows[0] ?? null).catch(() => null))).then((rows) => {
        const list = rows.filter((r): r is Tracked => r !== null);
        list.forEach((o) => {
          const s = saved.find((x) => x.code === o.code);
          if (s && !s.savedAt) rememberOrder(o.code, s.phone);
        });
        setMine(list);
        const pick = list.find((o) => o.code === wanted) ?? list[0];
        if (pick) setOrder(pick);
      });
    } else if (cleanPhone) {
      // Si el cliente no tiene códigos guardados pero sí su teléfono, buscamos sus pedidos automáticamente
      fetchOrders(null, cleanPhone)
        .then((list) => {
          if (list.length > 0) {
            list.forEach((o) => rememberOrder(o.code, cleanPhone));
            setMine(list);
            setOrder(list[0]);
          } else {
            setMine([]);
          }
        })
        .catch(() => setMine([]));
    } else {
      setMine([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return toast.error("Ingresa tu celular de 9 dígitos.");
    if (!isSupabaseConfigured) return toast.error("El seguimiento estará disponible muy pronto.");
    setLoading(true);
    setNotFound(false);
    try {
      const found = await fetchOrders(code, cleanPhone);
      if (!found || found.length === 0) {
        setOrder(null);
        setNotFound(true);
        return;
      }
      found.forEach((o) => rememberOrder(o.code, cleanPhone));
      setMine((prev) => {
        const existing = prev ?? [];
        return [...found, ...existing.filter((e) => !found.some((f) => f.code === e.code))];
      });
      setOrder(found[0]);
      if (found.length === 1) {
        toast.success(`Pedido ${found[0].code} encontrado`);
      } else {
        toast.success(`Encontramos ${found.length} pedidos con tu celular`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const forget = (c: string) => {
    forgetOrder(c);
    setMine((list) => (list ?? []).filter((o) => o.code !== c));
    if (order?.code === c) setOrder(null);
  };

  const stepIndex = order ? FLOW.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-3xl">
      {mine === null ? (
        <div className="skeleton mb-6 h-24 rounded-[2rem]" />
      ) : mine.length > 0 ? (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-ink-2">Tus pedidos en este dispositivo</p>
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {mine.map((o) => {
              const tone = ORDER_STATUSES.find((s) => s.value === o.status)?.tone;
              const active = order?.code === o.code;
              return (
                <div
                  key={o.code}
                  className={cn(
                    "group relative shrink-0 rounded-2xl bg-white p-4 pr-9 text-left shadow-soft ring-1 transition",
                    active ? "ring-2 ring-pink" : "ring-ink/5 hover:ring-ink/20"
                  )}
                >
                  <button type="button" onClick={() => { setOrder(o); setNotFound(false); }} className="text-left">
                    <span className="block font-display text-lg font-semibold tracking-wide">{o.code}</span>
                    <span className="block text-xs text-ink-3">Para el {formatShort(o.delivery_date)}</span>
                    <span className={cn("mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1", tone)}>{STATUS_LABEL[o.status]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => forget(o.code)}
                    className="absolute right-2 top-2 grid size-6 place-items-center rounded-full text-ink-3 opacity-60 transition hover:bg-paper hover:opacity-100"
                    aria-label={`Quitar ${o.code} de este dispositivo`}
                    title="Quitar de este dispositivo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-2">
          {mine && mine.length > 0 ? "¿Otro pedido? Búscalo con tu código o celular" : "Consulta tu pedido"}
        </p>
      </div>
      <form onSubmit={search} className="grid gap-3 rounded-[2rem] bg-white/85 p-4 shadow-lift ring-1 ring-ink/5 backdrop-blur sm:grid-cols-[1.1fr_1.2fr_auto] sm:p-5">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 12))}
          className="field font-semibold tracking-wider"
          placeholder="Código (ej. CK-XXXXX, opcional)"
          aria-label="Código de pedido"
        />
        <div className="flex items-center rounded-2xl border border-ink/12 bg-white transition focus-within:border-pink focus-within:ring-4 focus-within:ring-pink/10">
          <span className="border-r border-ink/10 px-3.5 text-sm font-semibold text-ink-3">🇵🇪 +51</span>
          <input
            value={phone}
            onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
            maxLength={9}
            className="w-full rounded-r-2xl bg-transparent px-3.5 py-3 tracking-wide focus:outline-none"
            placeholder="9XX XXX XXX"
            inputMode="tel"
            aria-label="Celular"
          />
        </div>
        <Button type="submit" size="md" disabled={loading} className="h-[3.1rem]">
          {loading ? <Loader className="size-4 animate-spin" /> : <Search className="size-4" />} Buscar
        </Button>
      </form>
      <p className="mt-2.5 text-center text-xs text-ink-3">
        💡 ¿No copiaste tu código? Ingresa solo tu número de celular y haz clic en <strong>Buscar</strong>.
      </p>

      <AnimatePresence mode="wait">
        {notFound && (
          <motion.div
            key="nf"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 rounded-2xl bg-paper/70 p-6 text-center text-ink-3 ring-1 ring-ink/5"
          >
            <p className="text-sm font-medium text-ink">
              No encontramos ningún pedido {code ? `con el código "${code}" y ` : "con "}el celular +51 {formatPhone(phone) || phone}.
            </p>
            <p className="mt-2 text-xs">
              Si hiciste tu pedido hace poco o quieres consultarlo directamente, avísanos por WhatsApp y te ayudamos al instante:
            </p>
            <div className="mt-4">
              <a
                href={waLink(`¡Hola ${BRAND.name}! Quiero consultar el estado de mi pedido (mi celular es ${formatPhone(phone) || phone}${code ? `, código ${code}` : ""}).`, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("wa", "sm", "inline-flex")}
              >
                <WhatsAppIcon size={16} /> Consultar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
        {order && (
          <motion.div
            key={order.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-ink/5"
          >
            <div className="flex flex-col justify-between gap-4 bg-ink p-6 text-cream sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="eyebrow text-pink-soft">Pedido</p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-wider">{order.code}</p>
              </div>
              <span className={cn("self-start rounded-full px-4 py-2 text-sm font-bold ring-1", ORDER_STATUSES.find((s) => s.value === order.status)?.tone)}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-lg text-ink-2">{STATUS_TEXT[order.status]}</p>

              {order.status === "cancelado" ? (
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-shell/60 p-4 text-ink-3">
                  <Ban className="size-5" /> Pedido cancelado
                </div>
              ) : (
                <ol className="mt-8 grid grid-cols-5 gap-1">
                  {FLOW.map((s, i) => {
                    const done = i <= stepIndex;
                    return (
                      <li key={s} className="flex flex-col items-center text-center">
                        <div className="relative flex w-full items-center">
                          <span className={cn("h-1 flex-1 rounded-full", i === 0 ? "opacity-0" : done ? "bg-pink" : "bg-ink/10")} />
                          <motion.span
                            initial={{ scale: 0.6 }}
                            animate={{ scale: i === stepIndex ? [1, 1.15, 1] : 1 }}
                            transition={{ duration: 1.6, repeat: i === stepIndex ? Infinity : 0 }}
                            className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold", done ? "bg-pink text-white shadow-glow" : "bg-paper text-ink-3 ring-1 ring-ink/10")}
                          >
                            {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                          </motion.span>
                          <span className={cn("h-1 flex-1 rounded-full", i === FLOW.length - 1 ? "opacity-0" : i < stepIndex ? "bg-pink" : "bg-ink/10")} />
                        </div>
                        <span className={cn("mt-2 px-0.5 text-[0.6rem] font-semibold leading-tight sm:text-xs", done ? "text-ink" : "text-ink-3")}>{STATUS_LABEL[s]}</span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-paper/70 p-4">
                  <CalendarDays className="size-5 text-pink" />
                  <span className="text-sm">
                    <span className="block text-ink-3">Fecha de entrega</span>
                    <strong >{ucfirst(formatLong(order.delivery_date, true))}</strong>
                    {order.time_slot && <span className="text-ink-3"> · {order.time_slot}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-paper/70 p-4">
                  {order.delivery_type === "delivery" ? <Truck className="size-5 text-teal" /> : <Home className="size-5 text-teal" />}
                  <span className="text-sm">
                    <span className="block text-ink-3">Entrega</span>
                    <strong>{order.delivery_type === "delivery" ? "Delivery" : "Recojo"}</strong>
                  </span>
                </div>
              </div>

              {order.items.length > 0 && (
                <ul className="mt-6 divide-y divide-ink/8 rounded-2xl ring-1 ring-ink/8">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-4 p-4 text-sm">
                      <span>
                        {it.qty} × {it.name}
                        {it.note && <span className="block text-xs text-ink-3">✎ {it.note}</span>}
                      </span>
                      <span className="font-semibold">{it.price === null ? "A cotizar" : formatPrice(it.price * it.qty)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between p-4 font-semibold">
                    <span>Subtotal</span>
                    <span className="font-display text-lg">
                      {formatPrice(order.subtotal)}
                      {order.has_quote_items && <span className="ml-1 text-xs font-normal text-ink-3">+ a cotizar</span>}
                    </span>
                  </li>
                </ul>
              )}

              <OrderPayment order={order} />

              <a
                href={waLink(`¡Hola ${BRAND.name}! Consulto por mi pedido ${order.code} 💖`, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#178f47]"
              >
                <WhatsAppIcon size={16} /> Consultar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Estado del pago del pedido + Yape si falta pagar */
function OrderPayment({ order }: { order: Tracked }) {
  const { whatsapp, deposit_percent, yape_number, yape_qr_url } = useSite();
  if (order.status === "cancelado") return null;

  const total = order.subtotal;
  const paid = order.paid_amount;
  const pending = Math.max(0, round2(total - paid));

  if (order.has_quote_items) {
    return (
      <p className="mt-6 rounded-2xl bg-butter-soft/70 p-4 text-sm text-[#7a5600]">
        Estamos preparando el precio final de tu pedido. Te lo enviamos por WhatsApp y aquí lo verás actualizado.
      </p>
    );
  }
  if (total <= 0) return null;

  const deposit = depositFor(total, deposit_percent);
  const toPay = paid > 0 ? pending : deposit ?? total;
  const hasYape = Boolean(yape_number || yape_qr_url);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-3 divide-x divide-ink/8 rounded-2xl text-center ring-1 ring-ink/8">
        {[
          ["Total", formatPrice(total)],
          ["Pagado", formatPrice(paid)],
          ["Falta", formatPrice(pending)],
        ].map(([label, value]) => (
          <div key={label} className="px-2 py-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-3">{label}</p>
            <p className="mt-1 font-display text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
      {pending <= 0 ? (
        <p className="flex items-center gap-2 rounded-2xl bg-teal-soft/70 p-4 text-sm font-semibold text-teal-deep">
          <Check className="size-4" /> ¡Tu pedido está pagado! Gracias 💚
        </p>
      ) : (
        hasYape &&
        toPay > 0 && (
          <>
            <YapePayCard
              amount={toPay}
              caption={paid > 0 ? "Saldo pendiente de tu pedido" : deposit_percent < 100 ? `${deposit_percent}% de adelanto para asegurar tu fecha` : "Pago total del pedido"}
            />
            <a
              href={waLink(`¡Hola ${BRAND.name}! 💖 Por mi pedido *${order.code}*:\n${paymentProofLine(toPay)}`, whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("wa", "md", "w-full sm:w-auto")}
            >
              <WhatsAppIcon size={18} /> Ya pagué · Enviar comprobante
            </a>
          </>
        )
      )}
    </div>
  );
}
