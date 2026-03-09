import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";

import { CartProvider } from "@/context/CartContext";
import { NavigationProvider } from "@/context/NavigationContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { fetchPayloadHeaderMenuItems } from "@/lib/payload-categories";
import { fetchPayloadProducts } from "@/lib/payload-products";

import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Lumera - Elegantní kožené kabelky z Itálie",
  description:
    "Obchod s italskými koženými kabelkami, peněženkami a doplňky. Pravá kůže, nadčasový styl.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, menuItems] = await Promise.all([
    fetchPayloadProducts(),
    fetchPayloadHeaderMenuItems(),
  ]);
  return (
    <html lang="cs">
      <body
        className={`${cormorantGaramond.variable} ${workSans.variable} antialiased font-sans`}
      >
        <NavigationProvider initialMenuItems={menuItems}>
          <ProductsProvider initialProducts={products}>
            <CartProvider>{children}</CartProvider>
          </ProductsProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
