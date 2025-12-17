import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import myImage from "@/public/logo.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MessageSquare, ArrowLeft, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MobileNav } from "@/components/mobile-nav";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const { count: cartCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "Ожидает" },
      processing: { variant: "default" as const, label: "Обработка" },
      completed: { variant: "default" as const, label: "Завершен" },
      cancelled: { variant: "destructive" as const, label: "Отменен" },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPaymentBadge = (status: string) => {
    const variants = {
      unpaid: { variant: "destructive" as const, label: "Не оплачен" },
      paid: { variant: "default" as const, label: "Оплачен" },
      refunded: { variant: "secondary" as const, label: "Возврат" },
    };
    return variants[status as keyof typeof variants] || variants.unpaid;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
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
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Мои заказы</h1>
        </div>

        {orders && orders.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentBadge(order.payment_status);

              return (
                <Card
                  key={order.id}
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors"
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg sm:text-xl mb-1">
                          Заказ #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Создан{" "}
                          {formatDistanceToNow(new Date(order.created_at), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        <Badge
                          variant={statusBadge.variant}
                          className="text-xs sm:text-sm"
                        >
                          {statusBadge.label}
                        </Badge>
                        <Badge
                          variant={paymentBadge.variant}
                          className="text-xs sm:text-sm"
                        >
                          {paymentBadge.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-muted-foreground">
                        Сумма заказа:
                      </span>
                      <span className="text-lg sm:text-xl font-bold">
                        {order.total_amount.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 sm:p-6 pt-0">
                    <Button
                      asChild
                      className="w-full cursor-pointer text-sm sm:text-base"
                    >
                      <Link href={`/orders/${order.id}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Открыть чат
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-center">
                У вас пока нет заказов
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center">
                Начните с выбора услуг
              </p>
              <Button asChild className="cursor-pointer">
                <Link href="/services">Перейти к услугам</Link>
              </Button>
            </CardContent>
          </Card>
        )}
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
