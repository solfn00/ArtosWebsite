import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import { site, siteUrl } from "@/content/site";
import "./globals.css";

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-frank",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const title = `${site.nameHe} | ${site.nameEn} — ${site.kind} ב${site.location}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "/",
    siteName: `${site.nameHe} | ${site.nameEn}`,
    title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#052754",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the inline script below adds `motion-armed` before React hydrates
    <html lang="he" dir="rtl" className={`${frank.variable} ${heebo.variable}`} suppressHydrationWarning>
      <head>
        {/* Hides animated elements just long enough for the motion script to
            take over; the timer guarantees content appears even if it fails. */}
        <script dangerouslySetInnerHTML={{ __html: "try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).has('motion')){d.className+=' motion-armed';setTimeout(function(){d.classList.remove('motion-armed')},2000)}}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
