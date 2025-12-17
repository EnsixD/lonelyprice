"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Minus,
  Loader2,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface CartItem {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  created_at: string;
  services?: Service;
}

interface CartClientProps {
  initialCartItems: CartItem[];
  initialTotalAmount: number;
}

export default function CartClient({
  initialCartItems,
  initialTotalAmount,
}: CartClientProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    setUpdatingItemId(itemId);
    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );

        const updatedTotal = cartItems.reduce((sum, item) => {
          const price = item.services?.price || 0;
          const quantity = item.id === itemId ? newQuantity : item.quantity;
          return sum + price * quantity;
        }, 0);
        setTotalAmount(updatedTotal);

        toast.success("Количество обновлено");
      } else {
        toast.error("Ошибка обновления");
      }
    } catch (error) {
      console.error("Ошибка обновления:", error);
      toast.error("Ошибка обновления");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItemId(itemId);
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        const removedItem = cartItems.find((item) => item.id === itemId);
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));

        if (removedItem) {
          const removedAmount =
            (removedItem.services?.price || 0) * removedItem.quantity;
          setTotalAmount((prev) => prev - removedAmount);
        }

        toast.success("Товар удален");
      } else {
        toast.error("Ошибка удаления");
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast.error("Ошибка удаления");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCreateOrderClick = () => {
    if (cartItems.length === 0) {
      toast.error("Корзина пуста");
      return;
    }
    setShowAgreement(true);
  };

  const createOrder = async () => {
    if (!agreementAccepted) {
      toast.error("Вы должны принять лицензионное соглашение");
      return;
    }

    setLoading(true);
    setShowAgreement(false);
    toast.info("Создание заказа...");

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log("Ответ API:", result);

      if (response.ok && result.success) {
        toast.success(`✅ Заказ #${result.orderId} создан!`);
        setAgreementAccepted(false);
        router.push(result.redirectUrl);
      } else {
        toast.error(`❌ ${result.error || "Ошибка создания заказа"}`);
      }
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
      toast.error("❌ Ошибка сети при создании заказа");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-center">
            Корзина пуста
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center">
            Добавьте услуги, чтобы оформить заказ
          </p>
          <Button asChild className="cursor-pointer">
            <a href="/services" className="text-sm sm:text-base">
              Перейти к услугам
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card
              key={item.id}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg mb-1">
                      {item.services?.title || "Услуга"}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {item.services?.description || "Описание отсутствует"}
                    </p>
                  </div>
                  <Badge className="ml-2 sm:ml-4 font-bold whitespace-nowrap text-xs sm:text-sm px-2 py-1">
                    {(
                      (item.services?.price || 0) * item.quantity
                    ).toLocaleString("ru-RU")}{" "}
                    ₽
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={
                        updatingItemId === item.id || item.quantity <= 1
                      }
                      className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
                    >
                      {updatingItemId === item.id ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                    <span className="font-semibold w-8 text-center text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItemId === item.id}
                      className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
                    >
                      {updatingItemId === item.id ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={updatingItemId === item.id}
                    className="text-destructive cursor-pointer h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    {updatingItemId === item.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Удалить</span>
                    <span className="sm:hidden">Удал.</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-6 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Итого</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-muted-foreground">Товаров:</span>
                <span className="font-medium">{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-muted-foreground">Общая сумма:</span>
                <span className="font-medium">
                  {totalAmount.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold">
                  К оплате:
                </span>
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  {totalAmount.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col gap-3">
              <Button
                onClick={handleCreateOrderClick}
                disabled={loading || cartItems.length === 0}
                className="w-full cursor-pointer text-sm sm:text-base"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Оформление...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Оформить заказ
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                После оформления вы будете перенаправлены в чат с
                администратором
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <DialogTitle>Лицензионное соглашение</DialogTitle>
            </div>
            <DialogDescription>
              Для оформления заказа необходимо принять условия соглашения
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 text-sm">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-center">
                  ЛИЦЕНЗИОННОЕ СОГЛАШЕНИЕ
                </h3>
                <p className="mb-4">
                  Настоящее Лицензионное соглашение регулирует условия
                  использования услуг онлайн-магазина{" "}
                  <strong>Lonely Price</strong>. Оформляя заказ, вы
                  подтверждаете согласие со всеми условиями ниже.
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      1. Предмет соглашения
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        Lonely Price предоставляет право использования
                        оплаченных услуг
                      </li>
                      <li>Услуги предназначены для личного использования</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Оформление заказа</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        Соглашение считается заключенным с момента подтверждения
                        заказа
                      </li>
                      <li>
                        Исполнитель приступает к работе после поступления оплаты
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      3. Права и ограничения
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        Запрещено распространять результаты услуг без согласия
                        Исполнителя
                      </li>
                      <li>
                        Все материалы являются интеллектуальной собственностью
                        Lonely Price
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Ответственность</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        Услуги предоставляются «как есть» согласно описанию
                      </li>
                      <li>
                        Исполнитель не несет ответственности за обстоятельства
                        непреодолимой силы
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      5. Персональные данные
                    </h4>
                    <p>
                      Принимая Соглашение, вы даете согласие на обработку
                      персональных данных для исполнения заказа.
                    </p>
                  </div>

                  <div className="bg-primary/5 p-3 rounded border border-primary/20">
                    <p className="font-medium text-center">
                      <strong>
                        Нажимая кнопку "Принять и продолжить", вы подтверждаете
                        согласие со всеми условиями настоящего Лицензионного
                        соглашения.
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Checkbox
                id="agreement"
                checked={agreementAccepted}
                onCheckedChange={(checked) =>
                  setAgreementAccepted(checked as boolean)
                }
                className="cursor-pointer"
              />
              <Label
                htmlFor="agreement"
                className="text-sm font-medium cursor-pointer"
              >
                Я принимаю условия лицензионного соглашения
              </Label>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAgreement(false);
                  setAgreementAccepted(false);
                }}
                className="flex-1 sm:flex-none"
              >
                Отмена
              </Button>
              <Button
                onClick={createOrder}
                disabled={!agreementAccepted || loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Оформление...
                  </>
                ) : (
                  "Принять и продолжить"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
