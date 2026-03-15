import type { Metadata } from "next";
import localFont from "next/font/local";

import { CartProvider } from "@/context/CartContext";
import { NavigationProvider } from "@/context/NavigationContext";
import { fetchPayloadHeaderMenuItems } from "@/lib/payload-categories";

import "./globals.css";

const cormorantGaramond = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    {
      path: "./fonts/CormorantGaramond-Variable.ttf",
      weight: "300 700",
      style: "normal",
    },
  ],
});

const workSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    {
      path: "./fonts/WorkSans-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
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
  const menuItems = await fetchPayloadHeaderMenuItems();
  return (
    <html lang="cs">
      <body
        className={`${cormorantGaramond.variable} ${workSans.variable} antialiased font-sans`}
      >
        <NavigationProvider initialMenuItems={menuItems}>
          <CartProvider>{children}</CartProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
