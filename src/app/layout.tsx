import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PetConnect",
  description: "Red vecinal proactiva para dueños de mascotas.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF7B54",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${outfit.className}`}>
        <AuthProvider>
          <div className="hero-gradient" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
