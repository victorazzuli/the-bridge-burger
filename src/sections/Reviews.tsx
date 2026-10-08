"use client";
import { motion } from "motion/react";
import { RATING, REVIEWS } from "@/data/reviews";
import { SITE } from "@/data/site";
import { IconStar } from "@/components/ui/Icons";

const ease = [0.16, 1, 0.3, 1] as const;

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value.toLocaleString("pt-BR")} de 5 estrelas`}>
      <span className="flex text-text/15">{Array.from({ length: 5 }, (_, i) => <IconStar key={i} size={size} />)}</span>
      <span className="absolute inset-0 flex overflow-hidden text-primary" style={{ width: `${(value / 5) * 100}%` }}>
        {Array.from({ length: 5 }, (_, i) => <IconStar key={i} size={size} className="shrink-0" />)}
      </span>
    </span>
  );
}

export function Reviews() {
  return (
    <section aria-labelledby="avaliacoes-title" className="relative overflow-hidden border-t border-text/10 bg-surface py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease }}>
          <h2 id="avaliacoes-title" className="sr-only">
            Avaliações de clientes
          </h2>
          <p className="display text-[clamp(7rem,20vw,15rem)] leading-[0.8] text-primary" aria-hidden>
            {RATING.value.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
          </p>
          <div className="mt-10 flex items-center gap-3">
            <Stars value={RATING.value} size={22} />
          </div>
          <p className="mt-3 text-[17px] text-text">
            Nota {RATING.value.toLocaleString("pt-BR")} em {RATING.count} avaliações no {RATING.source}.
          </p>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-[15px] text-muted underline decoration-text/30 underline-offset-4 transition-colors hover:text-text hover:decoration-primary">
            Ver no Google Maps
          </a>
        </motion.div>

        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-1 lg:overflow-visible lg:px-0">
          {REVIEWS.map((r, i) => (
            <motion.li
              key={r.author}
              className="w-[84vw] max-w-[420px] shrink-0 snap-center lg:w-auto lg:max-w-none"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.08, ease }}
            >
              <figure className="flex h-full flex-col rounded-[24px] border border-text/10 bg-bg p-6 sm:p-8 lg:odd:ml-0 lg:even:ml-16">
                <Stars value={r.stars} size={15} />
                <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-text/90">“{r.text}”</blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-text">{r.author}</span>
                  <span className="text-muted">
                    {r.when} · Google
                  </span>
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
