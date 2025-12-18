"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import myImage from "@/public/logo.png";
import { MobileNav } from "@/components/mobile-nav";
import {
  FileText,
  ArrowLeft,
  ShoppingCart,
  Loader2,
  Megaphone,
  Shield,
  Sparkles,
  Crown,
  Radio,
  TrendingUp,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  BarChart3,
  Headphones,
  Code,
  Lock,
  Target,
  Palette,
  Video as VideoIcon,
  MessageCircle,
  Award,
  Wallet,
  Lightning,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AnimatedBackground from "@/components/animated-background";

// Иконки для категорий
const categoryIcons: Record<string, any> = {
  "Реклама и продвижение": Megaphone,
  "Управление и модерация": Shield,
  "Подписки и пакеты": Crown,
  "Дополнительные услуги": Sparkles,
  "Рейд и активности": Radio,
  "SMM и менеджмент": TrendingUp,
  "Пиар и брендинг": Sparkles,
  "Дизайн и медиа": Camera,
  "Музыка и творчество": Music,
  "Игры и развлечения": Gamepad2,
  "Обучение и консалтинг": BookOpen,
  "Аналитика и отчеты": BarChart3,
  "Техническая поддержка": Headphones,
  Разработка: Code,
  Безопасность: Lock,
};

// Функция для обработки ссылок в тексте
const parseDescriptionLinks = (text: string) => {
  if (!text) return text;

  // Регулярное выражение для поиска URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Разделяем текст по ссылкам
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part.length > 30 ? `${part.substring(0, 30)}...` : part}
        </a>
      );
    }
    return part;
  });
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [servicesByCategory, setServicesByCategory] = useState<
    Record<string, any[]>
  >({});
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);

      // Получаем текущего пользователя (необязательно)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      setUser(authUser);

      // Получаем услуги (всегда доступно, даже без авторизации)
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at");

      setServices(servicesData || []);

      // Группировка услуг по категориям
      const grouped = (servicesData || []).reduce((acc, service) => {
        if (!acc[service.category]) {
          acc[service.category] = [];
        }
        acc[service.category].push(service);
        return acc;
      }, {} as Record<string, any[]>);

      setServicesByCategory(grouped);

      // Получаем количество товаров в корзине (только если пользователь авторизован)
      if (authUser) {
        const { count: cartCountData } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", authUser.id);

        setCartCount(cartCountData || 0);

        // Проверяем, является ли пользователь администратором
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authUser.id)
          .single();

        setIsAdmin(profile?.is_admin || false);
      } else {
        setCartCount(0);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error loading page data:", error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setIsLoading(false);
    }
  }

  // Функция добавления в корзину
  async function handleAddToCart(serviceId: string) {
    if (!user) {
      toast.error("Для добавления в корзину необходимо войти в аккаунт");
      router.push("/auth/login");
      return;
    }

    try {
      setPendingServiceId(serviceId);

      console.log("Adding to cart:", serviceId);

      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId }),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (response.ok && result.success) {
        setCartCount(result.cartCount || 0);
        toast.success("Товар добавлен в корзину!");
      } else {
        toast.error(result.error || "Ошибка при добавлении в корзину");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Ошибка при добавлении в корзину");
    } finally {
      setPendingServiceId(null);
    }
  }

  // Функция форматирования цены
  function formatPrice(price: any) {
    if (typeof price === "number") {
      return price.toLocaleString("ru-RU") + " ₽";
    }
    return price + " ₽";
  }

  // Функция получения иконки для услуги
  function getServiceIcon(serviceTitle: string, description: string) {
    const titleLower = serviceTitle.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes("пиар") || descLower.includes("пиар"))
      return Megaphone;
    if (titleLower.includes("реклам") || descLower.includes("реклам"))
      return Target;
    if (titleLower.includes("модер") || descLower.includes("модер"))
      return Shield;
    if (titleLower.includes("smm") || descLower.includes("smm"))
      return TrendingUp;
    if (titleLower.includes("рейд") || descLower.includes("рейд")) return Radio;
    if (titleLower.includes("подписк") || descLower.includes("подписк"))
      return Crown;
    if (titleLower.includes("дизайн") || descLower.includes("дизайн"))
      return Palette;
    if (titleLower.includes("видео") || descLower.includes("видео"))
      return VideoIcon;
    if (titleLower.includes("музык") || descLower.includes("музык"))
      return Music;
    if (titleLower.includes("игр") || descLower.includes("игр"))
      return Gamepad2;
    if (titleLower.includes("обучен") || descLower.includes("обучен"))
      return BookOpen;
    if (titleLower.includes("аналит") || descLower.includes("аналит"))
      return BarChart3;
    if (titleLower.includes("чат") || descLower.includes("чат"))
      return MessageCircle;
    if (titleLower.includes("технич") || descLower.includes("технич"))
      return Headphones;
    if (titleLower.includes("разработ") || descLower.includes("разработ"))
      return Code;
    if (titleLower.includes("безопасн") || descLower.includes("безопасн"))
      return Lock;
    if (titleLower.includes("быстр") || descLower.includes("быстр"))
      return Lightning;
    if (titleLower.includes("качеств") || descLower.includes("качеств"))
      return Award;
    if (titleLower.includes("эконом") || descLower.includes("эконом"))
      return Wallet;

    return Sparkles;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Загрузка услуг...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <AnimatedBackground />

      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MobileNav
                user={user}
                cartCount={cartCount || 0}
                isAdmin={isAdmin}
              />
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  <Image
                    src={myImage}
                    alt="Lonely Price"
                    width={32}
                    height={32}
                    priority
                    className="rounded-[50%] object-cover w-full h-full"
                    sizes="(max-width: 640px) 32px, 40px"
                  />
                </div>
                <span className="text-base sm:text-lg font-bold">
                  Lonely PRICE
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-colors cursor-pointer"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Главная
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-colors cursor-pointer"
              >
                <Link href="/terms">
                  <FileText className="w-4 h-4 mr-2" />
                  Условия
                </Link>
              </Button>
              {user ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="transition-colors cursor-pointer bg-transparent"
                >
                  <Link href="/dashboard/cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Корзина {cartCount ? `(${cartCount})` : ""}
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="transition-colors cursor-pointer bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Войти
                  </Link>
                </Button>
              )}
              {user ? (
                <Button asChild size="sm" className="cursor-pointer">
                  <Link href="/dashboard/profile">Профиль</Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="cursor-pointer">
                  <Link href="/auth/register">Регистрация</Link>
                </Button>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              {user ? (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer p-2"
                >
                  <Link href="/dashboard/cart">
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount ? (
                      <span className="ml-1 text-xs font-medium">
                        {cartCount}
                      </span>
                    ) : null}
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer p-2"
                >
                  <Link href="/auth/login">
                    <LogIn className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground via-primary to-foreground/60 bg-clip-text text-transparent">
            Каталог услуг
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg text-muted-foreground text-balance">
            Профессиональные услуги для продвижения и развития вашего проекта
          </p>
          {!user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-xs text-primary font-medium">
                Для оформления заказа требуется регистрация
              </span>
            </div>
          )}
        </div>

        {Object.keys(servicesByCategory).length > 0 ? (
          Object.entries(servicesByCategory).map(
            ([category, categoryServices]) => {
              const CategoryIcon = categoryIcons[category] || Sparkles;

              return (
                <div key={category} className="mb-8 sm:mb-10 lg:mb-12">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {category}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categoryServices.map((service) => {
                      const isPending = pendingServiceId === service.id;
                      const ServiceIcon = getServiceIcon(
                        service.title,
                        service.description
                      );

                      return (
                        <Card
                          key={service.id}
                          className="flex flex-col overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-lg h-full"
                        >
                          <div className="h-40 sm:h-48 relative flex items-center justify-center border-b border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card/80 border border-primary/20 flex items-center justify-center">
                              <ServiceIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            </div>
                          </div>

                          <div className="flex flex-col flex-1 p-4 sm:p-6">
                            <CardHeader className="p-0 flex-grow pb-3">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <CardTitle className="text-base sm:text-lg lg:text-xl text-balance leading-snug">
                                  {service.title}
                                </CardTitle>
                                <div className="flex flex-col items-end gap-1 whitespace-nowrap flex-shrink-0">
                                  <Badge
                                    variant="secondary"
                                    className="font-bold text-xs sm:text-sm px-2 py-1"
                                  >
                                    {formatPrice(service.price)}
                                  </Badge>
                                  {service.discount_percent > 0 && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      -{service.discount_percent}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <CardDescription className="text-balance leading-relaxed text-sm sm:text-base line-clamp-3">
                                {/* Используем функцию для парсинга ссылок */}
                                {parseDescriptionLinks(service.description)}
                              </CardDescription>
                            </CardHeader>

                            <CardFooter className="p-0 pt-4 mt-auto border-t border-border/20">
                              <Button
                                onClick={() => handleAddToCart(service.id)}
                                className="w-full cursor-pointer text-sm sm:text-base"
                                size="default"
                                disabled={isPending}
                              >
                                {isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                    Добавляем...
                                  </>
                                ) : user ? (
                                  <>
                                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    В корзину
                                  </>
                                ) : (
                                  <>
                                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Войти для покупки
                                  </>
                                )}
                              </Button>
                            </CardFooter>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Услуги временно недоступны. Попробуйте позже.
            </p>
          </div>
        )}

        {/* Призыв к регистрации для неавторизованных */}
        {!user && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Готовы оформить заказ?
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Зарегистрируйтесь или войдите в аккаунт, чтобы добавить услуги
                  в корзину и оформить заказ
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="cursor-pointer">
                  <Link href="/auth/register">Создать аккаунт</Link>
                </Button>
                <Button asChild variant="outline" className="cursor-pointer">
                  <Link href="/auth/login">Войти в аккаунт</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 py-6 mt-96">
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
              © {new Date().getFullYear()} Админ-панель. Все права защищены.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
