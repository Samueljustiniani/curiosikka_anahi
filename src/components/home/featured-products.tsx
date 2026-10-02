import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyCatalog } from "@/components/ui/empty-catalog";
import { buttonClass } from "@/components/ui/button";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Favoritos de la casa"
        title="Detalles que"
        accent="enamoran"
        description="Cada pieza se personaliza con tus fotos, nombres y frases."
        action={
          products.length > 0 ? (
            <Link href="/tienda" className={buttonClass("outline", "md")}>
              Ver toda la tienda <ArrowRight className="size-4" />
            </Link>
          ) : undefined
        }
      />
      <div className="mt-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyCatalog />
        )}
      </div>
    </section>
  );
}
