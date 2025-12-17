import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ban, Trash2, Shield, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

// Создаем административного клиента для работы с auth API
const createAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY не настроен в .env.local");
  }

  const {
    createClient: createSupabaseClient,
  } = require("@supabase/supabase-js");

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

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
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ is_blocked: !currentStatus })
      .eq("id", userId);
    redirect("/admin/users");
  };

  const deleteUser = async (userId: string) => {
    "use server";

    try {
      // 1. Удаляем из auth.users (система аутентификации)
      const supabaseAdmin = createAdminClient();
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

      if (authError) {
        console.error("Ошибка удаления из auth.users:", authError);

        // Если ошибка связана с зависимостями, сначала удалим профиль
        if (authError.message.includes("still referenced")) {
          // Удаляем профиль вручную
          const supabase = await createClient();
          await supabase.from("profiles").delete().eq("id", userId);
          redirect(
            "/admin/users?message=Пользователь частично удален (удален только профиль)"
          );
        }

        throw new Error(
          `Не удалось удалить пользователя: ${authError.message}`
        );
      }

      // 2. Профиль автоматически удалится из-за CASCADE
      // Если CASCADE не настроен, раскомментируйте:
      // const supabase = await createClient();
      // await supabase.from("profiles").delete().eq("id", userId);

      redirect("/admin/users?message=Пользователь успешно удален");
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      redirect(
        `/admin/users?error=${encodeURIComponent(
          error.message || "Неизвестная ошибка"
        )}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <p className="text-muted-foreground mt-2">
            Всего пользователей: {users?.length || 0}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell className="font-medium">
                      {userItem.full_name || "Без имени"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {userItem.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userItem.is_admin ? (
                        <Badge className="gap-1">
                          <Shield className="w-3 h-3" />
                          Админ
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Пользователь</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {userItem.is_blocked ? (
                        <Badge variant="destructive">Заблокирован</Badge>
                      ) : (
                        <Badge variant="default">Активен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(userItem.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!userItem.is_admin && (
                          <>
                            <form
                              action={toggleBlock.bind(
                                null,
                                userItem.id,
                                userItem.is_blocked
                              )}
                            >
                              <Button variant="outline" size="sm" type="submit">
                                <Ban className="w-4 h-4 mr-1" />
                                {userItem.is_blocked
                                  ? "Разблокировать"
                                  : "Блокировать"}
                              </Button>
                            </form>
                            <form action={deleteUser.bind(null, userItem.id)}>
                              <Button
                                variant="destructive"
                                size="sm"
                                type="submit"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Удалить
                              </Button>
                            </form>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
