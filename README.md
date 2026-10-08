# The Bridge Burger — site oficial

Hamburgueria artesanal na Ponte Grande, Guarulhos. Site com cardápio interativo, carrinho e pedido finalizado no WhatsApp da casa.

Next.js 15 · React 19 · TypeScript · Tailwind 3 · Motion · WebGL puro (brasas do hero, sem three.js).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Onde mudar cada coisa

| O quê | Arquivo |
|---|---|
| Produtos, preços, adicionais, categorias | `src/data/menu.ts` |
| Horário, taxa de entrega por km, pagamentos | `src/data/hours.ts` |
| WhatsApp, endereço, redes, textos da marca | `src/data/site.ts` (WhatsApp pode vir do `.env`) |
| Avaliações | `src/data/reviews.ts` |
| Fotos da galeria | `src/data/gallery.ts` + `public/img/galeria/` |
| Cores e tokens | `src/styles/tokens.css` |
| Formato da mensagem do WhatsApp | `src/utils/whatsapp.ts` |

## Fontes dos dados (08/10/2026)

- **Cardápio, preços, adicionais, horário, taxas, pagamentos, WhatsApp:** WhatsMenu oficial da casa (`whatsmenu.com.br/thebridgeburger`).
- **Fotos e vídeo:** Instagram @thebridgeburger (fotos da própria casa) e fotos dos produtos no WhatsMenu.
- **Nota 4,8 (45 avaliações) e depoimentos:** Google, via RestaurantGuru.
- **"Desde 2020", "Hambúrgueres e molhos artesanais":** bio do Instagram.

## Pendências (dados que não existem publicamente — nada foi inventado)

1. **Os 11 hambúrgueres da casa** (Bridge Burger, Bacon, Salada, The Bridge, BBK, Clássico, Quarteirão, 1983, Toscana, 1983 Toscana, Jalapeño) só aparecem como escolha dentro dos combos, sem preço avulso nem descrição. Com o cardápio da casa, basta adicioná-los em `PRODUCTS` (categoria `artesanais`).
2. **Pizza de brownie de brigadeiro** está sem preço no WhatsMenu. No site ela vai como "valor a confirmar".
3. **Categorias vazias no WhatsMenu:** Bridge Churros, Mini Salgados, Pede um Açaí, Bridge Shake. Ficaram fora do site.
4. **Conflito de horário:** o RestaurantGuru diz quinta 18h–23h, o WhatsMenu diz 18h20–23h. Vale o WhatsMenu (sistema de pedidos da casa).
5. **Fotos em alta:** as fotos dos produtos no WhatsMenu têm 280–940 px. Fotos novas em alta resolução melhorariam promoções e sobremesas.
6. **Domínio:** quando houver, definir `NEXT_PUBLIC_SITE_URL`.

## Logo

Reconstruída em vetor a partir do arquivo original de 150 px (mesmo símbolo, proporções e tipografia: Fredoka 500 para "The Bridge" e "Burger & Co.", Open Sans Bold em "Concept Store", tudo convertido em curvas). Arquivos em `public/brand/`:

- `logo.svg` (branca, principal, fundo escuro) · `logo-black.svg` (preta, fundo claro)
- `logo-on-dark.svg` / `logo-on-light.svg` (com fundo)
- `logo-horizontal.svg` (header) · `symbol.svg` / `symbol-black.svg`
- PNG transparente 2048 px de cada versão, `icon-512.png`, `favicon.ico` (16/32/48)

## Aviso de segurança para a casa

A API pública do WhatsMenu expõe a chave de produção da conta Asaas da loja e o contato de quem administra. Recomenda-se gerar uma nova chave no Asaas e avisar o suporte do WhatsMenu.
