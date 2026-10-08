/** Fotos reais publicadas pela casa no Instagram @thebridgeburger (jan–mar/2025). */
export type Photo = { src: string; alt: string; w: number; h: number; caption?: string };

export const GALLERY: Photo[] = [
  { src: "/img/galeria/burger-luz-pendente.jpg", alt: "Hambúrguer com gergelim, alface e cebola roxa sob a luz pendente do salão", w: 720, h: 1280 },
  { src: "/img/galeria/molho-escorrendo.jpg", alt: "Hambúrguer com bacon e molho escorrendo pelo pão, na tábua de madeira", w: 899, h: 899, caption: "De 0 a 10, qual sua nota?" },
  { src: "/img/galeria/quatro-em-um.jpg", alt: "Quatro hambúrgueres diferentes lado a lado no balcão com batatas e refrigerante", w: 1080, h: 1080, caption: "Combo quatro em um" },
  { src: "/img/galeria/montagem-na-tabua.jpg", alt: "Mão com luva finalizando um hambúrguer sobre a tábua de madeira", w: 1080, h: 1080 },
  { src: "/img/galeria/dupla-chicken.jpg", alt: "Dois sanduíches de frango no balcão com cesta de batata ao fundo", w: 1080, h: 812, caption: "Linha chicken" },
  { src: "/img/galeria/burger-na-tabua.jpg", alt: "Hambúrguer alto com queijo, alface e cebola roxa sobre tábua escura", w: 1080, h: 1080 },
  { src: "/img/galeria/carne-louca-tubaina.jpg", alt: "Sanduíche de carne louca com batatas em conserva e garrafa de tubaína", w: 901, h: 901, caption: "Carne louca, batata em conserva e tubaína" },
  { src: "/img/galeria/combo-com-fritas.jpg", alt: "Hambúrguer com cheddar e cebola, cesta de batata frita e lata de Coca-Cola", w: 1080, h: 1080 },
  { src: "/img/galeria/line-up.jpg", alt: "Hambúrgueres enfileirados sobre esteira de madeira no balcão", w: 720, h: 1280 },
  { src: "/img/galeria/linha-chicken.jpg", alt: "Sanduíche de frango empanado com gergelim sob luz quente", w: 1080, h: 1920 },
];
