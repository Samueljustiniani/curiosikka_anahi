import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackForm } from "@/components/tracking/track-form";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Mi pedido",
  description: "Consulta el estado de tu pedido con tu código y tu número de celular.",
  robots: { index: false },
};

export default function SeguimientoPage() {
  return (
    <>
      <PageHero
        eyebrow="Mi pedido"
        title="¿En qué va"
        accent="tu detalle?"
        description="Ingresa el código que recibiste al separar y el celular con el que lo hiciste."
      />
      <div className="container-x">
        <Suspense fallback={<div className="skeleton mx-auto h-24 max-w-3xl rounded-[2rem]" />}>
          <TrackForm />
        </Suspense>
      </div>
    </>
  );
}
