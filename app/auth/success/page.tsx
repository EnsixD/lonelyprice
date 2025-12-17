import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <Link
                href="/"
                className="text-xl font-bold hover:opacity-80 transition-opacity"
              >
                Lonely PRICE
              </Link>
            </div>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Регистрация успешна!</CardTitle>
              <CardDescription className="text-balance">
                Мы отправили письмо с подтверждением на ваш email. Пожалуйста,
                проверьте почту и перейдите по ссылке для активации аккаунта.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-2">Что дальше?</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Проверьте папку "Входящие" в вашей почте</li>
                  <li>Откройте письмо от Lonely PRICE</li>
                  <li>Нажмите на ссылку подтверждения</li>
                  <li>Войдите в систему и начните пользоваться услугами</li>
                </ol>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Перейти к входу</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Link href="/">Вернуться на главную</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
