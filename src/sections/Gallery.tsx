"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { GALLERY } from "@/data/gallery";
import { SITE } from "@/data/site";
import { useDialog } from "@/hooks/useDialog";
import { useCapable } from "@/hooks/useCapable";
import { IconBack, IconChevron, IconClose, IconInstagram } from "@/components/ui/Icons";

const ease = [0.16, 1, 0.3, 1] as const;

export function Gallery() {
  const cap = useCapable();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);
  const inView = useInView(videoWrap, { margin: "-20% 0px -20% 0px" });
  const [lightbox, setLightbox] = useState<number | null>(null);

  // O vídeo só toca enquanto está na tela
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !cap.video) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, cap.video]);

  // Faixa de fotos desliza na horizontal conforme a rolagem (desktop)
  const stripRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stripRef, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-18%"]);

  return (
    <section id="galeria" aria-labelledby="galeria-title" className="relative overflow-hidden py-24 sm:py-36">
      <div className="container-x grid items-center gap-12 md:grid-cols-[minmax(0,380px)_1fr] md:gap-16 lg:gap-24">
        <motion.div
          ref={videoWrap}
          className="relative mx-auto aspect-[9/16] w-[72vw] max-w-[380px] overflow-hidden rounded-[32px] bg-surface md:w-full"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/video/na-chapa-poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          {cap.ready && cap.video && (
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" src="/video/na-chapa.mp4" muted loop playsInline preload="none" poster="/video/na-chapa-poster.webp" aria-label="Vídeo: um hambúrguer sendo montado na tábua de madeira, camada por camada" />
          )}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/80 to-transparent" />
        </motion.div>

        <div>
          <motion.h2
            id="galeria-title"
            className="display text-[clamp(3rem,7.4vw,7rem)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease }}
          >
            É somente um hambúrguer, <span className="text-primary">mas muito longe de ser igual.</span>
          </motion.h2>
          <p className="mt-4 text-sm text-muted">— {SITE.instagram.handle}</p>
          <motion.div
            className="mt-10 grid max-w-[560px] gap-px overflow-hidden rounded-2xl border border-text/10 bg-text/10 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
          >
            {[
              ["Ketchup", "feito na casa"],
              ["Maionese", "temperada da casa"],
              ["Molho especial", "receita da casa"],
            ].map(([a, b]) => (
              <div key={a} className="bg-bg p-5">
                <p className="font-display text-2xl font-bold">{a}</p>
                <p className="text-sm text-muted">{b}</p>
              </div>
            ))}
          </motion.div>
          <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-muted">Hambúrgueres e molhos artesanais, como diz a casa. Todas as fotos abaixo são da The Bridge, publicadas no nosso Instagram.</p>
        </div>
      </div>

      {/* Faixa de fotos: arrasta no celular, desliza com a rolagem no desktop */}
      <div ref={stripRef} className="mt-20 sm:mt-28">
        <motion.ul
          style={cap.motion && cap.finePointer ? { x } : undefined}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:gap-4 sm:px-6 lg:snap-none lg:overflow-visible lg:px-10"
          aria-label="Fotos da casa"
        >
          {GALLERY.map((p, i) => (
            <li key={p.src} className="shrink-0 snap-center">
              <button
                type="button"
                onClick={() => setLightbox(i)}
                className="group relative block h-[56vh] max-h-[560px] min-h-[340px] overflow-hidden rounded-[24px] bg-surface"
                style={{ aspectRatio: `${Math.min(p.w / p.h, 1.35)}` }}
                aria-label={`Ampliar foto: ${p.alt}`}
              >
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 768px) 80vw, 480px" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]" />
                {p.caption && (
                  <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-bg/75 px-4 py-2 text-left text-sm opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {p.caption}
                  </span>
                )}
              </button>
            </li>
          ))}
          <li className="flex shrink-0 snap-center items-center pl-2 pr-6">
            <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="group flex h-[56vh] max-h-[560px] min-h-[340px] w-[240px] flex-col justify-end rounded-[24px] border border-text/15 p-6 transition-colors hover:border-primary">
              <IconInstagram size={28} className="text-primary" />
              <span className="display mt-4 text-[2.2rem]">Mais no Instagram</span>
              <span className="mt-1 text-sm text-muted">{SITE.instagram.handle}</span>
            </a>
          </li>
        </motion.ul>
      </div>

      <Lightbox index={lightbox} onChange={setLightbox} />
    </section>
  );
}

function Lightbox({ index, onChange }: { index: number | null; onChange: (i: number | null) => void }) {
  const open = index != null;
  const close = useCallback(() => onChange(null), [onChange]);
  const ref = useDialog<HTMLDivElement>(open, close);
  const go = useCallback((d: number) => index != null && onChange((index + d + GALLERY.length) % GALLERY.length), [index, onChange]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, go]);

  const p = index != null ? GALLERY[index] : null;
  return (
    <AnimatePresence>
      {p && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={p.src}
              className="relative flex h-full max-h-[88vh] w-full max-w-[1100px] flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, i) => (i.offset.x < -80 ? go(1) : i.offset.x > 80 ? go(-1) : null)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-full w-full">
                <Image src={p.src} alt={p.alt} fill sizes="100vw" className="object-contain" />
              </div>
              {p.caption && <figcaption className="mt-3 text-sm text-muted">{p.caption}</figcaption>}
            </motion.figure>
          </AnimatePresence>
          <button type="button" onClick={close} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-text/10 text-text hover:bg-text/20" aria-label="Fechar" data-autofocus>
            <IconClose />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-text/10 hover:bg-text/20 sm:grid" aria-label="Foto anterior">
            <IconBack />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-text/10 hover:bg-text/20 sm:grid" aria-label="Próxima foto">
            <IconChevron />
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tabular-nums text-muted">
            {(index ?? 0) + 1} / {GALLERY.length}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
