"use client";

import { Loader } from "lucide-react";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { waToCustomer } from "@/lib/whatsapp";

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const s = ORDER_STATUSES.find((x) => x.value === status);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1", s?.tone, className)}>
      {s?.label ?? status}
    </span>
  );
}

export function WaButton({ phone, text, label = "WhatsApp", className }: { phone: string; text: string; label?: string; className?: string }) {
  return (
    <a
      href={waToCustomer(phone, text)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1fae57] px-3.5 text-xs font-semibold text-white transition hover:bg-[#178f47]",
        className
      )}
    >
      <WhatsAppIcon size={14} /> {label}
    </a>
  );
}

export function LoadingBlock({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-20 text-ink-3">
      <Loader className="size-6 animate-spin" />
      <span className="mt-3 text-sm">{label}</span>
    </div>
  );
}

export function EmptyBlock({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border-2 border-dashed border-ink/10 p-10 text-center">
      <p className="font-display text-xl">{title}</p>
      {text && <p className="mt-1 text-sm text-ink-3">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "bg-white" }: { label: string; value: React.ReactNode; hint?: string; tone?: string }) {
  return (
    <div className={cn("rounded-[1.5rem] p-5 shadow-soft ring-1 ring-ink/5", tone)}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">{label}</p>
      <p className="mt-3 font-display text-4xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-paper/60 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-pink" : "bg-ink/15")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
      </button>
    </label>
  );
}
