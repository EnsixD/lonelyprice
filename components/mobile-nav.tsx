"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MobileNavProps {
  user: any;
  cartCount: number;
  isAdmin: boolean;
}

export function MobileNav({ user, cartCount, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из системы");
    router.push("/auth/login");
    router.refresh();
  };

  // Создаем кнопку без передачи ref
  const MenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer md:hidden"
      onClick={() => setOpen(true)}
    >
      <Menu className="w-5 h-5" />
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MenuButton />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:w-80">
        <div className="flex flex-col h-full">
          <div className="flex-1 py-6">
            <nav className="grid gap-1">
              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  router.push("/");
                  setOpen(false);
                }}
                asChild
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-3" />
                  Главная
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  router.push("/terms");
                  setOpen(false);
                }}
                asChild
              >
                <Link href="/terms">
                  <FileText className="w-4 h-4 mr-3" />
                  Условия
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  router.push("/dashboard/cart");
                  setOpen(false);
                }}
                asChild
              >
                <Link href="/dashboard/cart">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Корзина
                  {cartCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  router.push("/dashboard/profile");
                  setOpen(false);
                }}
                asChild
              >
                <Link href="/dashboard/profile">
                  <User className="w-4 h-4 mr-3" />
                  Профиль
                </Link>
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start cursor-pointer"
                  onClick={() => {
                    router.push("/admin");
                    setOpen(false);
                  }}
                  asChild
                >
                  <Link href="/admin">
                    <Settings className="w-4 h-4 mr-3" />
                    Админ-панель
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Выйти
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
