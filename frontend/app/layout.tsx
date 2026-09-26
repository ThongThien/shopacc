import type { Metadata } from "next";
import { NotificationProvider } from "@/components/shared/NotificationProvider";
import "./globals.css";
import AuthExpiredModal from "@/components/shared/AuthExpiredModal";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "sonner";

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
    <html lang="vi" suppressHydrationWarning>
      <body>
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
