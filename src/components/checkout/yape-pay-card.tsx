"use client";

import { Copy, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useSite } from "@/components/providers/site-provider";
import { cn, formatPhone, formatPrice } from "@/lib/utils";

/** Datos de Yape para pagar, pensados para gente que no es experta en tecnología */
export function YapePayCard({
  amount,
  caption,
  className,
}: {
  /** Monto a pagar ahora; null = la tienda lo confirma por WhatsApp */
  amount: number | null;
  caption?: string;
  className?: string;
}) {
  const { yape_number, yape_name, yape_qr_url } = useSite();
  if (!yape_number && !yape_qr_url) return null;

  const copy = () => {
    if (!yape_number) return;
    navigator.clipboard?.writeText(yape_number.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "")).then(
      () => toast.success("Número copiado", { description: "Pégalo en Yape para pagar." }),
      () => {}
    );
  };

  return (
    <div className={cn("overflow-hidden rounded-[1.75rem] bg-[#f3ebff] text-left ring-1 ring-[#742284]/15", className)}>
      <div className="flex items-center justify-between gap-3 bg-[#742284] px-5 py-3.5 text-white">
        <p className="font-display text-xl font-semibold">Paga con Yape</p>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Asegura tu fecha</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        {yape_qr_url && (
          <a href={yape_qr_url} target="_blank" rel="noopener noreferrer" className="mx-auto block w-40 sm:w-36" title="Abrir QR en grande">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={yape_qr_url} alt="Código QR de Yape" className="w-full rounded-2xl bg-white p-2 shadow-soft" />
            <span className="mt-1.5 block text-center text-[0.7rem] font-semibold text-[#742284]">Toca para ver en grande</span>
          </a>
        )}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#742284]/70">{amount ? "Monto a yapear" : "Monto"}</p>
            <p className="font-display text-3xl font-semibold text-ink">{amount ? formatPrice(amount) : "Te lo confirmamos"}</p>
            {caption && <p className="text-sm text-ink-3">{caption}</p>}
          </div>
          {yape_number && (
            <button
              type="button"
              onClick={copy}
              className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-soft transition hover:ring-2 hover:ring-[#742284]/30"
            >
              <Smartphone className="size-5 shrink-0 text-[#742284]" />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold tracking-wide">{formatPhone(yape_number)}</span>
                {yape_name && <span className="block truncate text-xs text-ink-3">A nombre de {yape_name}</span>}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#742284]">
                <Copy className="size-3.5" /> Copiar
              </span>
            </button>
          )}
          <ol className="space-y-1 text-sm text-ink-2">
            <li>1. Abre Yape y {yape_number ? "yapea a este número" : "escanea el QR"}.</li>
            <li>2. Toca <strong>“Ya pagué”</strong> y envíanos tu comprobante por WhatsApp.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
