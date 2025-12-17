import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import myImage from "@/public/logo.png";
import { MobileNav } from "@/components/mobile-nav";
import { Zap } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { count: cartCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile menu + logo */}
            <div className="flex items-center gap-2">
              <MobileNav
                user={user}
                cartCount={cartCount || 0}
                isAdmin={profile?.is_admin || false}
              />
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image
                    src={myImage}
                    alt="Lonely Price"
                    width={500}
                    height={300}
                    priority
                    className="rounded-[50%]"
                  />
                </div>
                <span className="text-base sm:text-lg font-bold">
                  Lonely PRICE
                </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <nav className="flex gap-3 lg:gap-4">
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                  Панель управления
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                  Пользователи
                </Link>
                <Link
                  href="/admin/services"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                  Услуги
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                  Заказы
                </Link>
              </nav>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Link href="/services">Вернуться к сайту</Link>
              </Button>
            </div>

            {/* Mobile - только кнопка "Назад" */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="cursor-pointer text-xs px-2"
              >
                <Link href="/services">На сайт</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <div className="border-t border-border/40 py-6 mt-96">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image
                  src={myImage}
                  alt="Lonely Price"
                  width={500}
                  height={300}
                  priority
                  className="rounded-[50%]"
                />
              </div>
              <span className="text-sm font-medium">Lonely PRICE</span>
            </div>
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} Админ-панель. Все права защищены.
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
