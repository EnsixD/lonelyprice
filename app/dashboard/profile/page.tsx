"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import myImage from "@/public/logo.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedBackground } from "@/components/animated-background";
import { MobileNav } from "@/components/mobile-nav";
import {
  User,
  Lock,
  ShoppingCart,
  Package,
  LogOut,
  Zap,
  FileText,
  Upload,
  Settings,
  Mail,
  Shield,
  CreditCard,
  History,
  HelpCircle,
  Bell,
  Globe,
  Key,
  UserCircle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cartCount, setCartCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setProfile(profile);
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }

    // Получаем количество товаров в корзине
    const { count: cartCount } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setCartCount(cartCount || 0);

    // Получаем количество заказов
    const { count: ordersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setOrdersCount(ordersCount || 0);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Delete old avatar if exists
        if (profile?.avatar_url) {
          const oldPath = profile.avatar_url.split("/avatars/")[1];
          if (oldPath) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        }

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          toast.error(`Ошибка при загрузке аватара: ${uploadError.message}`);
          setIsLoading(false);
          return;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        toast.error(`Ошибка при обновлении профиля: ${updateError.message}`);
      } else {
        toast.success("Профиль успешно обновлен");
        setAvatarFile(null);
        await loadProfile();
      }
    } catch (error) {
      toast.error("Произошла непредвиденная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Ошибка при смене пароля");
    } else {
      toast.success("Пароль успешно изменен");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase();

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
                cartCount={cartCount}
                isAdmin={profile?.is_admin || false}
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
                className="transition-colors cursor-pointer h-9 px-3"
              >
                <Link href="/services">
                  <Zap className="w-4 h-4 mr-2" />
                  Услуги
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-colors cursor-pointer h-9 px-3"
              >
                <Link href="/dashboard/cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Корзина {cartCount > 0 ? `(${cartCount})` : ""}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-colors cursor-pointer h-9 px-3"
              >
                <Link href="/dashboard/orders">
                  <Package className="w-4 h-4 mr-2" />
                  Заказы {ordersCount > 0 ? `(${ordersCount})` : ""}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-colors cursor-pointer h-9 px-3"
              >
                <Link href="/terms">
                  <FileText className="w-4 h-4 mr-2" />
                  Условия
                </Link>
              </Button>
              {profile?.is_admin && (
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer h-9 px-3"
                >
                  <Link href="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Админ
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="cursor-pointer h-9 px-3"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>

            <div className="flex md:hidden items-center gap-2">
              {profile?.is_admin && (
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer p-2 h-9 w-9"
                >
                  <Link href="/admin">
                    <Settings className="w-4 h-4" />
                    <span className="sr-only">Админ</span>
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer p-2 h-9 w-9"
              >
                <Link href="/dashboard/cart">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/60 bg-clip-text text-transparent">
            Личный кабинет
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление вашей учетной записью и настройками
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats Only */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card - Улучшенный дизайн */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Статистика в кругах */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="8"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="8"
                          strokeLinecap="round"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          strokeDasharray={`${(cartCount / 10) * 251.2} 251.2`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{cartCount}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground mt-2">
                      В корзине
                    </span>
                  </div>

                  <div className="relative flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="8"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="8"
                          strokeLinecap="round"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          strokeDasharray={`${
                            (ordersCount / 10) * 251.2
                          } 251.2`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {ordersCount}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground mt-2">
                      Заказов
                    </span>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Информация об аккаунте */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Статус аккаунта</p>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 mt-1"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Активен
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Дата регистрации
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString(
                              "ru-RU"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Информация о роли */}
                  {profile?.is_admin && (
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          Роль: Администратор
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Полный доступ ко всем функциям системы
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                  </div>
                  <p className="text-sm text-muted-foreground break-all pl-6">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground/70 pl-6">
                    Email не может быть изменен
                  </p>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Имя:</span>
                  </div>
                  <p className="text-sm font-medium pl-6">
                    {fullName || "Не указано"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Редактировать профиль
                </CardTitle>
                <CardDescription>
                  Обновите ваше имя и аватар профиля
                </CardDescription>
              </CardHeader>
              <form onSubmit={updateProfile}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex flex-col items-center sm:items-start gap-4">
                      <div className="relative group">
                        <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-primary/20 shadow-lg group-hover:border-primary/40 transition-colors">
                          <AvatarImage
                            src={avatarUrl || "/placeholder.svg"}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 rounded-full cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            Изменить
                          </span>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      {avatarFile && (
                        <div className="text-xs text-primary flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          {avatarFile.name} (готово к сохранению)
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <User className="w-4 h-4" />
                          Полное имя
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Введите ваше имя"
                          className="cursor-text h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Это имя будет отображаться в вашем профиле
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-muted/50 cursor-not-allowed h-11 pr-10"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Email не может быть изменен
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 h-11 px-6"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Сохранить изменения
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Password Change Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Безопасность аккаунта
                </CardTitle>
                <CardDescription>
                  Измените пароль для защиты вашего аккаунта
                </CardDescription>
              </CardHeader>
              <form onSubmit={updatePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Lock className="w-4 h-4" />
                      Новый пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Введите новый пароль"
                        className="cursor-text h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="w-3 h-3" />
                      Минимум 6 символов
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Lock className="w-4 h-4" />
                      Подтвердите пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Повторите новый пароль"
                        className="cursor-text h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {newPassword &&
                      confirmPassword &&
                      newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Пароли не совпадают
                        </p>
                      )}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-6">
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword
                    }
                    className="cursor-pointer w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 h-11 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Изменение...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Обновить пароль
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
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
              © {new Date().getFullYear()} Админ-панель. Все права защищены.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
