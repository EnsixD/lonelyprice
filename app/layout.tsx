import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lonely PRICE - Маркетинг и реклама",
  description:
    "Профессиональные услуги маркетинга, рекламы и продвижения для вашего проекта",
  icons: {
    icon: [
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
