"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSite } from "@/components/providers/site-provider";
import { cn } from "@/lib/utils";

export function Faq() {
  const { min_lead_days } = useSite();
  const [open, setOpen] = useState<number | null>(0);

  const items = [
    {
      q: "¿Cómo separo un detalle?",
      a: "Agrega los productos a tu lista, elige la fecha en el calendario y escribe tu nombre y celular. Al terminar se abre WhatsApp con tu pedido listo para enviarnos y lo confirmamos contigo.",
    },
    {
      q: "¿Por qué solo me piden mi número de celular?",
      a: "Tu celular es tu identificación: con él guardamos tus pedidos y tus fechas importantes, sin cuentas ni contraseñas. Cada número corresponde a una sola persona.",
    },
    {
      q: "¿Con cuánta anticipación debo pedir?",
      a:
        min_lead_days > 0
          ? `Como mínimo con ${min_lead_days} día${min_lead_days === 1 ? "" : "s"} de anticipación; algunos detalles personalizados necesitan más tiempo y lo verás en cada producto. Para fechas grandes como San Valentín o el Día de la Madre, separa lo antes posible.`
          : "Algunos detalles personalizados necesitan más tiempo y lo verás en cada producto. Para fechas grandes como San Valentín o el Día de la Madre, separa lo antes posible.",
    },
    {
      q: "¿Puedo pedir algo que no está en la tienda?",
      a: "¡Claro! En “Personalizado” nos cuentas tu idea, la ocasión y la fecha. Te respondemos por WhatsApp con la propuesta.",
    },
    {
      q: "¿Cómo pago y cómo recibo mi pedido?",
      a: "El pago y la entrega (recojo o delivery) los coordinamos contigo por WhatsApp al confirmar tu pedido.",
    },
    {
      q: "¿Cómo sé en qué va mi pedido?",
      a: "Al separar recibes un código (por ejemplo CK-XXXXX). En “Mi pedido” lo ingresas junto a tu celular y ves el estado actualizado.",
    },
  ];

  return (
    <section className="container-x py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Todo lo que"
          accent="necesitas saber"
          description="¿Te queda alguna duda? Escríbenos por WhatsApp, respondemos con gusto."
        />
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={cn("font-display text-xl font-medium transition-colors sm:text-2xl", isOpen && "text-pink-deep")}>
                    {it.q}
                  </span>
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full ring-1 transition-all duration-500",
                      isOpen ? "rotate-45 bg-pink text-white ring-pink" : "ring-ink/15"
                    )}
                  >
                    <Plus className="size-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 leading-relaxed text-ink-3">{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
