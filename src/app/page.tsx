import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrderDock } from "@/components/cart/OrderDock";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toast } from "@/components/cart/Toast";
import { ProductSheet } from "@/components/menu/ProductSheet";
import { Hero } from "@/sections/Hero";
import { Menu } from "@/sections/Menu";
import { Gallery } from "@/sections/Gallery";
import { About } from "@/sections/About";
import { Reviews } from "@/sections/Reviews";
import { Location } from "@/sections/Location";
import { FinalCta } from "@/sections/FinalCta";

/**
 * Ordem pensada para vender: o burger na primeira tela, o cardápio logo em seguida (pedido
 * em poucos segundos), depois o que convence quem ainda está em dúvida (produto real, a
 * casa, a nota no Google) e, por fim, onde fica e o empurrão final.
 */
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Menu />
        <Gallery />
        <About />
        <Reviews />
        <Location />
        <FinalCta />
      </main>
      <Footer />
      <OrderDock />
      <Toast />
      <ProductSheet />
      <CartDrawer />
    </>
  );
}
