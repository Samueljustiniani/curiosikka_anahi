"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "./button";
import { WhatsAppIcon } from "./brand-icons";
import { Bulb, Heart, Jar, Sparkle } from "./illustrations";
import { useSite } from "@/components/providers/site-provider";
import { WA_GREETING, waLink } from "@/lib/whatsapp";

/** Estado vacío elegante cuando aún no hay productos publicados */
export function EmptyCatalog({
  title = "Estamos preparando nuevos detalles",
  text = "Muy pronto verás aquí nuestro catálogo. Mientras tanto, cuéntanos tu idea: hacemos cuadros y detalles a tu medida.",
}: {
  title?: string;
  text?: string;
}) {
  const { whatsapp } = useSite();
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white/70 px-6 py-14 text-center shadow-soft ring-1 ring-ink/5 sm:px-12">
      <div className="dotted-bg absolute inset-0 opacity-50" />
      <Sparkle className="absolute left-[12%] top-10 size-6 animate-twinkle" />
      <Heart className="absolute bottom-12 right-[14%] size-6 animate-float" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center">
        <div className="flex items-end gap-2">
          <Bulb className="w-16 animate-float [--r:-6deg]" />
          <Jar className="w-14 animate-float [animation-delay:1s]" />
        </div>
        <h3 className="mt-6 font-display text-3xl font-medium">{title}</h3>
        <p className="mt-3 text-ink-3">{text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/personalizado" className={buttonClass("primary", "md")}>
            Pedir un personalizado <ArrowRight className="size-4" />
          </Link>
          <a href={waLink(WA_GREETING, whatsapp)} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md")}>
            <WhatsAppIcon size={18} className="text-[#1fae57]" /> Escríbenos
          </a>
        </div>
      </div>
    </div>
  );
}
