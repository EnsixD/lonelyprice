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
    url: "https://yourdomain.com",
    title: "Lonely PRICE - Маркетинг и реклама",
    description: "Профессиональные услуги маркетинга, рекламы и продвижения",
    siteName: "Lonely PRICE",
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
        {/* Preconnect для улучшения производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Предзагрузка критических ресурсов */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />

        {/* Viewport оптимизация */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Предотвращение зума на iOS */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        {/* Цвета статус бара */}
        <meta name="theme-color" content="#000000" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`font-sans antialiased flex flex-col min-h-screen backface-visibility-hidden`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
