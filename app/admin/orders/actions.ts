"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Убедитесь, что в next.config.js есть настройки для Server Actions
// experimental: {
//   serverActions: {
//     bodySizeLimit: '2mb',
//   },
// }

export async function updateOrderStatus(orderId: string, status: string) {
  console.log(`🔄 [Server Action] updateOrderStatus: ${orderId} -> ${status}`);

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error(`❌ Ошибка обновления статуса:`, error);
    throw new Error(`Ошибка обновления статуса: ${error.message}`);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);

  console.log(`✅ Статус обновлен успешно`);
  return { success: true };
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string
) {
  console.log(
    `🔄 [Server Action] updatePaymentStatus: ${orderId} -> ${paymentStatus}`
  );

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);

  if (error) {
    console.error(`❌ Ошибка обновления статуса оплаты:`, error);
    throw new Error(`Ошибка обновления статуса оплаты: ${error.message}`);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);

  console.log(`✅ Статус оплаты обновлен успешно`);
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  console.log(`🗑️ [Server Action] deleteOrder: ${orderId}`);

  const supabase = await createClient();

  try {
    // 1. Проверяем авторизацию
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Не авторизован");
    }

    // 2. Проверяем права админа
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      throw new Error("Нет прав доступа");
    }

    console.log(`🔍 Проверяем существование заказа ${orderId}...`);

    // 3. Проверяем существование заказа
    const { data: existingOrder, error: checkError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single();

    if (checkError || !existingOrder) {
      console.error(`❌ Заказ не найден:`, checkError);
      return {
        success: false,
        message: "Заказ не найден",
      };
    }

    console.log(`✅ Заказ найден, начинаем удаление...`);

    // 4. Удаляем в правильном порядке (из-за foreign keys)

    // 4a. Удаляем сообщения (если таблица существует)
    try {
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("order_id", orderId);

      if (messagesError) {
        console.log(`ℹ️ Сообщений нет или ошибка:`, messagesError.message);
      } else {
        console.log(`✅ Сообщения удалены`);
      }
    } catch (messagesErr) {
      console.log(`ℹ️ Таблица messages не существует:`, messagesErr);
    }

    // 4b. Удаляем товары заказа (если таблица существует)
    try {
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) {
        console.log(`ℹ️ Товаров нет или ошибка:`, itemsError.message);
      } else {
        console.log(`✅ Товары заказа удалены`);
      }
    } catch (itemsErr) {
      console.log(`ℹ️ Таблица order_items не существует:`, itemsErr);
    }

    // 5. Удаляем сам заказ
    console.log(`🗑️ Удаляем заказ ${orderId}...`);
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error(`❌ Ошибка удаления заказа:`, orderError);
      throw new Error(`Ошибка удаления заказа: ${orderError.message}`);
    }

    console.log(`🎉 Заказ успешно удален!`);

    // 6. Обновляем кэш
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
      message: "Заказ успешно удален",
    };
  } catch (error: any) {
    console.error(`💥 Полная ошибка удаления:`, error);
    return {
      success: false,
      message: error.message || "Неизвестная ошибка при удалении",
    };
  }
}
