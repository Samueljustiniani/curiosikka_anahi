"use client";

import Link from "next/link";
import { ArrowRight, CalendarHeart, MessageCircleHeart, Smartphone } from "lucide-react";
import { HeroScene } from "./hero-scene";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Underline } from "@/components/ui/illustrations";
import { useSite } from "@/components/providers/site-provider";
import { WA_GREETING, waLink } from "@/lib/whatsapp";
import { BRAND } from "@/lib/config";

export function Hero({ videoUrl, posterUrl }: { videoUrl?: string | null; posterUrl?: string | null }) {
  const { whatsapp } = useSite();

  return (
    <section className="relative overflow-hidden pb-16 pt-6 sm:pt-10 lg:pb-24">
      {/* luz de fondo */}
      <div className="pointer-events-none absolute -left-40 top-10 size-[34rem] rounded-full bg-pink-soft/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 size-[30rem] rounded-full bg-teal-soft/60 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <div className="relative z-10 max-w-2xl">
          <p style={{ animationDelay: "0.05s" }} className="animate-rise inline-flex items-center gap-2.5 rounded-full bg-white/80 py-1.5 pl-1.5 pr-4 text-[0.8rem] font-medium text-ink-2 shadow-soft ring-1 ring-ink/5 backdrop-blur max-sm:pl-4"
          >
            <span className="hidden rounded-full bg-lilac-soft px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5b3fa8] sm:inline">
              {BRAND.name}
            </span>
            {BRAND.tagline}
          </p>

          <h1 style={{ animationDelay: "0.15s" }} className="animate-rise font-soft mt-7 text-[2.9rem] font-medium leading-[0.98] tracking-[-0.035em] text-ink sm:text-[4.2rem] lg:text-[4.6rem] xl:text-[5.2rem]"
          >
            Transformamos tus ideas en{" "}
            <span className="relative inline-block whitespace-nowrap">
              <em className="font-wonk relative z-10 text-pink italic">regalos</em>
              <span className="absolute -bottom-1 left-0 right-0 z-0 h-4 animate-draw [animation-delay:1s] sm:-bottom-2 sm:h-5">
                <Underline color="#f9c5da" className="h-full w-full" />
              </span>
            </span>{" "}
            inolvidables.
          </h1>

          <p style={{ animationDelay: "0.28s" }} className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-ink-3 sm:text-xl">
            Cuadros personalizados, detalles y recuerdos únicos para sorprender a quienes más quieres —
            <span className="text-ink"> para cada fecha especial del año.</span>
          </p>

          <div style={{ animationDelay: "0.4s" }} className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/tienda" className={buttonClass("primary", "lg")}>
              Explorar la tienda
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
            <a
              href={waLink(WA_GREETING, whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline", "lg")}
            >
              <WhatsAppIcon size={19} className="text-[#1fae57]" />
              Pedir por WhatsApp
            </a>
          </div>

          <ul style={{ animationDelay: "0.55s" }} className="animate-rise mt-11 grid max-w-xl grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            {[
              { Icon: CalendarHeart, title: "Separa tu fecha", text: "Elige el día en el calendario" },
              { Icon: Smartphone, title: "Solo tu celular", text: "Sin cuentas ni contraseñas" },
              { Icon: MessageCircleHeart, title: "Todo por WhatsApp", text: "Coordinamos cada detalle" },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-pink shadow-soft ring-1 ring-ink/5">
                  <Icon className="size-[1.1rem]" />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="text-ink-3">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <HeroScene videoUrl={videoUrl} posterUrl={posterUrl} />
        </div>
      </div>
    </section>
  );
}
