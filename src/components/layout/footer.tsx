import Link from "next/link";
import { ArrowUpRight, Lock, MapPin } from "lucide-react";
import { BRAND } from "@/lib/config";
import { OCCASIONS } from "@/lib/occasions";
import { formatPhone } from "@/lib/utils";
import { WA_GREETING, waLink } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { Heart, Sparkle, Star } from "@/components/ui/illustrations";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const socials = [
    settings.facebook_url && { href: settings.facebook_url, label: "Facebook", Icon: FacebookIcon },
    settings.instagram_url && { href: settings.instagram_url, label: "Instagram", Icon: InstagramIcon },
    settings.tiktok_url && { href: settings.tiktok_url, label: "TikTok", Icon: TikTokIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof FacebookIcon }[];

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream">
      {/* Banda CTA */}
      <div className="relative border-b border-white/10">
        <Sparkle className="absolute left-[8%] top-10 size-6 animate-twinkle" />
        <Star color="#b49be3" className="absolute right-[12%] top-14 size-4 animate-twinkle [animation-delay:1s]" />
        <Heart className="absolute bottom-10 right-[30%] size-5 animate-float" />
        <div className="container-x flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center md:py-20">
          <h2 className="max-w-2xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl">
            ¿Tienes una idea? <br />
            <em className="font-wonk text-pink-soft italic">Nosotros le damos forma.</em>
          </h2>
          <a
            href={waLink(WA_GREETING, settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-16 items-center gap-3 rounded-full bg-cream pl-3 pr-7 text-lg font-semibold text-ink transition-transform hover:-translate-y-1"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#1fae57] text-white">
              <WhatsAppIcon size={22} />
            </span>
            {formatPhone(settings.whatsapp)}
            <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>

      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="inline-block rounded-full bg-cream/95 p-1.5 pr-5">
            <Logo size={44} />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/70">{BRAND.description}</p>
          {settings.address && (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-cream/80">
              <MapPin className="size-4 text-pink-soft" /> {settings.address}
            </p>
          )}
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full bg-white/8 ring-1 ring-white/10 transition hover:bg-pink hover:ring-pink"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow text-cream/50">Tienda</p>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              ["/tienda", "Todos los productos"],
              ["/personalizado", "Pedido personalizado"],
              ["/calendario", "Calendario"],
              ["/separar", "Mi lista"],
              ["/seguimiento", "Seguir mi pedido"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-cream/80 transition hover:text-pink-soft">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-cream/50">Ocasiones</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
            {OCCASIONS.slice(0, 7).map((o) => (
              <li key={o.slug}>
                <Link href={`/ocasiones/${o.slug}`} className="text-cream/80 transition hover:text-pink-soft">
                  {o.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/ocasiones" className="font-semibold text-pink-soft">
                Ver todas →
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-cream/50">Nunca olvides una fecha</p>
          <p className="mt-5 text-sm leading-relaxed text-cream/70">
            Guarda los cumpleaños y aniversarios de quienes quieres. Te escribimos por WhatsApp unos días antes.
          </p>
          <Link
            href="/mis-fechas"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-deep"
          >
            Guardar mis fechas <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>
              © {year} {BRAND.name} · {BRAND.tagline}
            </span>
            <Link href="/admin" className="inline-flex items-center gap-1.5 transition hover:text-cream" prefetch={false}>
              <Lock className="size-3" /> Acceso tienda
            </Link>
          </p>
          <p className="font-hand text-base text-cream/60">Hecho con amor, pieza por pieza ♡</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[22vw] font-semibold leading-[0.75] tracking-tighter text-white/[0.035]"
      >
        Curiosiika
      </p>
    </footer>
  );
}
