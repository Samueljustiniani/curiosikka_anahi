import type { Metadata } from "next";
import { Suspense } from "react";
import { Camera, MessageCircleHeart, Palette, Scissors } from "lucide-react";
import { SepararForm } from "@/components/checkout/separar-form";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Pedido personalizado",
  description: "Cuéntanos tu idea: cuadros con tus fotos, frases y detalles hechos a tu medida para cualquier fecha.",
};

const POINTS = [
  { Icon: Camera, title: "Tus fotos", text: "Las que más quieras: las envías por WhatsApp." },
  { Icon: Palette, title: "Tu estilo", text: "Colores, frases, nombres y fechas que importan." },
  { Icon: Scissors, title: "Hecho a mano", text: "Lo armamos pieza por pieza." },
  { Icon: MessageCircleHeart, title: "Contigo", text: "Te mostramos la propuesta antes de hacerlo." },
];

export default function PersonalizadoPage() {
  return (
    <>
      <PageHero
        eyebrow="Pedido personalizado"
        title="Tú lo imaginas,"
        accent="nosotros lo hacemos"
        description="Cuadros personalizados, detalles y recuerdos únicos creados desde cero para esa persona especial."
      >
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="flex h-full items-start gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-ink/5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac-soft text-[#5b3fa8]">
                  <Icon className="size-[1.1rem]" />
                </span>
                <span className="text-sm">
                  <strong className="block text-ink">{title}</strong>
                  <span className="text-ink-3">{text}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </PageHero>
      <div className="container-x">
        <Suspense fallback={<div className="skeleton h-[40rem] rounded-[2rem]" />}>
          <SepararForm mode="custom" />
        </Suspense>
      </div>
    </>
  );
}
