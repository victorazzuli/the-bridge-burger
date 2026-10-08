"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SITE, waLink } from "@/data/site";
import { DAY_NAMES, DELIVERY_FEES, HOURS, PAYMENTS, WEEK_ORDER } from "@/data/hours";
import { storeNow } from "@/utils/hours";
import { brl, cx, hm } from "@/utils/format";
import { IconPin, IconWhatsApp } from "@/components/ui/Icons";
import { OpenBadge } from "@/components/ui/OpenBadge";

const ease = [0.16, 1, 0.3, 1] as const;

export function Location() {
  const [today, setToday] = useState<number | null>(null);
  const [mapOn, setMapOn] = useState(false);
  useEffect(() => setToday(storeNow().day), []);

  return (
    <section id="onde-estamos" aria-labelledby="onde-title" className="relative border-t border-text/10 py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <motion.h2 id="onde-title" className="display text-[clamp(3.2rem,8vw,7rem)]" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}>
              Onde estamos
            </motion.h2>
            <address className="mt-6 not-italic">
              <p className="text-[22px] leading-snug text-text">
                {SITE.address.street} · {SITE.address.complement}
                <br />
                {SITE.address.district}, {SITE.address.city} – {SITE.address.state}
              </p>
              <p className="mt-1 text-sm text-muted">CEP {SITE.address.postalCode}</p>
            </address>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row">
              <a href={SITE.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <IconPin size={18} />
                Como chegar
              </a>
              <a href={waLink("Olá, The Bridge!")} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <IconWhatsApp size={18} />
                {SITE.phoneDisplay}
              </a>
            </div>

            {/* Horários */}
            <div className="mt-14">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-3xl font-bold">Horário</h3>
                <OpenBadge />
              </div>
              <ul className="mt-5 divide-y divide-text/[0.08] rounded-2xl border border-text/10">
                {WEEK_ORDER.map((d) => {
                  const s = HOURS[d];
                  const isToday = today === d;
                  return (
                    <li key={d} className={cx("flex items-center justify-between px-5 py-3.5 text-[15px]", isToday && "bg-primary/[0.08]")}>
                      <span className={cx(isToday ? "font-semibold text-text" : "text-text/80")}>
                        {DAY_NAMES[d]}
                        {isToday && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-ink">hoje</span>}
                      </span>
                      <span className={cx("tabular-nums", s ? "text-text" : "text-muted")}>{s ? `${hm(s.open)} às ${hm(s.close)}` : "Fechado"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Mapa: só carrega quando pedido (economiza dados e não pesa a página) */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-text/10 bg-surface">
              {mapOn ? (
                <iframe
                  title="Mapa: The Bridge Burger na Ponte Grande, Guarulhos"
                  src={SITE.mapsEmbed}
                  className="absolute inset-0 h-full w-full [filter:invert(.92)_hue-rotate(180deg)_saturate(.6)_brightness(.95)]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <button type="button" onClick={() => setMapOn(true)} className="group absolute inset-0 flex flex-col items-center justify-end gap-4 pb-8 bg-[radial-gradient(circle_at_50%_45%,rgb(var(--primary)/0.14),transparent_55%)]">
                  <MapSketch />
                  <span className="btn-ghost relative min-h-[44px] bg-bg/70 px-5 text-sm backdrop-blur-md group-hover:border-primary">Carregar mapa</span>
                </button>
              )}
            </div>

            {/* Travessia: a escala de entrega como o tabuleiro de uma ponte */}
            <div className="rounded-[28px] border border-text/10 p-6 sm:p-8">
              <h3 className="font-display text-3xl font-bold">Entrega por distância</h3>
              <p className="mt-1 text-[15px] text-muted">Da loja até a sua porta, em até {DELIVERY_FEES.at(-1)!.km} km. A casa confirma a taxa no WhatsApp.</p>
              <div className="relative mt-8 pb-2" aria-hidden>
                <div className="absolute left-0 right-0 top-[11px] h-[3px] rounded-full bg-text/15" />
                <motion.div className="absolute left-0 top-[11px] h-[3px] origin-left rounded-full bg-primary" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease }} style={{ right: 0 }} />
                <div className="relative flex justify-between">
                  {[{ km: 0, fee: 0 }, ...DELIVERY_FEES].map((b, i) => (
                    <motion.div key={b.km} className="flex flex-col items-center" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 + i * 0.18 }}>
                      <span className={cx("h-[25px] w-[3px] rounded-full", b.km === 0 ? "bg-primary" : "bg-text/50")} />
                      <span className="mt-2 text-[11px] text-muted sm:text-xs">{b.km === 0 ? "Loja" : `${b.km} km`}</span>
                      <span className="font-display text-lg font-bold tabular-nums sm:text-xl">{b.km === 0 ? "" : brl(b.fee).replace(",00", "")}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <ul className="sr-only">
                {DELIVERY_FEES.map((b) => (
                  <li key={b.km}>
                    Até {b.km} km: {brl(b.fee)}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted">
                Pagamento: {PAYMENTS.slice(0, -1).join(", ").toLowerCase().replace("pix", "Pix")} ou {PAYMENTS.at(-1)!.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Esboço de ruas (decorativo) enquanto o mapa real não é carregado. */
function MapSketch() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full text-text/10" aria-hidden preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
        <path d="M-20 210 C 80 190, 160 230, 260 180 S 380 120, 430 140" />
        <path d="M60 -20 L 120 320" />
        <path d="M250 -20 C 230 80, 270 160, 240 320" />
        <path d="M-20 90 L 420 60" strokeWidth="6" />
      </g>
      <circle cx="200" cy="140" r="12" fill="rgb(var(--primary))" />
      <circle cx="200" cy="140" r="26" fill="none" stroke="rgb(var(--primary))" strokeOpacity=".4" strokeWidth="2" />
    </svg>
  );
}
