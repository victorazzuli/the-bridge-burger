"use client";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { cx } from "@/utils/format";

/** Selo "Aberto agora · até 23h" / "Fechado agora · abre hoje às 18h20". Texto + ponto: não depende só de cor. */
export function OpenBadge({ className = "" }: { className?: string }) {
  const s = useOpenStatus();
  return (
    <span className={cx("chip min-h-[32px] bg-bg/40 backdrop-blur-md", className)} aria-live="polite">
      <span className="relative flex h-2 w-2" aria-hidden>
        {s?.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7BD88F] opacity-60" />}
        <span className={cx("relative inline-flex h-2 w-2 rounded-full", s ? (s.open ? "bg-[#7BD88F]" : "bg-muted") : "bg-muted/40")} />
      </span>
      <span className={cx(!s && "opacity-0")}>{s?.label ?? "Carregando horário"}</span>
    </span>
  );
}
