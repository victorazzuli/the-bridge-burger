"use client";
import { useEffect, useState } from "react";

type Nav = Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };

/**
 * Liga efeitos pesados (vídeo em loop, WebGL) só quando faz sentido:
 * sem "reduzir movimento", sem economia de dados, rede razoável e aparelho com fôlego.
 */
export function useCapable() {
  const [state, setState] = useState({ ready: false, motion: true, video: true, webgl: false, finePointer: false });

  useEffect(() => {
    const n = navigator as Nav;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = !!n.connection?.saveData || /(^|-)2g$/.test(n.connection?.effectiveType ?? "");
    const cores = n.hardwareConcurrency ?? 4;
    const mem = n.deviceMemory ?? 4;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const strong = cores >= 4 && mem >= 4;
    setState({
      ready: true,
      motion: !reduce,
      video: !reduce && !saveData,
      webgl: !reduce && !saveData && strong && (fine || cores >= 6),
      finePointer: fine,
    });
  }, []);

  return state;
}
