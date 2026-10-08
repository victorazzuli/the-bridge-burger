const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (v: number) => fmt.format(v).replace(/ /g, " ");

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** "18:20" -> "18h20", "18:00" -> "18h" */
export const hm = (t: string) => {
  const [h, m] = t.split(":");
  return m === "00" ? `${+h}h` : `${+h}h${m}`;
};

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
