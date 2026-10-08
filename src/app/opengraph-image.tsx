import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "The Bridge Burger, hamburgueria artesanal na Ponte Grande, Guarulhos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const pub = path.join(process.cwd(), "public");
  const [photo, logo] = await Promise.all([
    readFile(path.join(pub, "img/galeria/burger-na-tabua.jpg")),
    readFile(path.join(pub, "brand/logo-2048.png")),
  ]);
  const src = (b: Buffer, t: string) => `data:${t};base64,${b.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0E0B09" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(photo, "image/jpeg")} alt="" width={630} height={630} style={{ position: "absolute", right: 0, top: 0, width: 700, height: 630, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #0E0B09 42%, rgba(14,11,9,0.2) 75%, rgba(14,11,9,0) 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 640, color: "#F6F0E7" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src(logo, "image/png")} alt="" width={220} height={248} />
          <div style={{ marginTop: 28, fontSize: 30, color: "#A79D91", display: "flex" }}>Hamburgueria artesanal · Ponte Grande, Guarulhos</div>
          <div style={{ marginTop: 10, fontSize: 30, color: "#F3A53A", display: "flex" }}>Peça pelo site, finalize no WhatsApp</div>
        </div>
      </div>
    ),
    size,
  );
}
