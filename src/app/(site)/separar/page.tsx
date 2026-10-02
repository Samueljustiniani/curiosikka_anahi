import type { Metadata } from "next";
import { Suspense } from "react";
import { SepararForm } from "@/components/checkout/separar-form";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Separar mi pedido",
  description: "Elige la fecha, deja tu número y confirma tu pedido por WhatsApp.",
  robots: { index: false },
};

export default function SepararPage() {
  return (
    <>
      <PageHero
        eyebrow="Separar"
        title="Separa tu detalle"
        accent="en 3 pasos"
        description="Elige la fecha, deja tu número y listo: lo confirmamos contigo por WhatsApp."
      />
      <div className="container-x">
        <Suspense fallback={<div className="skeleton h-[40rem] rounded-[2rem]" />}>
          <SepararForm mode="cart" />
        </Suspense>
      </div>
    </>
  );
}
