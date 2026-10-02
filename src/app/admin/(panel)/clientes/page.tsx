"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Customer, Order, Reminder } from "@/lib/types";
import { MONTHS, formatShort } from "@/lib/dates";
import { cn, errorMessage, formatPhone, formatPrice } from "@/lib/utils";
import { BRAND } from "@/lib/config";
import { AdminHeader } from "@/components/admin/admin-shell";
import { EmptyBlock, LoadingBlock, StatusBadge, WaButton } from "@/components/admin/ui";
import { useCached } from "@/components/admin/use-cached";

type Row = Customer & { orders: Order[]; reminders: Reminder[] };

export default function ClientesPage() {
  const { data: rows } = useCached<Row[]>("admin:customers", async () => {
    const sb = getSupabaseBrowser();
    const [c, o, r] = await Promise.all([
      sb.from("customers").select("*").order("last_seen_at", { ascending: false }).limit(2000),
      sb.from("orders").select("*").order("delivery_date", { ascending: false }).limit(5000),
      sb.from("reminders").select("*"),
    ]);
    if (c.error) toast.error(errorMessage(c.error));
    const orders = (o.data ?? []) as Order[];
    const reminders = (r.data ?? []) as Reminder[];
    return ((c.data ?? []) as Customer[]).map((cu) => ({
      ...cu,
      orders: orders.filter((x) => x.phone === cu.phone),
      reminders: reminders.filter((x) => x.phone === cu.phone),
    }));
  });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/\s/g, "");
    return (rows ?? []).filter((r) => !t || `${r.name ?? ""}${r.phone}`.toLowerCase().replace(/\s/g, "").includes(t));
  }, [rows, q]);

  return (
    <>
      <AdminHeader title="Clientes" description="Cada número de celular es una persona. Aquí ves su historial de pedidos y fechas guardadas." />
      <label className="relative mb-6 block max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field rounded-full pl-11" placeholder="Buscar por nombre o celular" />
      </label>

      {!rows ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyBlock title="Aún no hay clientes" text="Se registran solos cuando alguien separa un pedido o guarda sus fechas." />
      ) : (
        <div className="divide-y divide-ink/8 overflow-hidden rounded-[1.5rem] bg-white shadow-soft ring-1 ring-ink/5">
          {filtered.map((c) => {
            const isOpen = open === c.id;
            const spent = c.orders.filter((o) => o.status !== "cancelado").reduce((s, o) => s + Number(o.subtotal), 0);
            return (
              <div key={c.id}>
                <div className="flex flex-wrap items-center gap-3 p-4 sm:px-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush font-display text-lg font-semibold text-pink-deep">
                    {(c.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} className="min-w-0 flex-1 text-left">
                    <p className="font-semibold">{c.name || "Sin nombre"}</p>
                    <p className="text-sm text-ink-3">{formatPhone(c.phone)}</p>
                  </button>
                  <div className="hidden text-right text-sm sm:block">
                    <p className="font-semibold">{c.orders.length} pedido{c.orders.length === 1 ? "" : "s"}</p>
                    <p className="text-ink-3">{formatPrice(spent)}</p>
                  </div>
                  <span className="hidden rounded-full bg-lilac-soft px-3 py-1 text-xs font-semibold text-[#4b2f93] sm:inline">
                    {c.reminders.length} fecha{c.reminders.length === 1 ? "" : "s"}
                  </span>
                  <WaButton phone={c.phone} text={`¡Hola${c.name ? ` ${c.name.split(" ")[0]}` : ""}! 💖 Te escribimos de ${BRAND.name}.`} label="" className="w-9 justify-center px-0" />
                  <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} className="grid size-9 place-items-center rounded-full ring-1 ring-ink/10" aria-label="Ver detalle">
                    <ChevronDown className={cn("size-4 transition", isOpen && "rotate-180")} />
                  </button>
                </div>
                {isOpen && (
                  <div className="grid gap-4 bg-paper/40 p-4 sm:grid-cols-2 sm:px-6">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Pedidos</p>
                      {c.orders.length === 0 ? (
                        <p className="text-sm text-ink-3">Sin pedidos.</p>
                      ) : (
                        <ul className="space-y-2">
                          {c.orders.map((o) => (
                            <li key={o.id} className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-sm">
                              <Link href={`/admin/pedidos?codigo=${o.code}`} className="font-semibold hover:text-pink-deep">{o.code}</Link>
                              <span className="text-ink-3">{formatShort(o.delivery_date)}</span>
                              <StatusBadge status={o.status} className="ml-auto" />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Fechas importantes</p>
                      {c.reminders.length === 0 ? (
                        <p className="text-sm text-ink-3">No guardó fechas.</p>
                      ) : (
                        <ul className="space-y-2">
                          {c.reminders.map((r) => (
                            <li key={r.id} className="flex justify-between rounded-xl bg-white p-2.5 text-sm">
                              <span>
                                {r.label}
                                {r.person_name && <span className="text-ink-3"> · {r.person_name}</span>}
                              </span>
                              <span className="font-semibold">{r.day} {MONTHS[r.month - 1].slice(0, 3)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
