import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { itemId, quantity } = await request.json();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
