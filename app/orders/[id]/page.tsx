import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderChat from "@/components/chat/OrderChat";
import { PaymentDetails } from "@/components/payment/PaymentDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  ShoppingBag,
  DollarSign,
  MessageSquare,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MobileNav } from "@/components/mobile-nav";

// Отключаем статическую генерацию для динамических страниц
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;

  const supabase = await createClient();

  // 1. Проверяем аутентификацию
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. Получаем информацию о заказе
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        price,
        services (
          id,
          title,
          description,
          price
        )
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Заказ не найден:", orderError);
    redirect("/");
  }

  // 3. Проверяем права доступа
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin || false;

  if (!isAdmin && order.user_id !== user.id) {
    redirect("/");
  }

  const { count: cartCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 4. Получаем информацию о клиенте (для админа)
  let customerInfo = null;
  if (isAdmin) {
    const { data: customer } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, phone")
      .eq("id", order.user_id)
      .single();
    customerInfo = customer;
  }

  // 5. Функции для статусов
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        variant: "secondary" as const,
        label: "⏳ Ожидает",
        color: "text-yellow-500",
      },
      processing: {
        variant: "default" as const,
        label: "🔄 В обработке",
        color: "text-blue-500",
      },
      completed: {
        variant: "outline" as const,
        label: "✅ Завершен",
        color: "text-green-500",
      },
      cancelled: {
        variant: "destructive" as const,
        label: "❌ Отменен",
        color: "text-red-500",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPaymentConfig = (status: string) => {
    const configs = {
      unpaid: {
        variant: "destructive" as const,
        label: "💳 Не оплачен",
        color: "text-red-500",
      },
      pending: {
        variant: "secondary" as const,
        label: "⏳ Ожидает оплаты",
        color: "text-yellow-500",
      },
      paid: {
        variant: "outline" as const,
        label: "💰 Оплачен",
        color: "text-green-500",
      },
      refunded: {
        variant: "secondary" as const,
        label: "↩️ Возврат",
        color: "text-gray-500",
      },
    };
    return configs[status as keyof typeof configs] || configs.unpaid;
  };

  const statusConfig = getStatusConfig(order.status);
  const paymentConfig = getPaymentConfig(order.payment_status);

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
                isAdmin={isAdmin}
              />
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold">
                    Lonely PRICE
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Чат по заказу
                  </div>
                </div>
              </Link>

              <div className="hidden md:block pl-4 border-l border-border/40">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    #{orderId.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 cursor-pointer"
              >
                <Link href={isAdmin ? "/admin/orders" : "/dashboard/orders"}>
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">К заказам</span>
                </Link>
              </Button>

              {isAdmin && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <User className="w-3 h-3" />
                  Админ
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Левая колонка - Информация о заказе */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Карточка статуса */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Статус заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Статус</p>
                    <Badge
                      variant={statusConfig.variant}
                      className={`w-full justify-center gap-1 ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Оплата</p>
                    <Badge
                      variant={paymentConfig.variant}
                      className={`w-full justify-center gap-1 ${paymentConfig.color}`}
                    >
                      {paymentConfig.label}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Сумма:</span>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {order.total_amount.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Создан:</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Реквизиты для оплаты (только для клиентов) */}
            {!isAdmin && order.payment_status !== "paid" && (
              <PaymentDetails orderId={orderId} amount={order.total_amount} />
            )}

            {/* Информация о клиенте (только для админа) */}
            {isAdmin && customerInfo && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    Информация о клиенте
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Имя</p>
                    <p className="font-medium text-sm">
                      {customerInfo.full_name || "Не указано"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-sm break-all">
                      {customerInfo.email}
                    </p>
                  </div>
                  {customerInfo.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="font-medium text-sm">
                        {customerInfo.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">ID клиента</p>
                    <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {order.user_id.slice(0, 8)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Состав заказа */}
            {order.order_items && order.order_items.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-primary" />
                    Состав заказа
                    <Badge variant="outline" className="ml-auto">
                      {order.order_items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {order.order_items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.services?.title || "Услуга"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Кол-во: {item.quantity} ×{" "}
                            {item.services?.price?.toLocaleString("ru-RU") || 0}{" "}
                            ₽
                          </p>
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap ml-3">
                          {(
                            (item.services?.price || 0) * item.quantity
                          ).toLocaleString("ru-RU")}{" "}
                          ₽
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Правая колонка - Чат */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-180px)] border-border/50 flex flex-col">
              <CardHeader className="border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  {isAdmin ? "Чат с клиентом" : "Чат с администратором"}
                  <Badge variant="outline" className="ml-auto text-xs">
                    В реальном времени
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAdmin
                    ? "Отвечайте на вопросы клиента и уточняйте детали заказа"
                    : "Задавайте вопросы администратору о вашем заказе"}
                </p>
              </CardHeader>

              <div className="flex-1 overflow-hidden">
                <OrderChat
                  orderId={orderId}
                  currentUser={user}
                  orderStatus={order.status}
                  paymentStatus={order.payment_status}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 mt-12 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
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
