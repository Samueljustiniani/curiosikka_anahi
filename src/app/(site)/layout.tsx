import { AdminBar } from "@/components/layout/admin-bar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartProvider } from "@/components/providers/cart-provider";
import { SiteProvider } from "@/components/providers/site-provider";
import { getSettings } from "@/lib/data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <SiteProvider
      value={{
        whatsapp: settings.whatsapp,
        daily_capacity: settings.daily_capacity,
        min_lead_days: settings.min_lead_days,
        announcement: settings.announcement,
        facebook_url: settings.facebook_url,
        instagram_url: settings.instagram_url,
        tiktok_url: settings.tiktok_url,
        address: settings.address,
        yape_number: settings.yape_number,
        yape_name: settings.yape_name,
        yape_qr_url: settings.yape_qr_url,
        deposit_percent: settings.deposit_percent,
      }}
    >
      <CartProvider>
        <div className="relative flex min-h-dvh flex-col">
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </div>
        <CartDrawer />
        <WhatsAppFloat />
        <AdminBar />
      </CartProvider>
    </SiteProvider>
  );
}
