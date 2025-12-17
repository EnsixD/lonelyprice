"use client";

import Link from "next/link";
import {
  Mail,
  Users,
  Globe,
  FileText,
  ShoppingBag,
  Home,
  Shield,
} from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/services", label: "Услуги", icon: ShoppingBag },
    { href: "/terms", label: "Условия", icon: FileText },
    { href: "/dashboard/profile", label: "Аккаунт", icon: Users },
  ];

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-xl relative z-10 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-2xl font-bold hover:text-primary transition-colors inline-block"
            >
              Lonely PRICE
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Профессиональные услуги маркетинга, рекламы и продвижения для
              вашего бизнеса
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Навигация
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors hover:text-primary flex items-center gap-2 group ${
                        isActive
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Контакты
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:admin@lonelyprice.services"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground/70">
                    Администратор
                  </div>
                  <div className="font-medium">admin@lonelyprice.services</div>
                </div>
              </a>
              <a
                href="mailto:support@lonelyprice.services"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent/20">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground/70">
                    Поддержка
                  </div>
                  <div className="font-medium">
                    support@lonelyprice.services
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Legal Section */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Информация
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 transition-transform group-hover:scale-150" />
                  Условия и соглашения
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 transition-transform group-hover:scale-150" />
                  Каталог услуг
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 Lonely PRICE. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
