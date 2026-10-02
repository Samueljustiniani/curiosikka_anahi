import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.name} · Cuadros personalizados y detalles únicos`,
    template: `%s · ${BRAND.name}`,
  },
  description: `${BRAND.pitch} ${BRAND.description}`,
  keywords: [
    "cuadros personalizados",
    "detalles personalizados",
    "regalos personalizados Lima",
    "Día del Novio",
    "San Valentín",
    "Día de la Madre",
    "manualidades",
    "Curiosiika",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: BRAND.name,
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description: BRAND.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fff9f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth" className={`${fraunces.variable} ${jakarta.variable} ${caveat.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "1rem",
              fontFamily: "var(--font-jakarta)",
              border: "1px solid rgb(28 27 58 / 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
