import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/product/catalog";
import { PageHero } from "@/components/ui/page-hero";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tienda",
  description: "Cuadros personalizados, detalles, manualidades y curiosidades para cada fecha especial.",
};

export default async function TiendaPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHero
        eyebrow="Tienda"
        title="Detalles que dicen"
        accent="lo que sientes"
        description="Elige, agrégalo a tu lista y sepáralo para la fecha que quieras. Todo se personaliza contigo por WhatsApp."
      />
      <div className="container-x pb-10">
        <Suspense fallback={<div className="skeleton h-40 rounded-3xl" />}>
          <Catalog products={products} categories={categories} />
        </Suspense>
      </div>
    </>
  );
}
