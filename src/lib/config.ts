export const BRAND = {
  name: "Curiosiika",
  tagline: "Detalles · Manualidades · Curiosidades",
  pitch: "Transformamos tus ideas en regalos inolvidables.",
  description:
    "Creamos cuadros personalizados, detalles y recuerdos únicos para sorprender a quienes más quieres. Personalización, calidad y atención en cada pedido.",
  whatsapp: "51912470219",
  whatsappDisplay: "912 470 219",
  facebook: "https://www.facebook.com/people/Curiosiika/61591787475115/",
  location: "San Vicente, Lima, Perú",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

export const NAV_LINKS = [
  { href: "/tienda", label: "Tienda" },
  { href: "/ocasiones", label: "Ocasiones" },
  { href: "/calendario", label: "Calendario" },
  { href: "/personalizado", label: "Personalizado" },
  { href: "/mis-fechas", label: "Mis fechas" },
] as const;
