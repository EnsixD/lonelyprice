import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import myImage from "../public/logo.png";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Shield,
  Star,
  FileText,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { OnlineCounter } from "@/components/online-counter";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <AnimatedBackground />

      <div className="border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-50 transition-smooth">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MobileNav user={user} />
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
                <span className="text-base sm:text-xl font-bold">
                  Lonely PRICE
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <OnlineCounter />
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-smooth hover-scale cursor-pointer"
              >
                <Link href="/services">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Услуги
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-smooth hover-scale cursor-pointer"
              >
                <Link href="/terms">
                  <FileText className="w-4 h-4 mr-2" />
                  Условия
                </Link>
              </Button>
              {user ? (
                <Button
                  asChild
                  size="sm"
                  className="transition-smooth hover-scale cursor-pointer"
                >
                  <Link href="/dashboard/profile">Мой аккаунт</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="transition-smooth cursor-pointer"
                  >
                    <Link href="/auth/login">Войти</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="transition-smooth hover-scale cursor-pointer"
                  >
                    <Link href="/auth/register">Регистрация</Link>
                  </Button>
                </>
              )}
            </div>
            <div className="flex md:hidden items-center gap-2">
              {user ? (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer"
                >
                  <Link href="/dashboard/profile">
                    <Image
                      src={myImage}
                      alt="Lonely Price"
                      width={500}
                      height={300}
                      priority
                      className="rounded-[50%]"
                    />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="cursor-pointer">
                  <Link href="/auth/register">Войти</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background/50 via-background/50 to-primary/5 border-b border-border animate-fade-in backdrop-blur-sm z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:py-32 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 transition-smooth hover-scale cursor-pointer">
              <Zap className="w-3 h-3 mr-1" />
              Профессиональные услуги
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground/60 bg-clip-text text-transparent text-balance animate-gradient">
              Lonely PRICE
            </h1>
            <p className="mt-2 text-lg sm:text-xl text-primary font-semibold">
              soloa4 Manager
            </p>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-2xl text-balance px-4">
              Маркетинг, реклама и профессиональные услуги для развития вашего
              проекта в мире стриминга и онлайн-развлечений
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button
                asChild
                size="lg"
                className="font-semibold transition-smooth hover-scale cursor-pointer w-full sm:w-auto"
              >
                <Link href="/services">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Все услуги
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              {!user && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="transition-smooth hover-scale bg-transparent cursor-pointer w-full sm:w-auto"
                >
                  <Link href="/auth/register">Создать аккаунт</Link>
                </Button>
              )}
            </div>

            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl w-full px-4">
              <div className="flex flex-col items-center transition-smooth hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-3 transition-smooth hover:bg-primary/20 cursor-pointer">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Гарантия качества</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center text-balance">
                  Профессиональное выполнение всех услуг
                </p>
              </div>
              <div className="flex flex-col items-center transition-smooth hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-3 transition-smooth hover:bg-primary/20 cursor-pointer">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Быстро и надежно</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center text-balance">
                  Оперативная обработка заказов 24/7
                </p>
              </div>
              <div className="flex flex-col items-center transition-smooth hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-3 transition-smooth hover:bg-primary/20 cursor-pointer">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Индивидуальный подход</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center text-balance">
                  Персональная работа с каждым клиентом
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-in relative z-10 flex-1">
        <div className="mb-8 sm:mb-12 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Что мы предлагаем
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground text-balance">
            Широкий спектр профессиональных услуг для продвижения в стриминге и
            медиа
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4">
          <div className="p-5 sm:p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-smooth hover-scale card-glow cursor-pointer">
            <h3 className="font-bold text-base sm:text-lg mb-2">
              Реклама и продвижение
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Эффективная реклама на стримах и в социальных сетях
            </p>
          </div>
          <div className="p-5 sm:p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-smooth hover-scale card-glow cursor-pointer">
            <h3 className="font-bold text-base sm:text-lg mb-2">
              Рейды и активность
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Организация рейдов на VK Play и другие платформы
            </p>
          </div>
          <div className="p-5 sm:p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-smooth hover-scale card-glow cursor-pointer">
            <h3 className="font-bold text-base sm:text-lg mb-2">
              SMM управление
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Полное управление социальными сетями и контентом
            </p>
          </div>
          <div className="p-5 sm:p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-smooth hover-scale card-glow cursor-pointer">
            <h3 className="font-bold text-base sm:text-lg mb-2">
              Модерация чата
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Профессиональная модерация стримов и сообществ
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="transition-smooth hover-scale cursor-pointer"
          >
            <Link href="/services">
              Смотреть все услуги
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-primary/5 border-y border-border backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance px-4">
            Готовы начать работу?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground text-balance px-4">
            Зарегистрируйтесь сейчас и получите доступ ко всем профессиональным
            услугам
          </p>
          {!user && (
            <Button
              asChild
              size="lg"
              className="mt-6 sm:mt-8 transition-smooth hover-scale cursor-pointer"
            >
              <Link href="/auth/register">Создать аккаунт бесплатно</Link>
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
