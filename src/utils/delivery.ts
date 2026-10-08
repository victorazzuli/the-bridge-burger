import { DELIVERY_FEES } from "@/data/hours";
import { STORE_GEO } from "@/data/site";

/** Distância em linha reta (km). A rota real é maior: o valor é sempre uma estimativa. */
export function haversineKm(lat: number, lng: number) {
  const R = 6371;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(lat - STORE_GEO.lat);
  const dLng = r(lng - STORE_GEO.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(STORE_GEO.lat)) * Math.cos(r(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export type FeeEstimate =
  | { kind: "band"; km: number; fee: number; band: number }
  | { kind: "out"; km: number };

export function feeFor(km: number): FeeEstimate {
  const band = DELIVERY_FEES.find((b) => km <= b.km);
  return band ? { kind: "band", km, fee: band.fee, band: band.km } : { kind: "out", km };
}
