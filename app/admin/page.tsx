import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Package, ShoppingBag, FileText } from "lucide-react";

export default async function Page() {
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

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: servicesCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });

  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: termsCount } = await supabase
    .from("terms_content")
    .select("*", { count: "exact", head: true });

  // Получаем информацию о скидках
  const { data: servicesWithDiscounts } = await supabase
    .from("services")
    .select("discount_percent, discount_end_date")
    .gt("discount_percent", 0);

  const activeDiscountsCount =
    servicesWithDiscounts?.filter((service) => {
      if (!service.discount_percent || service.discount_percent <= 0)
        return false;
      if (!service.discount_end_date) return true;
      const now = new Date();
      const endDate = new Date(service.discount_end_date);
      return endDate > now;
    }).length || 0;

  return (
    <div>
      {/* TITLE */}
      <div className="mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Панель управления
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          Управление системой и мониторинг
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Пользователи
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {usersCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Всего зарегистрировано
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Услуги</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {servicesCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeDiscountsCount > 0
                ? `${servicesCount} услуг, ${activeDiscountsCount} со скидкой`
                : "Активных услуг"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Заказы</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {ordersCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingOrdersCount
                ? `${pendingOrdersCount} ожидают обработки`
                : "Всего заказов"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Разделов условий
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {termsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Всего разделов</p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS - 4 блока (без промо) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/admin/users">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                Управление пользователями
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Просмотр, блокировка и удаление пользователей
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/services">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                Управление услугами
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Редактирование цен, скидок и категорий
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                Управление заказами
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Обработка заказов и общение с клиентами
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/content">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                Управление условиями
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Редактирование разделов и условий соглашения
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
