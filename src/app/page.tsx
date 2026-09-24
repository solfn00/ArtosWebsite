import About from "@/components/About";
import Contact from "@/components/Contact";
import FoodSection from "@/components/FoodSection";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Location from "@/components/Location";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import Motion from "@/components/Motion";
import Reviews from "@/components/Reviews";
import MobileActionBar from "@/components/MobileActionBar";
import { menu, photos, site, siteUrl, socials, telHref } from "@/content/site";

/** every price on the menu, low to high — used for priceRange below */
const prices = menu
  .flatMap((c) => c.items.map((i) => i.price))
  .filter((p): p is number => typeof p === "number")
  .sort((a, b) => a - b);

/**
 * Structured data — verified fields only. The coordinates come from the
 * owner's own Google Maps link; no street address, opening hours or rating is
 * included because none was supplied.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: site.nameHe,
  alternateName: [site.nameEn, "Art'os"],
  description: site.description,
  slogan: site.slogan,
  url: siteUrl,
  logo: `${siteUrl}${photos.logo.src}`,
  image: [photos.truck, photos.seating, photos.seaview, photos.palms].map((p) => `${siteUrl}${p.src}`),
  address: {
    "@type": "PostalAddress",
    addressLocality: site.location,
    addressCountry: "IL",
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
  hasMap: site.mapsIsPlaceholder ? undefined : site.mapsUrl,
  telephone: site.contact.phone ? telHref(site.contact.phone).replace("tel:", "") : undefined,
  sameAs: socials.map((s) => s.href),
  priceRange: `₪${prices[0]}–₪${prices[prices.length - 1]}`,
  hasMenu: `${siteUrl}/#food`,
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        data-behind-menu
        className="sr-only z-[60] rounded bg-turq font-semibold text-navy focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:px-4 focus:py-2"
      >
        דלגו לתוכן
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Marquee />
        <FoodSection />
        <Reviews />
        <Gallery />
        <Location />
        <Contact />
      </main>
      <Footer />
      <MobileActionBar />
      <Motion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
