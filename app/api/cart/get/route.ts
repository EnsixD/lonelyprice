import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, services(*)")
    .eq("user_id", user.id)
    .order("created_at");

  const totalAmount = (cartItems || []).reduce(
    (sum: number, item: any) =>
      sum + (item.services?.price || 0) * item.quantity,
    0
  );

  return NextResponse.json({
    cartItems: cartItems || [],
    totalAmount,
  });
}
