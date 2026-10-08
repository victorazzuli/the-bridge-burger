/**
 * Cardápio do The Bridge Burger — extraído do WhatsMenu oficial da casa em 08/10/2026
 * (api2.whatsmenu.com.br/api/v2/business/thebridgeburger/profile). Preços em reais.
 *
 * Para atualizar: edite só este arquivo. Cada produto tem `groups` com os adicionais
 * exatamente como no WhatsMenu (mín./máx./obrigatório).
 *
 * Pendências (sem dado público — não inventar):
 * - Os 11 hambúrgueres da casa só aparecem como escolha dentro dos combos, sem preço avulso.
 * - "Pizza de brownie de brigadeiro" está sem preço no WhatsMenu (price: null = valor a confirmar).
 * - Categorias cadastradas porém vazias: Bridge Churros, Bridge Mini Salgados, Pede um Açaí, Bridge Shake.
 */

export type Option = { id: string; name: string; price: number };

export type Group = {
  id: string;
  name: string;
  /** Rótulo curto usado no carrinho e na mensagem do WhatsApp */
  short: string;
  /** single = escolha uma (rádio). count = quantidades por opção, somando até `max`. */
  kind: "single" | "count";
  required: boolean;
  min: number;
  max: number;
  options: Option[];
};

export type CategoryId = "promocoes" | "combos" | "artesanais" | "acompanhamentos" | "sobremesas" | "bebidas";

export type Product = {
  id: string;
  name: string;
  description?: string;
  /** Lista curta para leitura rápida (só o que está na descrição oficial). */
  ingredients?: string[];
  /** Preço base. null = sem preço cadastrado (vai como "valor a confirmar"). */
  price: number | null;
  image?: { src: string; alt: string; w: number; h: number; position?: string };
  category: CategoryId;
  groups?: Group[];
  tag?: string;
  /** Destaque visual no topo do cardápio. */
  featured?: boolean;
};

export type Category = { id: CategoryId; name: string; blurb?: string };

export const CATEGORIES: Category[] = [
  { id: "promocoes", name: "Promoções", blurb: "Burger + refri de 200 ml, preço fechado." },
  { id: "combos", name: "Combos", blurb: "Escolha seus lanches entre os 11 da casa." },
  { id: "artesanais", name: "Hambúrgueres Artesanais" },
  { id: "acompanhamentos", name: "Acompanhamentos" },
  { id: "sobremesas", name: "Sobremesas" },
  { id: "bebidas", name: "Bebidas" },
];

/** Os lanches que o cliente escolhe dentro dos combos (WhatsMenu, grupo "Escolha o seu lanche"). */
export const HOUSE_BURGERS = [
  "Bridge Burger",
  "Bridge Bacon",
  "Bridge Salada",
  "The Bridge",
  "Bridge BBK",
  "Bridge Clássico",
  "Bridge Quarteirão",
  "Bridge 1983",
  "Bridge Toscana",
  "Bridge 1983 Toscana",
  "Bridge Jalapeño",
];

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const chooseBurger = (max: number): Group => ({
  id: "lanche",
  short: max === 1 ? "Lanche" : "Lanches",
  name: max === 1 ? "Escolha o seu lanche" : `Escolha os seus lanches (até ${max})`,
  kind: "count",
  required: true,
  min: 1,
  max,
  options: HOUSE_BURGERS.map((n) => ({ id: slug(n), name: n, price: 0 })),
});

const swapFries: Group = {
  id: "troca-batata",
  short: "Batata",
  name: "Troque a batata do seu combo por Nuggets ou Onion",
  kind: "single",
  required: true,
  min: 1,
  max: 1,
  options: [
    { id: "nao-trocar", name: "Manter a batata TBB", price: 0 },
    { id: "nuggets", name: "Nuggets", price: 8.99 },
    { id: "onion-rings", name: "Onion Rings", price: 8.99 },
  ],
};

const turbo = (withMeat: boolean): Group => ({
  id: "turbine",
  short: "Turbine",
  name: "Turbine seu burger",
  kind: "count",
  required: false,
  min: 0,
  max: 3,
  options: [
    { id: "ovo", name: "Ovo", price: 3 },
    { id: "queijo-extra", name: "Queijo extra", price: 3 },
    { id: "bacon", name: "Bacon", price: 4.5 },
    ...(withMeat ? [{ id: "outra-carne", name: "Outra carne", price: 13 }] : []),
  ],
});

