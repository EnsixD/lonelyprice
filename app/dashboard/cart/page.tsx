import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import myImage from "@/public/logo.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Zap, Percent, Tag } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { MobileNav } from "@/components/mobile-nav";
import CartClient from "./CartClient";

// Функция для проверки активной скидки
function isDiscountActive(discountEndDate?: string): boolean {
  if (!discountEndDate) return false;
  try {
    const now = new Date();
    const endDate = new Date(discountEndDate);
    return endDate > now;
  } catch (error) {
    return false;
  }
}

// Функция для извлечения числовой цены
function extractPriceValue(price: string | number): number {
  if (typeof price === "number") return price;

  const match = price.match(/(\d+(?:[.,]\d+)?)/);
  if (match) {
    const priceStr = match[1].replace(",", ".");
    const numericPrice = parseFloat(priceStr);
    return !isNaN(numericPrice) ? numericPrice : 0;
  }

  return 0;
}

// Функция для расчета цены со скидкой
function calculateDiscountedPrice(
  price: number,
  discountPercent: number
): number {
  return Math.round(price * (1 - discountPercent / 100));
}

export default async function CartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Получаем корзину с услугами
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, services(*)")
    .eq("user_id", user.id)
    .order("created_at");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const { count: cartCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Обрабатываем корзину для отображения информации о скидках
  const processedCartItems =
    cartItems?.map((item) => {
      const servicePrice = item.services?.price;
      const discountPercent = item.services?.discount_percent || 0;
      const discountEndDate = item.services?.discount_end_date;

      const originalPrice = extractPriceValue(servicePrice || 0);
      const hasActiveDiscount =
        discountPercent > 0 && isDiscountActive(discountEndDate);

      // Если есть активная скидка, рассчитываем цену со скидкой
      let finalPrice = originalPrice;
      if (hasActiveDiscount) {
        finalPrice = calculateDiscountedPrice(originalPrice, discountPercent);
      }

      // Создаем объект с информацией о скидке
      const discountInfo =
        discountPercent > 0
          ? {
              original_price: originalPrice,
              discount_percent: discountPercent,
              discounted_price: hasActiveDiscount ? finalPrice : originalPrice,
              has_discount: discountPercent > 0,
              is_active_discount: hasActiveDiscount,
              discount_end_date: discountEndDate,
            }
          : undefined;

      return {
        ...item,
        price_at_time: finalPrice,
        discount_info: discountInfo,
      };
    }) || [];

  // Правильно рассчитываем начальную сумму с учетом скидок
  const initialTotalAmount = processedCartItems.reduce((sum, item) => {
    const itemPrice =
      item.discount_info?.discounted_price ||
      extractPriceValue(item.services?.price || 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Считаем общую экономию от скидок
  const totalSavings = processedCartItems.reduce((total, item) => {
    if (
      item.discount_info?.has_discount &&
      item.discount_info?.is_active_discount
    ) {
      const originalPrice = item.discount_info.original_price || 0;
      const discountedPrice = item.discount_info.discounted_price || 0;
      return total + (originalPrice - discountedPrice) * item.quantity;
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <AnimatedBackground />

      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
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

            <div className="hidden md:flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer"
              >
                <Link href="/services">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад к услугам
                </Link>
              </Button>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer p-2"
              >
                <Link href="/services">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">Назад</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Корзина
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                {processedCartItems.length} товаров на сумму{" "}
                {initialTotalAmount.toLocaleString("ru-RU")} ₽
              </p>
              {totalSavings > 0 && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                  <Percent className="w-3 h-3 mr-1" />
                  Экономия {totalSavings.toLocaleString("ru-RU")} ₽
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Client Component */}
        <CartClient
          initialCartItems={processedCartItems}
          initialTotalAmount={initialTotalAmount}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 mt-12 py-6">
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
              © {new Date().getFullYear()} Все права защищены
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
