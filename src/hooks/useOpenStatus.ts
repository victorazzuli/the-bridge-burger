"use client";
import { useEffect, useState } from "react";
import { openStatus, type OpenStatus } from "@/utils/hours";

/** Status aberto/fechado calculado no fuso de São Paulo. Só no cliente (evita divergência de hidratação). */
export function useOpenStatus() {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setStatus(openStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}
