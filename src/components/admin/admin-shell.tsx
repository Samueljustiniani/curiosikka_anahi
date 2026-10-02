"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BellRing, CalendarDays, ExternalLink, LayoutDashboard, Menu, Package, Settings, ShoppingBag, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { countPendingReminders } from "@/lib/reminders";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { SignOutButton } from "./sign-out-button";

/** Fechas de clientes que toca escribir ahora (se recalcula al cambiar de sección) */
function usePendingReminders(pathname: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    getSupabaseBrowser()
      .from("reminders")
      .select("month, day, last_contacted_at")
      .then(({ data }) => setCount(countPendingReminders(data ?? [])));
  }, [pathname]);
  return count;
}

const LINKS = [
  { href: "/admin", label: "Resumen", Icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ShoppingBag },
  { href: "/admin/calendario", label: "Calendario", Icon: CalendarDays },
  { href: "/admin/productos", label: "Productos", Icon: Package },
  { href: "/admin/clientes", label: "Clientes", Icon: Users },
  { href: "/admin/recordatorios", label: "Recordatorios", Icon: BellRing },
  { href: "/admin/ajustes", label: "Ajustes", Icon: Settings },
];

function NavLinks({ pathname, onNavigate, badges }: { pathname: string; onNavigate?: () => void; badges: Record<string, number> }) {
  return (
    <nav className="space-y-1" aria-label="Panel">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.92rem] font-medium transition-colors",
              active ? "text-ink" : "text-ink-3 hover:bg-white/60 hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav"
                className="absolute inset-0 -z-10 rounded-2xl bg-white shadow-soft ring-1 ring-ink/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon className={cn("size-[1.1rem]", active && "text-pink")} />
            {label}
            {badges[href] > 0 && (
              <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1.5 text-[0.68rem] font-bold text-white" title="Clientes por escribir">
                {badges[href]}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <span className="relative size-11 overflow-hidden rounded-full ring-1 ring-pink/30">
        <Image src="/brand/logo-320.webp" alt="" fill sizes="44px" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold">Curiosiika</span>
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-3">Panel</span>
      </span>
    </Link>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const pendingReminders = usePendingReminders(pathname);
  const badges = { "/admin/recordatorios": pendingReminders };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink/5 bg-paper/60 p-5 backdrop-blur lg:flex">
        <Brand />
        <div className="mt-10 flex-1">
          <NavLinks pathname={pathname} badges={badges} />
        </div>
        <div className="space-y-2 border-t border-ink/8 pt-4">
          <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-3 hover:text-ink">
            <ExternalLink className="size-4" /> Ver tienda
          </a>
          <p className="truncate px-3 text-xs text-ink-3" title={email}>{email}</p>
          <SignOutButton compact />
        </div>
      </aside>

      {/* Barra móvil */}
      <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink/5 px-4 lg:hidden">
        <Brand />
        <button type="button" onClick={() => setOpen(true)} className="relative grid size-11 place-items-center rounded-full bg-white shadow-soft" aria-label="Abrir menú">
          <Menu className="size-5" />
          {pendingReminders > 0 && <span className="absolute right-1 top-1 size-2.5 rounded-full bg-pink ring-2 ring-white" />}
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-cream p-5"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-white" aria-label="Cerrar">
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-8 flex-1">
                <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} badges={badges} />
              </div>
              <a href="/" target="_blank" className="mb-2 flex items-center gap-2 px-3 py-2 text-sm text-ink-3">
                <ExternalLink className="size-4" /> Ver tienda
              </a>
              <SignOutButton compact />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-ink-3">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[1.5rem] bg-white p-5 shadow-soft ring-1 ring-ink/5 sm:p-6", className)}>{children}</div>;
}
