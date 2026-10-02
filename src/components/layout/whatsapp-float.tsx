"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { useSite } from "@/components/providers/site-provider";
import { WA_GREETING, waLink } from "@/lib/whatsapp";

const SEEN_KEY = "curiosiika:wa-bubble";

export function WhatsAppFloat() {
  const { whatsapp } = useSite();
  const pathname = usePathname();
  const [bubble, setBubble] = useState(false);
  // En la compra (celular) hay una barra fija con el botón: no la tapamos
  const hideOnMobile = pathname === "/separar" || pathname === "/personalizado";

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => setBubble(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    setBubble(false);
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };

  return (
    <div className={`fixed bottom-5 right-4 z-50 flex items-end gap-3 sm:bottom-7 sm:right-7 ${hideOnMobile ? "max-lg:hidden" : ""}`}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative mb-2 hidden max-w-[15rem] rounded-2xl rounded-br-md bg-white p-4 pr-9 text-sm shadow-lift ring-1 ring-ink/5 sm:block"
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-2 top-2 rounded-full p-1 text-ink-3 hover:bg-paper"
              aria-label="Cerrar mensaje"
            >
              <X className="size-3.5" />
            </button>
            <p className="font-semibold text-ink">¿Tienes una idea? 💡</p>
            <p className="mt-1 text-ink-3">Cuéntanosla por WhatsApp y la hacemos realidad.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={waLink(WA_GREETING, whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        className="group relative grid size-14 place-items-center rounded-full bg-[#1fae57] text-white shadow-[0_14px_34px_-10px_rgb(31_174_87/0.75)] transition-transform hover:scale-105 sm:size-16"
        aria-label="Escríbenos por WhatsApp"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#1fae57] opacity-25 [animation-duration:2.4s]" />
        <WhatsAppIcon size={30} className="relative" />
      </a>
    </div>
  );
}
