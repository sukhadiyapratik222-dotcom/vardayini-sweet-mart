import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import AdvertisementPopup from "./components/AdvertisementPopup";
import SpinWheelPopup from "./components/SpinWheelPopup";

export const metadata: Metadata = {
  title: "Vardayini Sweet Mart - Authentic Sweets & Namkeen Since 1976",
  description: "Vardayini Sweet Mart - authentic Indian sweets, namkeen, bakery, and festive gifts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <AdvertisementPopup />
              <SpinWheelPopup />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}



