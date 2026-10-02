import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ChevronRight, MessageCircleHeart, Package, Sparkles } from "lucide-react";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { getOccasion } from "@/lib/occasions";
import { Price } from "@/components/ui/price";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { BRAND } from "@/lib/config";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

/** Se generan bajo demanda y se guardan en caché (ISR) */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.short_description || product.description?.slice(0, 160) || BRAND.description,
    openGraph: product.images[0] ? { images: [{ url: product.images[0] }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, all, settings] = await Promise.all([getProductBySlug(slug), getProducts(), getSettings()]);
  if (!product) notFound();

  const leadDays = Math.max(settings.min_lead_days, product.lead_days ?? 0);
  const occasions = product.occasions.map(getOccasion).filter((o) => o !== undefined);
  const related = all
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category_id === product.category_id || p.occasions.some((o) => product.occasions.includes(o)))
    )
    .slice(0, 4);

  return (
    <>
      <div className="container-x pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-ink-3" aria-label="Migas de pan">
          <Link href="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/tienda" className="hover:text-ink">Tienda</Link>
          {product.category && (
            <>
              <ChevronRight className="size-3.5" />
              <Link href={`/tienda?categoria=${product.category.slug}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          )}
        </nav>
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <ProductGallery images={product.images} video={product.video_url} name={product.name} />

        <div>
          {product.category && <p className="eyebrow text-pink-deep">{product.category.name}</p>}
          <h1 className="font-soft mt-3 text-4xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-5xl">{product.name}</h1>
          <Price price={product.price} compareAt={product.compare_at_price} size="lg" className="mt-5" />
          {product.short_description && (
            <p className="mt-5 text-lg leading-relaxed text-ink-3">{product.short_description}</p>
          )}

          {occasions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {occasions.map((o) => (
                <Link
                  key={o.slug}
                  href={`/ocasiones/${o.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5"
                  style={{ background: o.palette.from, color: o.palette.ink }}
                >
                  <OccasionIcon icon={o.icon} className="size-3.5" style={{ color: o.palette.accent }} />
                  {o.name}
                </Link>
              ))}
            </div>
          )}

          <div className="my-8 h-px bg-ink/10" />
          <ProductActions product={product} />

          <ul className="mt-8 grid gap-3 rounded-[1.5rem] bg-white/70 p-5 text-sm ring-1 ring-ink/5 sm:grid-cols-2">
            {product.is_customizable && (
              <li className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-[#7a55d3]" />
                <span>
                  <strong className="block">Personalizable</strong>
                  <span className="text-ink-3">{product.customization_hint || "Con tus fotos, nombres o frases."}</span>
                </span>
              </li>
            )}
            {leadDays > 0 && (
              <li className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-pink" />
                <span>
                  <strong className="block">Pídelo con anticipación</strong>
                  <span className="text-ink-3">
                    Mínimo {leadDays} día{leadDays === 1 ? "" : "s"} antes de la fecha.
                  </span>
                </span>
              </li>
            )}
            {product.stock !== null && (
              <li className="flex items-start gap-3">
                <Package className="mt-0.5 size-4 shrink-0 text-teal" />
                <span>
                  <strong className="block">{product.stock > 0 ? "Disponible" : "Agotado por ahora"}</strong>
                  <span className="text-ink-3">
                    {product.stock > 0 ? `Quedan ${product.stock} unidad${product.stock === 1 ? "" : "es"}.` : "Escríbenos para avisarte."}
                  </span>
                </span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <MessageCircleHeart className="mt-0.5 size-4 shrink-0 text-[#1fae57]" />
              <span>
                <strong className="block">Confirmamos por WhatsApp</strong>
                <span className="text-ink-3">Pago, fotos y entrega se coordinan contigo.</span>
              </span>
            </li>
          </ul>

          {product.description && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-medium">Descripción</h2>
              <div className="mt-4 whitespace-pre-line leading-relaxed text-ink-2">{product.description}</div>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x py-16">
          <SectionHeading eyebrow="También te puede gustar" title="Más detalles" accent="para enamorar" />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 xl:gap-x-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
