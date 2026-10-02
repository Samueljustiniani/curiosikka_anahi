"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { formatShort, limaToday } from "@/lib/dates";
import { cn, errorMessage, formatPhone, formatPrice } from "@/lib/utils";
import { statusMessage } from "@/lib/whatsapp";
import { AdminHeader } from "@/components/admin/admin-shell";
import { EmptyBlock, LoadingBlock, StatusBadge, WaButton } from "@/components/admin/ui";
import { OrderDrawer } from "@/components/admin/order-drawer";
import { useCached } from "@/components/admin/use-cached";
import { PAYMENT_LABEL, paymentState } from "@/lib/payments";

type Range = "proximos" | "pasados" | "todos";

function OrdersView() {
  const params = useSearchParams();
  const { data: orders, setData: setOrders } = useCached<Order[]>("admin:orders", async () => {
    const { data, error } = await getSupabaseBrowser()
      .from("orders")
      .select("*")
      .order("delivery_date", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) toast.error(errorMessage(error));
    return (data ?? []) as Order[];
  });
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [range, setRange] = useState<Range>("proximos");
  const [q, setQ] = useState(params.get("codigo") ?? "");
  const [selected, setSelected] = useState<Order | null>(null);
  const today = limaToday();
  const code = params.get("codigo");

  // Abrir directamente el pedido indicado en ?codigo=
  useEffect(() => {
    if (code && orders) setSelected(orders.find((o) => o.code === code) ?? null);
  }, [code, orders]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const term = q.trim().toLowerCase();
    let list = orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (range === "proximos" && o.delivery_date < today) return false;
      if (range === "pasados" && o.delivery_date >= today) return false;
      if (term && !`${o.code} ${o.customer_name} ${o.phone}`.toLowerCase().includes(term)) return false;
      return true;
    });
    if (range === "pasados") list = [...list].reverse();
    return list;
  }, [orders, status, range, q, today]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (orders ?? []).forEach((o) => {
      if (range === "proximos" && o.delivery_date < today) return;
      if (range === "pasados" && o.delivery_date >= today) return;
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [orders, range, today]);

  const replace = (o: Order) => {
    setOrders((list) => (list ?? []).map((x) => (x.id === o.id ? o : x)));
    setSelected(o);
  };

  return (
    <>
      <AdminHeader title="Pedidos" description="Separaciones hechas desde la web. Cambia el estado y avisa al cliente por WhatsApp." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="field rounded-full pl-11" placeholder="Buscar por código, nombre o celular" />
        </label>
        <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10">
          {(["proximos", "pasados", "todos"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn("rounded-full px-4 py-2 text-sm font-medium capitalize transition", range === r ? "bg-ink text-cream" : "text-ink-3 hover:text-ink")}
            >
              {r === "proximos" ? "Próximos" : r}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setStatus("")}
          className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition", !status ? "bg-ink text-cream ring-ink" : "bg-white ring-ink/10")}
        >
          Todos
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(status === s.value ? "" : s.value)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition", status === s.value ? s.tone + " ring-2" : "bg-white ring-ink/10")}
          >
            {s.label} <span className="ml-1 opacity-60">{counts[s.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {!orders ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyBlock title="No hay pedidos aquí" text="Prueba con otro filtro o rango de fechas." />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-soft ring-1 ring-ink/5">
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-ink/8 text-xs uppercase tracking-[0.12em] text-ink-3 md:table-header-group">
              <tr>
                <th className="px-5 py-3 font-semibold">Entrega</th>
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Total / pago</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={cn("grid cursor-pointer grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 p-4 transition hover:bg-paper/50 md:table-row md:p-0", o.delivery_date === today && "bg-butter-soft/40")}
                >
                  <td className="row-span-2 md:px-5 md:py-4">
                    <span className="block font-semibold">{formatShort(o.delivery_date)}</span>
                    <span className="text-xs text-ink-3">{o.time_slot ?? ""}</span>
                  </td>
                  <td className="md:px-5 md:py-4">
                    <span className="font-display font-semibold tracking-wide">{o.code}</span>
                    <span className="block max-w-[16rem] truncate text-xs text-ink-3">
                      {o.items.length ? o.items.map((i) => `${i.qty}× ${i.name}`).join(", ") : "Personalizado"}
                    </span>
                  </td>
                  <td className="col-start-2 md:px-5 md:py-4">
                    <span className="block font-medium">{o.customer_name}</span>
                    <span className="text-xs text-ink-3">{formatPhone(o.phone)}</span>
                  </td>
                  <td className="hidden md:table-cell md:px-5 md:py-4">
                    {o.has_quote_items && Number(o.subtotal) === 0 ? (
                      <span className="text-xs font-semibold text-[#7a5600]">A cotizar</span>
                    ) : (
                      <>
                        {formatPrice(Number(o.subtotal))}
                        {o.has_quote_items && <span className="text-xs text-ink-3"> +</span>}
                      </>
                    )}
                    {(() => {
                      const ps = paymentState(Number(o.subtotal), Number(o.paid_amount ?? 0), o.has_quote_items);
                      return (
                        <span className={cn("mt-1 block w-fit rounded-full px-2 py-0.5 text-[0.65rem] font-bold ring-1", PAYMENT_LABEL[ps].tone)}>
                          {PAYMENT_LABEL[ps].label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="col-start-3 row-start-1 md:px-5 md:py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="col-start-3 row-start-2 justify-self-end md:px-5 md:py-4" onClick={(e) => e.stopPropagation()}>
                    <WaButton phone={o.phone} text={statusMessage(o)} label="" className="w-9 justify-center px-0" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDrawer
        order={selected}
        onClose={() => setSelected(null)}
        onChange={replace}
        onDelete={(id) => {
          setOrders((list) => (list ?? []).filter((o) => o.id !== id));
          setSelected(null);
        }}
      />
    </>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <OrdersView />
    </Suspense>
  );
}
