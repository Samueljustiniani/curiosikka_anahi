"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, PackageSearch, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { BRAND, NAV_LINKS } from "@/lib/config";
import { cn, formatPhone } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useSite } from "@/components/providers/site-provider";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { WA_GREETING, waLink } from "@/lib/whatsapp";
import { Heart, Sparkle } from "@/components/ui/illustrations";

const MOBILE_LINKS = [{ href: "/", label: "Inicio" }, ...NAV_LINKS, { href: "/seguimiento", label: "Mi pedido" }];

export function Header() {
  const pathname = usePathname();
  const { count, setOpen, ready } = useCart();
  const { whatsapp } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500",
          scrolled ? "glass border-b border-ink/5 shadow-[0_8px_30px_-20px_rgb(28_27_58/0.35)]" : "border-b border-transparent"
        )}
      >
        <div
          className={cn(
            "container-x flex items-center justify-between gap-3 transition-[height] duration-500",
            scrolled ? "h-16" : "h-[4.75rem]"
          )}
        >
          <Logo size={scrolled ? 40 : 46} />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-3 py-2 text-[0.9rem] font-medium transition-colors xl:px-4",
                  isActive(l.href) ? "text-ink" : "text-ink-3 hover:text-ink"
                )}
              >
                {isActive(l.href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-soft ring-1 ring-ink/5"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                  />
                )}
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/seguimiento"
              className="hidden h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink-3 transition-colors hover:text-ink xl:inline-flex"
            >
              <PackageSearch className="size-4" />
              Mi pedido
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-soft ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              aria-label={`Abrir mi lista (${count} productos)`}
            >
              <ShoppingBag className="size-[1.1rem]" />
              <span className="hidden whitespace-nowrap sm:inline">Mi lista</span>
              <AnimatePresence>
                {ready && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1.5 text-[0.7rem] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <a
              href={waLink(WA_GREETING, whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 hover:bg-ink-2 md:inline-flex xl:px-5"
            >
              <WhatsAppIcon size={17} />
              Escríbenos
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-soft ring-1 ring-ink/5 lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-cream"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
            >
              <div className="flex h-20 shrink-0 items-center justify-between px-5">
                <Logo size={42} />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-white shadow-soft"
                  aria-label="Cerrar menú"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="relative flex flex-1 flex-col px-5 pt-4" aria-label="Menú móvil">
                <Sparkle className="pointer-events-none absolute right-10 top-2 size-6 animate-twinkle" />
                <Heart className="pointer-events-none absolute right-24 top-24 size-5 animate-float" />
                {MOBILE_LINKS.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                  >
                    <Link
                      href={l.href}
                      className={cn(
                        "group flex items-center justify-between border-b border-ink/10 py-4 font-display text-[1.9rem] leading-none",
                        isActive(l.href) ? "italic text-pink" : "text-ink"
                      )}
                    >
                      {l.label}
                      <ArrowUpRight className="size-6 opacity-30 transition-all group-hover:rotate-45 group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="space-y-3 p-5">
                <a
                  href={waLink(WA_GREETING, whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#1fae57] font-semibold text-white"
                >
                  <WhatsAppIcon size={20} /> Escríbenos al {formatPhone(whatsapp)}
                </a>
                <p className="text-center text-xs text-ink-3">{BRAND.location}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
