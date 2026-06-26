import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/shared/NotificationProvider";
import "./globals.css";
import AuthExpiredModal from "@/components/shared/AuthExpiredModal";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thiên Ngọc Rồng Shop",
  description: "Shop acc Ngọc Rồng Online uy tín",
  icons: {
    icon: "/logo_web-removebg-preview.png",
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
          {children}
          <AuthExpiredModal />
        </NotificationProvider>
      </body>
    </html>
  );
}
