"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SITE } from "@/data/site";

const ease = [0.16, 1, 0.3, 1] as const;

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const yB = useTransform(scrollYProgress, [0, 1], ["-4%", "10%"]);

  return (
    <section id="a-casa" aria-labelledby="casa-title" className="relative border-t border-text/10 py-24 sm:py-36">
      <div ref={ref} className="container-x grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
        <div>
          <motion.h2
            id="casa-title"
            className="display text-[clamp(3.2rem,8vw,7.6rem)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease }}
          >
            Desde {SITE.since} na Ponte Grande.
          </motion.h2>
          <motion.div
            className="mt-8 max-w-[52ch] space-y-5 text-[17px] leading-relaxed text-text/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
          >
            <p>
              A The Bridge Burger &amp; Co. é uma hamburgueria de bairro em Guarulhos: hambúrgueres e molhos artesanais, servidos na tábua de madeira, sob a luz baixa do salão
              na Rua Cabo João Teruel Fregoni.
            </p>
            <p>
              Dá para comer no salão, retirar no balcão ou pedir em casa. A casa entrega em até 5 km, com taxa pela distância, de quarta a domingo, a partir das 18h.
            </p>
            <p className="font-display text-[1.9rem] font-bold leading-tight text-primary">“{SITE.slogan}”</p>
          </motion.div>
        </div>

        {/* Duas fotos em camadas com paralaxe leve */}
        <div className="relative h-[520px] sm:h-[640px]">
          <motion.div style={{ y: yA }} className="absolute left-0 top-0 h-[78%] w-[66%] overflow-hidden rounded-[28px] bg-surface">
            <Image src="/img/galeria/velhos-tempos.jpg" alt="Salão da The Bridge com luminárias pendentes, escada de ferro e um hambúrguer com tubaína no balcão" fill sizes="(max-width: 1024px) 66vw, 420px" className="object-cover object-[50%_30%]" />
          </motion.div>
          <motion.div style={{ y: yB }} className="absolute bottom-0 right-0 h-[62%] w-[56%] overflow-hidden rounded-[28px] border-[6px] border-bg bg-surface">
            <Image src="/img/galeria/dupla-chicken.jpg" alt="Dois sanduíches de frango no balcão da casa, com a cozinha ao fundo" fill sizes="(max-width: 1024px) 56vw, 360px" className="object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
