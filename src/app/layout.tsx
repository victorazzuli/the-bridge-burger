import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Figtree } from "next/font/google";
import "./globals.css";
import { SITE } from "@/data/site";
import { DELIVERY_FEES, HOURS } from "@/data/hours";
import { CartProvider } from "@/hooks/useCart";

// Display: grotesca condensada de sinalização urbana (estrutura, cidade, ponte).
const display = Big_Shoulders({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-display", display: "swap", adjustFontFallback: false });
// Texto: geométrica arredondada que conversa com o "The Bridge" do logo.
const body = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const title = "The Bridge Burger | Hamburgueria artesanal em Guarulhos";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: title, template: "%s | The Bridge Burger" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["The Bridge Burger", "hamburgueria em Guarulhos", "hambúrguer artesanal", "burger Guarulhos", "Ponte Grande"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE.url,
    siteName: SITE.name,
    title,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title, description: SITE.description },
  robots: SITE.preview ? { index: false, follow: false } : { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0E0B09",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const DAY_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE.url}/#restaurant`,
  name: SITE.name,
  alternateName: SITE.legalName,
  slogan: SITE.slogan,
  description: SITE.description,
  url: SITE.url,
  image: [`${SITE.url}/img/galeria/burger-na-tabua.jpg`, `${SITE.url}/img/galeria/quatro-em-um.jpg`],
  logo: `${SITE.url}/brand/logo-on-dark-2048.png`,
  telephone: `+${SITE.whatsapp}`,
  servesCuisine: ["Hambúrguer artesanal", "Lanches"],
  priceRange: "R$ 40–60",
  foundingDate: String(SITE.since),
  menu: `${SITE.url}/#cardapio`,
  acceptsReservations: false,
  paymentAccepted: "Dinheiro, Pix, Cartão de crédito, Cartão de débito, Vale-refeição, Vale-alimentação",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE.address.street} - ${SITE.address.complement}`,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    postalCode: SITE.address.postalCode,
    addressCountry: "BR",
  },
  geo: { "@type": "GeoCoordinates", latitude: -23.50388, longitude: -46.55415 },
  hasMap: SITE.mapsUrl,
  openingHoursSpecification: Object.entries(HOURS)
    .filter(([, s]) => s)
    .map(([d, s]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_SCHEMA[+d], opens: s!.open, closes: s!.close })),
  areaServed: { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: -23.50388, longitude: -46.55415 }, geoRadius: DELIVERY_FEES.at(-1)!.km * 1000 },
  sameAs: [SITE.instagram.url, SITE.facebook, SITE.whatsmenu],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preload" as="image" href="/img/hero-1080.webp" imageSrcSet="/img/hero-720.webp 720w, /img/hero-1080.webp 1080w" imageSizes="(max-width: 1024px) 78vw, 560px" fetchPriority="high" />
      </head>
      <body>
        <a href="#cardapio" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-ink">
          Pular para o cardápio
        </a>
        <CartProvider>{children}</CartProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
