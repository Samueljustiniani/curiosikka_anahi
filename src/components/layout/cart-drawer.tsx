"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import { GiftBox, Heart } from "@/components/ui/illustrations";
import { buttonClass } from "@/components/ui/button";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, subtotal, hasQuote, count } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Mi lista"
            className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col bg-cream shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
              <div>
                <p className="eyebrow text-pink-deep">Para separar</p>
                <h2 className="mt-1 font-display text-2xl font-medium">
                  Mi lista <span className="text-ink-3">({count})</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-full bg-white shadow-soft transition hover:rotate-90"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="relative">
                  <GiftBox className="w-32 animate-float" />
                  <Heart className="absolute -right-3 -top-2 size-6 animate-twinkle" />
                </div>
                <div>
                  <p className="font-display text-2xl">Tu lista está vacía</p>
                  <p className="mt-2 text-sm text-ink-3">
                    Agrega los detalles que te gusten y sepáralos para la fecha que quieras.
                  </p>
                </div>
                <Link href="/tienda" onClick={() => setOpen(false)} className={buttonClass("primary", "md")}>
                  Ver la tienda <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink/8 overflow-y-auto px-6">
                  {items.map((it) => (
                    <motion.li key={it.productId} layout className="flex gap-4 py-5">
                      <Link
                        href={`/producto/${it.slug}`}
                        onClick={() => setOpen(false)}
                        className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5"
                      >
                        {it.image ? (
                          <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
                        ) : (
                          <span className="grid h-full place-items-center">
                            <ShoppingBag className="size-6 text-ink-3" />
                          </span>
                        )}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/producto/${it.slug}`}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 font-medium leading-snug hover:text-pink-deep"
                          >
                            {it.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(it.productId)}
                            className="shrink-0 rounded-full p-1.5 text-ink-3 transition hover:bg-blush hover:text-pink-deep"
                            aria-label={`Quitar ${it.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-ink-3">{formatPrice(it.price)}</p>
                        <input
                          value={it.note}
                          onChange={(e) => update(it.productId, { note: e.target.value.slice(0, 300) })}
                          placeholder="Nombre, frase o detalle (opcional)"
                          className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-[0.8rem] placeholder:text-ink-3/70 focus:border-pink focus:outline-none"
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full bg-white ring-1 ring-ink/10">
                            <button
                              type="button"
                              onClick={() => update(it.productId, { qty: it.qty - 1 })}
                              className="grid size-8 place-items-center rounded-full hover:bg-paper disabled:opacity-40"
                              disabled={it.qty <= 1}
                              aria-label="Menos"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">{it.qty}</span>
                            <button
                              type="button"
                              onClick={() => update(it.productId, { qty: it.qty + 1 })}
                              className="grid size-8 place-items-center rounded-full hover:bg-paper"
                              aria-label="Más"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="font-display font-semibold tabular-nums">
                            {it.price === null ? "A cotizar" : formatPrice(it.price * it.qty)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <div className="border-t border-ink/8 bg-white/70 px-6 pb-6 pt-5 backdrop-blur">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-3">Subtotal</span>
                    <span className="font-display text-2xl font-semibold tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  {hasQuote && (
                    <p className="mt-1 text-right text-xs text-ink-3">+ productos con precio a cotizar</p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-ink-3">
                    Eliges la fecha, separas con tu número y confirmamos todo contigo por WhatsApp.
                  </p>
                  <Link
                    href="/separar"
                    onClick={() => setOpen(false)}
                    className={buttonClass("pink", "lg", "mt-4 w-full")}
                  >
                    Separar mi pedido <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-2 w-full py-2 text-sm font-medium text-ink-3 hover:text-ink"
                  >
                    Seguir viendo
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
