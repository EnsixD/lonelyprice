import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersTable from "./OrdersTable";

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

  // Вариант 1: Используем правильный синтаксис для JOIN
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      user_profile:profiles!orders_user_id_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  // Если вариант 1 не работает, попробуйте вариант 2:
  /*
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles!inner (
        id,
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false });
  */

  if (error) {
    console.error("Ошибка при загрузке заказов:", error);

    // Запасной вариант: два отдельных запроса
    try {
      const { data: ordersOnly, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Получаем профили отдельно
      const userIds = ordersOnly?.map((o) => o.user_id).filter(Boolean) || [];
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in(
          "id",
          userIds.length > 0
            ? userIds
            : ["00000000-0000-0000-0000-000000000000"]
        );

      // Объединяем данные
      const mergedOrders =
        ordersOnly?.map((order) => ({
          ...order,
          profiles: allProfiles?.find((p) => p.id === order.user_id) || null,
        })) || [];

      console.log(
        "✅ Использован запасной метод. Заказов:",
        mergedOrders.length
      );
      return <OrdersTable orders={mergedOrders} />;
    } catch (fallbackError) {
      console.error("Запасной метод также не сработал:", fallbackError);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500">
            Ошибка загрузки заказов
          </h2>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <p className="text-xs mt-4 p-4 bg-muted rounded">
            Детали: {JSON.stringify(error, null, 2)}
          </p>
        </div>
      );
    }
  }

  console.log("✅ Загружено заказов:", orders?.length || 0);

  // Преобразуем структуру данных для совместимости
  const formattedOrders =
    orders?.map((order) => ({
      ...order,
      // Если используется user_profile, переименовываем в profiles
      profiles: order.user_profile || order.profiles || null,
    })) || [];

  return <OrdersTable orders={formattedOrders} />;
}
