import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("API: /api/cart/add called");

  try {
    const supabase = await createClient();

    // Проверяем авторизацию
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("User:", user?.id);

    if (!user) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId } = body;

    console.log("Service ID:", serviceId);

    if (!serviceId) {
      return NextResponse.json(
        { error: "ID услуги не указан" },
        { status: 400 }
      );
    }

    // Проверяем, есть ли уже этот товар в корзине
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_id", serviceId)
      .single();

    console.log("Existing item:", existingItem);

    let result;

    if (existingItem) {
      // Обновляем существующий товар
      const { data, error } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + 1,
        })
        .eq("id", existingItem.id)
        .select()
        .single();

      console.log("Update result:", { data, error });

      if (error) {
        console.error("Ошибка обновления корзины:", error);
        return NextResponse.json(
          { error: "Ошибка обновления корзины" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Добавляем новый товар
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          service_id: serviceId,
          quantity: 1,
        })
        .select()
        .single();

      console.log("Insert result:", { data, error });

      if (error) {
        console.error("Ошибка добавления в корзину:", error);
        return NextResponse.json(
          { error: "Ошибка добавления в корзину" },
          { status: 500 }
        );
      }
      result = data;
    }

    // Получаем обновленное количество товаров в корзине
    const { count: cartCount } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    console.log("New cart count:", cartCount);

    return NextResponse.json({
      success: true,
      message: "Товар добавлен в корзину",
      cartCount: cartCount || 0,
    });
  } catch (error) {
    console.error("Неожиданная ошибка:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
