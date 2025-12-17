import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🔵 API: Начало создания заказа");

  try {
    const supabase = await createClient();

    // 1. Получаем текущего пользователя
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ API: Нет пользователя", authError);
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    console.log(`✅ API: Пользователь найден: ${user.id}`);

    // 2. Проверяем, есть ли товары в корзине
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*, services(*)")
      .eq("user_id", user.id);

    if (cartError) {
      console.error("❌ API: Ошибка загрузки корзины", cartError);
      return NextResponse.json(
        { success: false, error: "Ошибка загрузки корзины" },
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      console.error("❌ API: Корзина пуста");
      return NextResponse.json(
        { success: false, error: "Корзина пуста" },
        { status: 400 }
      );
    }

    console.log(`📦 API: Товаров в корзине: ${cartItems.length}`);

    // 3. Рассчитываем сумму
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.services?.price || 0) * item.quantity;
    }, 0);

    console.log(`💰 API: Сумма заказа: ${totalAmount}`);

    // 4. СОЗДАЕМ ЗАКАЗ
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ API: Ошибка создания заказа:", orderError);
      console.error("Детали ошибки:", JSON.stringify(orderError, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: `Не удалось создать заказ: ${orderError.message}`,
          details: orderError,
        },
        { status: 500 }
      );
    }

    console.log(`✅ API: Заказ создан! ID: ${order.id}`);

    // 5. Создаем позиции заказа
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      service_id: item.service_id,
      quantity: item.quantity,
      price: item.services?.price || 0,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("⚠️ API: Ошибка создания позиций:", itemsError);
    } else {
      console.log(`✅ API: Создано позиций: ${orderItems.length}`);
    }

    // 6. Создаем первое сообщение в чат
    const { error: messageError } = await supabase.from("messages").insert({
      order_id: order.id,
      sender_id: user.id,
      message: "Заказ создан. Ожидайте ответа администратора.",
    });

    if (messageError) {
      console.error("⚠️ API: Ошибка создания сообщения:", messageError);
    } else {
      console.log("✅ API: Первое сообщение создано");
    }

    // 7. Очищаем корзину
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("⚠️ API: Ошибка очистки корзины:", deleteError);
    } else {
      console.log("✅ API: Корзина очищена");
    }

    console.log("🎉 API: Успех! Редирект на: /orders/" + order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      redirectUrl: `/orders/${order.id}`,
    });
  } catch (error: any) {
    console.error("💥 API: Неожиданная ошибка:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
