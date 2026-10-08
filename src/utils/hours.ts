import { DAY_NAMES, HOURS } from "@/data/hours";
import { hm } from "./format";

/** Dia da semana e minutos do dia no fuso da loja, independente do fuso do visitante. */
export function storeNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: +get("hour") * 60 + +get("minute") };
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export type OpenStatus =
  | { open: true; label: string; closesAt: string }
  | { open: false; label: string; next: { day: number; time: string; today: boolean; tomorrow: boolean } | null };

export function openStatus(date = new Date()): OpenStatus {
  const { day, minutes } = storeNow(date);
  const today = HOURS[day];
  if (today && minutes >= toMin(today.open) && minutes < toMin(today.close)) {
    return { open: true, label: `Aberto agora · até ${hm(today.close)}`, closesAt: today.close };
  }
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const s = HOURS[d];
    if (!s) continue;
    if (i === 0 && minutes >= toMin(s.open)) continue;
    const when = i === 0 ? "hoje" : i === 1 ? "amanhã" : DAY_NAMES[d].toLowerCase();
    return {
      open: false,
      label: `Fechado agora · abre ${when} às ${hm(s.open)}`,
      next: { day: d, time: s.open, today: i === 0, tomorrow: i === 1 },
    };
  }
  return { open: false, label: "Fechado agora", next: null };
}