const sides: Group = {
  id: "acompanhamentos",
  name: "Acompanhamentos",
  short: "Acompanhamentos",
  kind: "count",
  required: false,
  min: 0,
  max: 10,
  options: [
    { id: "aneis-de-cebola", name: "Anéis de cebola", price: 16.99 },
    { id: "nuggets-de-frango", name: "Nuggets de frango", price: 16.99 },
  ],
};

export const PRODUCTS: Product[] = [
  // ——— Promoções
  {
    id: "promo-burger",
    name: "Promo Burger",
    description: "1 Bridge Burger com hambúrguer especial de 120 g, com ketchup feito na casa + 1 refrigerante de 200 ml.",
    ingredients: ["Hambúrguer especial 120 g", "Ketchup feito na casa", "Refrigerante 200 ml"],
    price: 26,
    image: { src: "/img/produtos/promo-burger.jpg", alt: "Promo Burger: Bridge Burger com queijo derretido e ketchup da casa sobre tábua de madeira, ao lado de uma Coca-Cola de 200 ml", w: 450, h: 300 },
    category: "promocoes",
    featured: true,
  },
  {
    id: "promo-salada",
    name: "Promo Salada",
    description: "1 Bridge Salada feito com hambúrguer especial de 120 g, 2 fatias de queijo prato, alface americana e tomate fresco + 1 refrigerante de 200 ml.",
    ingredients: ["Hambúrguer especial 120 g", "2 fatias de queijo prato", "Alface americana", "Tomate fresco", "Refrigerante 200 ml"],
    price: 29.9,
    image: { src: "/img/produtos/promo-salada.jpg", alt: "Promo Salada: Bridge Salada com alface, tomate e queijo prato na tábua, com refrigerante de 200 ml", w: 450, h: 300 },
    category: "promocoes",
    featured: true,
  },

  // ——— Combos
  {
    id: "combo-1-1-1",
    name: "Combo 1+1+1",
    description: "Escolha 1 lanche do cardápio + batata TBB + 1 refrigerante de 350 ml.",
    ingredients: ["1 lanche à sua escolha", "Batata TBB", "Refrigerante 350 ml"],
    price: 45.99,
    image: { src: "/img/produtos/combo-1-1-1.jpg", alt: "Hambúrguer com cheddar e cebola na tábua, cesta de batatas fritas e lata de Coca-Cola", w: 1080, h: 1080 },
    category: "combos",
    groups: [chooseBurger(1), swapFries, turbo(true)],
    featured: true,
  },
  {
    id: "combo-3-3",
    name: "Combo 3+3",
    description: "Escolha 3 lanches do nosso cardápio + 3 batatas TBB.",
    ingredients: ["3 lanches à sua escolha", "3 batatas TBB"],
    price: 122.9,
    image: { src: "/img/produtos/combo-3-3.jpg", alt: "Quatro hambúrgueres da casa enfileirados no balcão, com batatas e refrigerante ao fundo", w: 1080, h: 1080 },
    category: "combos",
    groups: [chooseBurger(3), swapFries, turbo(false), sides],
  },
  {
    id: "combo-4-2",
    name: "Combo 4+2",
    description: "Escolha 4 lanches do nosso cardápio + 2 batatas TBB.",
    ingredients: ["4 lanches à sua escolha", "2 batatas TBB"],
    price: 142.9,
    image: { src: "/img/produtos/combo-4-2.jpg", alt: "Hambúrgueres lado a lado sobre esteira no balcão da casa", w: 720, h: 1280, position: "50% 62%" },
    category: "combos",
    groups: [chooseBurger(4), swapFries, turbo(false), sides],
  },

  // ——— Hambúrgueres artesanais
  {
    id: "bridge-chicken-salada",
    name: "Bridge Chicken Salada",
    description:
      "Pão artesanal macio, hambúrguer de frango empanado crocante, cheddar inglês derretido, alface americana fresquinha, tomate e o nosso exclusivo molho especial da casa.",
    ingredients: ["Pão artesanal", "Frango empanado crocante", "Cheddar inglês", "Alface americana", "Tomate", "Molho especial da casa"],
    price: 0,
    image: { src: "/img/produtos/bridge-chicken-salada.jpg", alt: "Bridge Chicken Salada: frango empanado com cheddar, alface, tomate e molho da casa no pão brioche", w: 942, h: 942 },
    category: "artesanais",
    groups: [
      {
        id: "carnes",
        short: "Carnes",
        name: "Quantas carnes?",
        kind: "single",
        required: true,
        min: 1,
        max: 1,
        options: [
          { id: "1-carne", name: "1 carne", price: 25.98 },
          { id: "2-carnes", name: "2 carnes", price: 38.98 },
        ],
      },
    ],
    featured: true,
  },

  // ——— Acompanhamentos
  {
    id: "batata-tbb",
    name: "Batata Frita TBB",
    description: "Porção de batatas fritas fininhas e crocantes (160 g). Acompanha maionese temperada da casa (35 g). Serve 1 pessoa.",
    ingredients: ["Batata fininha 160 g", "Maionese temperada da casa 35 g"],
    price: 15.9,
    image: { src: "/img/produtos/batata-tbb.jpg", alt: "Porção de batatas fritas fininhas e douradas", w: 600, h: 450 },
    category: "acompanhamentos",
  },
  { id: "aneis-de-cebola", name: "Anéis de Cebola", price: 18.9, category: "acompanhamentos" },
  { id: "trio-de-molhos", name: "Trio de molhos", description: "Ketchup, maionese da casa e mostarda.", price: 9, category: "acompanhamentos" },

  // ——— Sobremesas
  {
    id: "pizza-de-brownie",
    name: "Pizza de brownie de brigadeiro",
    description: "Brownie em forma de fatia de pizza, com recheio cremoso de brigadeiro belga.",
    price: null,
    image: { src: "/img/produtos/pizza-de-brownie.jpg", alt: "Fatia de brownie em formato de pizza coberta com brigadeiro", w: 450, h: 450 },
    category: "sobremesas",
  },
  {
    id: "brownie-castanha",
    name: "Brownie com castanha",
    description: "Massa chocolatuda, macia por dentro, com castanha.",
    price: 10.9,
    image: { src: "/img/produtos/brownie-castanha.jpg", alt: "Brownies com pedaços de castanha", w: 450, h: 450 },
    category: "sobremesas",
  },
  {
    id: "brownie-ninho-nutella",
    name: "Brownie recheado de Ninho com Nutella",
    description: "Brownie que derrete na boca, com recheio cremoso de Ninho com Nutella.",
    price: 12,
    image: { src: "/img/produtos/brownie-ninho-nutella.jpg", alt: "Brownie recheado com creme de leite Ninho e Nutella", w: 280, h: 450 },
    category: "sobremesas",
  },
  {
    id: "brownie-ferreiro",
    name: "Brownie recheado de Ferreiro",
    description: "Recheio cremoso de brigadeiro belga com Nutella, decorado com amendoim.",
    price: 12,
    image: { src: "/img/produtos/brownie-ferreiro.jpg", alt: "Brownie recheado de brigadeiro belga com Nutella", w: 600, h: 338 },
    category: "sobremesas",
  },

  // ——— Bebidas
  { id: "coca-lata", name: "Coca-Cola lata", price: 6.9, category: "bebidas" },
  { id: "coca-zero-lata", name: "Coca-Cola Zero lata", price: 6.9, category: "bebidas" },
  { id: "guarana-lata", name: "Guaraná lata", price: 6.9, category: "bebidas" },
  { id: "guarana-zero-lata", name: "Guaraná Zero lata", price: 6.9, category: "bebidas" },
  { id: "coca-600", name: "Coca-Cola 600 ml", price: 9.99, category: "bebidas" },
  { id: "coca-200", name: "Coca-Cola 200 ml", price: 3.5, category: "bebidas" },
  { id: "agua", name: "Água mineral", price: 4, category: "bebidas" },
  { id: "agua-gas", name: "Água mineral com gás", price: 5, category: "bebidas" },
];

export const productsBy = (c: CategoryId) => PRODUCTS.filter((p) => p.category === c);

/** Menor preço possível (base + opção obrigatória mais barata). null se não há preço. */
export function fromPrice(p: Product): number | null {
  if (p.price == null) return null;
  let v = p.price;
  for (const g of p.groups ?? []) if (g.required && g.kind === "single") v += Math.min(...g.options.map((o) => o.price));
  return v;
}
