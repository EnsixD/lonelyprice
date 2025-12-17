import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Получаем текущего пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Получаем service_id из query params
  const serviceId = request.nextUrl.searchParams.get("service_id");

  if (!serviceId) {
    return NextResponse.json(
      { error: "Service ID is required" },
      { status: 400 }
    );
  }

  // Проверяем, есть ли уже этот товар в корзине
  const { data: existing, error: existingError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("service_id", serviceId)
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    // PGRST116 = no rows found, это нормально
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing) {
    // Если есть, увеличиваем количество
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Если нет, добавляем новый товар
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      service_id: serviceId,
      quantity: 1,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Редирект на страницу корзины
  return NextResponse.redirect(new URL("/dashboard/cart", request.url));
}
