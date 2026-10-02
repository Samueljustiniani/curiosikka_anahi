import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { OccasionSpotlight } from "@/components/home/occasion-spotlight";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { OccasionsTimeline } from "@/components/home/occasions-timeline";
import { StoryReel } from "@/components/home/story-reel";
import { RemindersCta } from "@/components/home/reminders-cta";
import { Faq } from "@/components/home/faq";
import { ProductReels } from "@/components/home/product-reels";
import { getCategories, getFeaturedProducts, getProducts, getProductsForOccasion, getSettings } from "@/lib/data";
import { upcomingOccasions } from "@/lib/occasions";
import { limaToday } from "@/lib/dates";

export const revalidate = 60;

export default async function HomePage() {
  const upcoming = upcomingOccasions(limaToday());
  const next = upcoming[0];
  const [settings, categories, featured, nextProducts, all] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getProductsForOccasion(next.occasion.slug, 3),
    getProducts(),
  ]);
  const withVideo = all.filter((p) => p.video_url).slice(0, 10);

  return (
    <>
      <Hero videoUrl={settings.hero_video_url} posterUrl={settings.hero_poster_url} />
      <Marquee />
      <OccasionSpotlight next={next} products={nextProducts} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <ProductReels products={withVideo} />
      <OccasionsTimeline upcoming={upcoming} />
      <StoryReel />
      <RemindersCta />
      <Faq />
    </>
  );
}
