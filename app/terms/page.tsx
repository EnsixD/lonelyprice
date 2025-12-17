import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Zap } from "lucide-react";
import Image from "next/image";
import myImage from "@/public/logo.png";
import { AnimatedBackground } from "@/components/animated-background";
import { MobileNav } from "@/components/mobile-nav";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { count: cartCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id || "");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <AnimatedBackground />

      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MobileNav user={user} cartCount={cartCount || 0} />
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image
                    src={myImage}
                    alt="Lonely Price"
                    width={500}
                    height={300}
                    priority
                    className="rounded-[50%]"
                  />
                </div>
                <span className="text-base sm:text-lg font-bold">
                  Lonely PRICE
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-colors cursor-pointer"
              >
                <Link href="/services">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад к услугам
                </Link>
              </Button>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer p-2"
              >
                <Link href="/services">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">Назад</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-12 flex items-center gap-3">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Условия и соглашения
          </h1>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Раздел I. Предоставляемые услуги
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base">
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Реферальная программа
                </h3>
                <p className="text-muted-foreground">
                  Всем, кто приведет друга и он купит у нас любую услугу, дается
                  дополнительная скидка в 5% на следующую покупку пиара/ЭКБ
                  (действует 1 раз за весь срок проведения акции), а сам друг
                  получает дополнительно 10% скидки на покупку пиара/ЭКБ
                  (действует 1 раз), при условии, что он у нас до этого ничего
                  не покупал и является новым клиентом.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Посредничество
                </h3>
                <p className="text-muted-foreground">
                  Выступаем посредником в заключении сделок определенного
                  характера за 10-15% от суммы продажи товара/услуги. От нас
                  дается почти 100% гарантия, что сделка будет совершена без
                  подводных камней и неожиданных сюрпризов.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Пиар
                </h3>
                <p className="text-muted-foreground">
                  Можем пропиарить любой ТГК/прочий ресурс за 1499₽ (со скидкой
                  на первую покупку в 20%), но только те ТГК/ресурсы, которые не
                  нарушают Законодательства РФ.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Экономический карт-бланш
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-1">
                  <li>
                    Малый карт-бланш (90 дней): 1999₽ - 3 бесплатных публикации
                    розыгрышей + 50% скидка на пиар
                  </li>
                  <li>
                    Средний карт-бланш (180 дней): 2999₽ - 7 бесплатных
                    публикаций розыгрышей + 65% скидка на пиар
                  </li>
                  <li>
                    Расширенный карт-бланш (365 дней): 3599₽ - 15 бесплатных
                    публикаций розыгрышей + 75% скидка на пиар + инсайдерская
                    информация
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Раздел II. Партнёрство: условия, обязательства
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base">
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Для пиара у нас, ваш ТГК/иной ресурс не должен:
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground pl-1">
                  <li>
                    Нарушать действующее Законодательство Российской Федерации
                  </li>
                  <li>
                    Нарушать действующие Правила и Лицензионное соглашение
                    компаний LESTA/Wargaming
                  </li>
                  <li>Содержать непристойный контент интимного характера</li>
                  <li>
                    Содержать систематические неконструктивные оскорбления
                  </li>
                  <li>
                    Продавать игровые услуги посредством передачи аккаунта в
                    третьи руки
                  </li>
                  <li>Содержать шокирующий контент</li>
                  <li>Содержать всеразличные мошеннические схемы</li>
                  <li>Разжигать конфликты на любой почве</li>
                  <li>Содержать дискриминацию по различным признакам</li>
                  <li>
                    Заниматься деструктивной или мошеннической деятельностью
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  При заключении партнерского соглашения:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  <li>Соблюдать все правила и условия данного документа</li>
                  <li>
                    Быть готовым к аннулированию привилегии при нарушении
                    условий
                  </li>
                  <li>
                    Льготная ставка действует только при оформлении официального
                    Документа о привилегии ЭКБ
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Раздел III. Нюансы при заключении партнёрства
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <p>
                1. Все случаи рассматриваются индивидуально, возможны
                незначительные уступки
              </p>
              <p>
                2. Соблюдение обязательств с вашей стороны должно быть
                безоговорочным
              </p>
              <p>
                3. Партнерское соглашение можно расторгнуть в любой момент, но с
                потерей льгот
              </p>
              <p>
                4. При разногласиях следует обсудить вопросы в личном порядке,
                без публичной огласки
              </p>
              <p>
                5. При нарушении правил договор может быть расторгнут в
                одностороннем порядке
              </p>
              <p>
                6. Оплата услуг производится заранее по указанным реквизитам
              </p>
              <p>
                7. При покупке услуг через договор необходимо уважать работника
                и его форс-мажоры
              </p>
              <p>8. Партнерские соглашения оформляются через Google Документ</p>
              <p>
                9. При заключении договора цены фиксируются - если вы купили
                подписку за 2500₽, то через год при продлении платите те же
                2500₽
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Раздел IV. Цены
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm sm:text-base">
              <div className="grid gap-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Посредничество:</span>
                  <span className="font-semibold text-right">
                    10-15% от суммы сделки
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">
                    Пиар ТГК/ресурса:
                  </span>
                  <span className="font-semibold text-right">
                    1499₽ (на 2 недели)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Пиар розыгрыша:</span>
                  <span className="font-semibold text-right">
                    1799₽ (на 2 недели)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Пиар бизнеса:</span>
                  <span className="font-semibold text-right">6999₽</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">SMM-менеджмент:</span>
                  <span className="font-semibold text-right">
                    от 85₽ за пост
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">
                    Модерирование чата:
                  </span>
                  <span className="font-semibold text-right">
                    3999₽ в месяц
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">
                    Малый карт-бланш (90 дней):
                  </span>
                  <span className="font-semibold text-right">1999₽</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">
                    Средний карт-бланш (180 дней):
                  </span>
                  <span className="font-semibold text-right">2999₽</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">
                    Расширенный карт-бланш (365 дней):
                  </span>
                  <span className="font-semibold text-right">3599₽</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-center">
                <strong>Важно:</strong> Скидка 20% действует на первую покупку.
                Цены актуальны на момент публикации и могут быть изменены.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 sm:mt-12 flex justify-center">
          <Button asChild size="lg" className="cursor-pointer">
            <Link href="/services">Перейти к услугам</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 mt-12 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image
                  src={myImage}
                  alt="Lonely Price"
                  width={500}
                  height={300}
                  priority
                  className="rounded-[50%]"
                />
              </div>
              <span className="text-sm font-medium">Lonely PRICE</span>
            </div>
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} Все права защищены
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
