// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lonelyprice.shop"), // Базовый URL для абсолютных путей

  title: "Lonely PRICE - Маркетинг и реклама",
  description:
    "Профессиональные услуги маркетинга, рекламы и продвижения для вашего проекта",

  // Конфигурация иконок
  icons: {
    // Основная иконка для вкладки браузера (favicon)
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
        sizes: "any",
      },
    ],
    // Для Apple устройств
    apple: {
      url: "/logo.png",
      type: "image/png",
      sizes: "any",
    },
    // Для Android и быстрого доступа
    shortcut: "/logo.png",
  },

  keywords: [
    "маркетинг",
    "реклама",
    "стриминг",
    "продвижение",
    "VK Play",
    "SMM",
  ],

  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://lonelyprice.shop",
    title: "Lonely PRICE - Маркетинг и реклама",
    description: "Профессиональные услуги маркетинга, рекламы и продвижения",
    siteName: "Lonely PRICE",
    images: [
      {
        url: "/logo.png", // Будет преобразовано в https://lonelyprice.shop/logo.png
        width: 1200,
        height: 630,
        alt: "Lonely PRICE",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Lonely PRICE - Маркетинг и реклама",
    description: "Профессиональные услуги маркетинга, рекламы и продвижения",
    images: ["/logo.png"], // Будет преобразовано в https://lonelyprice.shop/logo.png
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <head>
        {/* Только метатеги, которые НЕ генерируются Next.js автоматически */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Lonely PRICE" />
        <meta charSet="utf-8" />

        {/* Для Windows */}
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body
        className={`font-sans antialiased flex flex-col min-h-screen backface-visibility-hidden bg-black text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
