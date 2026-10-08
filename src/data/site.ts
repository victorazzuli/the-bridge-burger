/**
 * Dados oficiais do The Bridge Burger.
 * Fontes (out/2026): cardápio WhatsMenu (whatsmenu.com.br/thebridgeburger), bio do Instagram
 * @thebridgeburger, Facebook e RestaurantGuru. WhatsApp/URL podem ser sobrescritos pelo .env.
 */
const env = (v?: string) => (v && v.trim() ? v.trim() : null);

const address = {
  street: "R. Cabo João Teruel Fregoni, 345",
  complement: "Loja 12",
  district: "Ponte Grande",
  city: "Guarulhos",
  state: "SP",
  postalCode: "07032-000",
  country: "BR",
};

/** Coordenadas da loja no cadastro do WhatsMenu (base do cálculo da taxa por km). */
export const STORE_GEO = { lat: -23.50388, lng: -46.55415 };

const query = `The Bridge Burger, ${address.street} - ${address.district}, ${address.city} - ${address.state}`;

export const SITE = {
  name: "The Bridge Burger",
  legalName: "The Bridge Burger & Co.",
  url: (env(process.env.NEXT_PUBLIC_SITE_URL) || "https://the-bridge-burger.vercel.app").replace(/\/$/, ""),
  /** Frase da própria casa (WhatsMenu). */
  slogan: "Só não gosta aquele que nunca provou!",
  /** Bio do Instagram. */
  since: 2020,
  bio: "Desde 2020 encantando a Ponte Grande. Hambúrgueres e molhos artesanais.",
  description:
    "The Bridge Burger: hamburgueria artesanal na Ponte Grande, em Guarulhos. Hambúrgueres e molhos feitos na casa desde 2020. Peça pelo site e finalize no WhatsApp.",
  address,
  fullAddress: `${address.street} - ${address.complement}, ${address.district}, ${address.city} - ${address.state}, ${address.postalCode}`,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${STORE_GEO.lat},${STORE_GEO.lng}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`,
  /** WhatsApp oficial: WhatsMenu, RestaurantGuru, Facebook e a fachada da loja. Só dígitos, com DDI. */
  whatsapp: (env(process.env.NEXT_PUBLIC_WHATSAPP) || "5511944864004").replace(/\D/g, ""),
  phoneDisplay: "(11) 94486-4004",
  instagram: { handle: "@thebridgeburger", url: "https://www.instagram.com/thebridgeburger/" },
  facebook: "https://www.facebook.com/p/The-Bridge-Burger-100038994225865/",
  whatsmenu: "https://www.whatsmenu.com.br/thebridgeburger",
  /** Faixa de preço por pessoa (RestaurantGuru): R$ 40–60 */
  priceRange: "$$",
  preview: process.env.NEXT_PUBLIC_PREVIEW === "1",
};

export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const NAV = [
  { href: "#cardapio", label: "Cardápio" },
  { href: "#a-casa", label: "Sobre" },
  { href: "#galeria", label: "Galeria" },
  { href: "#onde-estamos", label: "Localização" },
];
