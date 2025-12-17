"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, Home, ShoppingCart, FileText, User, LogIn, UserPlus, Zap } from "lucide-react"

interface MobileNavProps {
  user: any
  cartCount?: number
}

export function MobileNav({ user, cartCount }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden cursor-pointer">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]" modal={true}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Lonely PRICE
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-3 mt-8">
          <Button asChild variant="ghost" className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
            <Link href="/">
              <Home className="w-5 h-5 mr-3" />
              Главная
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
            <Link href="/services">
              <ShoppingCart className="w-5 h-5 mr-3" />
              Каталог услуг
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
            <Link href="/terms">
              <FileText className="w-5 h-5 mr-3" />
              Условия и соглашения
            </Link>
          </Button>
          {user && (
            <>
              <Button asChild variant="ghost" className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
                <Link href="/dashboard/cart">
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Корзина {cartCount ? `(${cartCount})` : ""}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
                <Link href="/dashboard/profile">
                  <User className="w-5 h-5 mr-3" />
                  Мой профиль
                </Link>
              </Button>
            </>
          )}
          {!user && (
            <>
              <Button asChild variant="ghost" className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
                <Link href="/auth/login">
                  <LogIn className="w-5 h-5 mr-3" />
                  Войти
                </Link>
              </Button>
              <Button asChild className="justify-start cursor-pointer" onClick={() => setOpen(false)}>
                <Link href="/auth/register">
                  <UserPlus className="w-5 h-5 mr-3" />
                  Регистрация
                </Link>
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
