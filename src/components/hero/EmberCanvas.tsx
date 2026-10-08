"use client";
import { useEffect, useRef } from "react";

/**
 * Brasas subindo da chapa — WebGL puro (sem three.js) para pesar quase nada.
 * Profundidade: cada brasa tem um "z" que controla tamanho, velocidade, desfoque e o quanto
 * reage ao mouse (paralaxe). Para quando sai da tela ou a aba fica oculta.
 */
const VERT = `
attribute vec4 aSeed; // x0, speed, size, phase
attribute float aDepth;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAspect;
uniform float uDpr;
varying float vAlpha;
varying float vHeat;
void main() {
  float t = fract(uTime * aSeed.y + aSeed.w);
  float y = -1.15 + t * 2.5;
  float sway = sin(t * 7.0 + aSeed.w * 30.0) * 0.035 + sin(t * 2.3 + aSeed.w * 11.0) * 0.06;
  float x = aSeed.x + sway * (1.0 + aDepth) - uMouse.x * 0.06 * aDepth;
  y += -uMouse.y * 0.04 * aDepth;
  gl_Position = vec4(x, y, 0.0, 1.0);
  float flicker = 0.65 + 0.35 * sin(uTime * (6.0 + aSeed.w * 9.0) + aSeed.w * 40.0);
  vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.55, 1.0, t)) * flicker;
  vHeat = 1.0 - t;
  gl_PointSize = aSeed.z * (0.6 + aDepth) * uDpr;
}`;

const FRAG = `
precision mediump float;
varying float vAlpha;
varying float vHeat;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  core *= core;
  vec3 hot = vec3(1.0, 0.82, 0.48);
  vec3 cool = vec3(0.95, 0.38, 0.12);
  vec3 col = mix(cool, hot, vHeat);
  gl_FragColor = vec4(col * core * vAlpha, core * vAlpha);
}`;

export default function EmberCanvas({ count = 120, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // Sementes determinísticas: o desenho é o mesmo a cada visita
    let s = 1337;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const seeds = new Float32Array(count * 4);
    const depth = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const z = rnd();
      depth[i] = z;
      seeds.set([rnd() * 2.2 - 1.1, 0.025 + rnd() * 0.05 + z * 0.03, 2 + rnd() * 3.5 + z * 4, rnd()], i * 4);
    }
    const buf = (data: Float32Array, name: string, size: number) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    buf(seeds, "aSeed", 4);
    buf(depth, "aDepth", 1);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uAspect = gl.getUniformLocation(prog, "uAspect");
    const uDpr = gl.getUniformLocation(prog, "uDpr");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uAspect, width / Math.max(1, height));
      gl.uniform1f(uDpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Mouse suavizado (lerp) para a paralaxe
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      cur.x += (target.x - cur.x) * 0.04;
      cur.y += (target.y - cur.y) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, cur.x, cur.y);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
