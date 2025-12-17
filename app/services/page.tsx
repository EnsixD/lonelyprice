import { createClient } from "@/lib/supabase/server";
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
  Megaphone,
  MessageSquare,
  Star,
  Zap,
  Shield,
  Radio,
  Target,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { redirect } from "next/navigation";

const categoryIcons: Record<string, any> = {
  "Реклама и продвижение": Megaphone,
  "Управление и модерация": MessageSquare,
  "Подписки и пакеты": Star,
  "Дополнительные услуги": Zap,
};

const serviceImages: Record<string, string> = {
  Пиар: "radial-gradient(circle at top left, oklch(0.55 0.15 200 / 0.2), transparent 50%), radial-gradient(circle at bottom right, oklch(0.65 0.2 180 / 0.2), transparent 50%)",
  Реклама:
    "radial-gradient(circle at top right, oklch(0.6 0.18 190 / 0.2), transparent 50%), radial-gradient(circle at bottom left, oklch(0.55 0.15 210 / 0.2), transparent 50%)",
  Модерация:
    "radial-gradient(circle at center, oklch(0.5 0.2 170 / 0.2), transparent 60%)",
  SMM: "radial-gradient(circle at top, oklch(0.65 0.2 180 / 0.2), transparent 50%), radial-gradient(circle at bottom, oklch(0.55 0.15 200 / 0.2), transparent 50%)",
};

function getServiceIcon(title: string) {
  if (
    title.toLowerCase().includes("пиар") ||
    title.toLowerCase().includes("реклама")
  ) {
    return Megaphone;
  }
  if (title.toLowerCase().includes("модер")) {
    return Shield;
  }
  if (
    title.toLowerCase().includes("карт-бланш") ||
    title.toLowerCase().includes("экономический")
  ) {
    return Star;
  }
  if (
    title.toLowerCase().includes("smm") ||
    title.toLowerCase().includes("менеджер")
  ) {
    return TrendingUp;
  }
  if (title.toLowerCase().includes("рейд")) {
    return Radio;
  }
  if (title.toLowerCase().includes("посредник")) {
    return Users;
  }
  return Target;
}

function getServiceGradient(title: string) {
  for (const [key, gradient] of Object.entries(serviceImages)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return gradient;
    }
  }
  return serviceImages["Пиар"];
}

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  const { count: cartCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const servicesByCategory = services?.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  const addToCart = async (serviceId: string) => {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_id", serviceId)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        service_id: serviceId,
        quantity: 1,
      });
    }

    redirect("/services");
  };

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
                isAdmin={profile?.is_admin || false}
              />
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
              <Button asChild size="sm" className="cursor-pointer">
                <Link href="/dashboard/profile">Профиль</Link>
              </Button>
            </div>

            <div className="flex md:hidden items-center gap-2">
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
        </div>

        {servicesByCategory ? (
          Object.entries(servicesByCategory).map(
            ([category, categoryServices]) => {
              const CategoryIcon = categoryIcons[category] || Target;
              return (
                <div key={category} className="mb-8 sm:mb-10 lg:mb-12">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-balance">{category}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categoryServices.map((service) => {
                      const ServiceIcon = getServiceIcon(service.title);
                      const gradient = getServiceGradient(service.title);

                      return (
                        <Card
                          key={service.id}
                          className="flex flex-col overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full"
                        >
                          <div
                            className="h-40 sm:h-48 relative flex items-center justify-center border-b border-border/50"
                            style={{ background: gradient }}
                          >
                            <div className="absolute inset-0 bg-card/20 backdrop-blur-[2px]" />
                            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                              <ServiceIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            </div>
                          </div>

                          <div className="flex flex-col flex-1 p-4 sm:p-6">
                            <CardHeader className="p-0 flex-grow pb-3">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <CardTitle className="text-base sm:text-lg lg:text-xl text-balance leading-snug">
                                  {service.title}
                                </CardTitle>
                                {service.price > 0 ? (
                                  <Badge
                                    variant="secondary"
                                    className="font-bold whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 py-1"
                                  >
                                    {service.price.toLocaleString("ru-RU")} ₽
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="whitespace-nowrap flex-shrink-0 text-xs px-2 py-1"
                                  >
                                    Индивидуально
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-balance leading-relaxed text-sm sm:text-base line-clamp-3">
                                {service.description}
                              </CardDescription>
                            </CardHeader>

                            <CardFooter className="p-0 pt-4 mt-auto border-t border-border/20">
                              <form
                                action={addToCart.bind(null, service.id)}
                                className="w-full"
                              >
                                <Button
                                  type="submit"
                                  className="w-full cursor-pointer text-sm sm:text-base"
                                  size="default"
                                >
                                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  В корзину
                                </Button>
                              </form>
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
