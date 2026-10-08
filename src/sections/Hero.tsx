"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { SITE, waLink } from "@/data/site";
import { RATING } from "@/data/reviews";
import { DELIVERY_FEES } from "@/data/hours";
import { RING, SYMBOL_VIEWBOX } from "@/components/hero/symbolPaths";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { IconStar, IconWhatsApp } from "@/components/ui/Icons";
import { useCapable } from "@/hooks/useCapable";

const EmberCanvas = dynamic(() => import("@/components/hero/EmberCanvas"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;
const LINES = ["Só não gosta", "aquele que", "nunca provou."];

export function Hero() {
  const cap = useCapable();
  const [embers, setEmbers] = useState(false);

  // Inclinação 3D do "prato" seguindo o mouse (só ponteiro fino)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const rotY = useTransform(sx, [-1, 1], [-7, 7]);
  const rotX = useTransform(sy, [-1, 1], [6, -6]);
  const innerX = useTransform(sx, [-1, 1], [16, -16]);
  const innerY = useTransform(sy, [-1, 1], [12, -12]);
  const glowX = useTransform(sx, [-1, 1], ["58%", "78%"]);
  const glow = useTransform(
    glowX,
    (x) => `radial-gradient(48% 55% at ${x} 22%, rgb(var(--primary) / 0.22), transparent 70%), radial-gradient(40% 40% at 20% 90%, rgb(var(--secondary) / 0.14), transparent 70%)`,
  );

  useEffect(() => {
    if (!cap.ready || !cap.finePointer || !cap.motion) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [cap, mx, my]);

  // Brasas (WebGL) só depois do primeiro paint e em aparelhos com fôlego. A foto é o LCP.
  useEffect(() => {
    if (!cap.ready || !cap.webgl) return;
    const w = window as Window;
    const id = "requestIdleCallback" in w ? w.requestIdleCallback(() => setEmbers(true), { timeout: 1500 }) : setTimeout(() => setEmbers(true), 800);
    return () => ("cancelIdleCallback" in w ? w.cancelIdleCallback(id as number) : clearTimeout(id as ReturnType<typeof setTimeout>));
  }, [cap]);

  const anim = cap.ready ? cap.motion : true;
  const tilt = cap.finePointer && cap.motion;
  const lastKm = DELIVERY_FEES.at(-1)!.km;

  return (
    <section id="topo" aria-labelledby="hero-title" className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden pb-[calc(var(--dock-h)+28px)] pt-[calc(var(--header-h)+20px)] lg:pb-12">
      {/* Luz pendente do salão: o calor vem de cima, como nas fotos da casa */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: glow }} />
      {embers && <EmberCanvas className="pointer-events-none absolute inset-0 -z-10 h-full w-full animate-[fadeIn_1.6s_ease-out_both]" />}

      <div className="container-x grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        {/* Texto */}
        <div className="order-2 lg:order-1">
          <motion.div initial={anim ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease }}>
            <OpenBadge />
          </motion.div>

          <h1 id="hero-title" className="display mt-5 text-[clamp(3.3rem,7.6vw,7.6rem)] text-text">
            <span className="sr-only">The Bridge Burger, hamburgueria artesanal em Guarulhos. </span>
            {LINES.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.05em]">
                <motion.span
                  className={i === 2 ? "block text-primary" : "block"}
                  initial={anim ? { y: "105%" } : false}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.05, delay: 0.35 + i * 0.09, ease }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={anim ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75, ease }}>
            <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-muted sm:text-lg">
              Hambúrgueres e molhos artesanais na Ponte Grande, em Guarulhos, desde {SITE.since}. Monte seu pedido aqui e finalize no WhatsApp.
            </p>
            <div className="mt-7 flex flex-col gap-3 xs:flex-row">
              <a href="#cardapio" className="btn-primary group">
                Ver cardápio
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href={waLink("Olá, The Bridge! Quero fazer um pedido.")} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <IconWhatsApp size={18} />
                Fazer pedido
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li>Quarta a domingo, a partir das 18h</li>
              <li>Entrega em até {lastKm} km</li>
              <li className="inline-flex items-center gap-1.5">
                <IconStar size={14} className="text-primary" />
                {RATING.value.toLocaleString("pt-BR")} no {RATING.source}
              </li>
            </ul>
          </motion.div>
        </div>

        {/* O prato: o anel do logo vira moldura do burger */}
        <div className="order-1 mx-auto w-full max-w-[min(78vw,46svh)] [perspective:1400px] sm:max-w-[min(70vw,440px)] lg:order-2 lg:max-w-[min(560px,72svh)]">
          <motion.div style={tilt ? { rotateX: rotX, rotateY: rotY } : undefined} className="relative aspect-square [transform-style:preserve-3d]">
            <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-primary/30 blur-[80px]" />
            <motion.div
              className="absolute inset-[5.5%] overflow-hidden rounded-full bg-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
              initial={anim ? { scale: 0.86, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.3, delay: 0.15, ease }}
            >
              <motion.div className="absolute -inset-[5%]" style={tilt ? { x: innerX, y: innerY } : undefined}>
                {/* Zoom lento e contínuo: a foto "respira" sem virar vídeo pesado */}
                <div className={anim ? "absolute inset-0 animate-[breathe_14s_ease-in-out_infinite_alternate]" : "absolute inset-0"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/hero-1080.webp"
                    srcSet="/img/hero-720.webp 720w, /img/hero-1080.webp 1080w"
                    sizes="(max-width: 1024px) 78vw, 560px"
                    alt="Hambúrguer com gergelim, queijo derretido, alface e cebola roxa na tábua de madeira, sob a luz baixa do salão"
                    className="absolute inset-0 h-full w-full object-cover object-[54%_46%]"
                    fetchPriority="high"
                    decoding="async"
                    width={1080}
                    height={1080}
                  />
                </div>
              </motion.div>
              <div aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0_0_70px_24px_rgba(14,11,9,0.75)]" />
            </motion.div>

            {/* Anel pincelado do logo, desenhado na entrada */}
            <svg viewBox={SYMBOL_VIEWBOX} aria-hidden className="absolute inset-0 h-full w-full text-text" style={{ transform: "translateZ(40px)" }}>
              {RING.map((r, i) => (
                <motion.path
                  key={i}
                  d={r.d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={r.w * 0.62}
                  strokeLinecap="round"
                  strokeOpacity={r.o}
                  initial={anim ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5 - i * 0.15, delay: 0.1 + i * 0.12, ease: [0.65, 0, 0.35, 1] }}
                />
              ))}
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
