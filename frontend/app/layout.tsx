import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/shared/NotificationProvider";
import "./globals.css";
import AuthExpiredModal from "@/components/shared/AuthExpiredModal";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thiên Ngọc Rồng Shop",
  description: "Shop acc Ngọc Rồng Online uy tín",
  icons: {
    icon: "/icon_web.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <NotificationProvider>
          <CartProvider>
            {children}
            <AuthExpiredModal />
            <LoadingOverlay />
            <CartDrawer />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
