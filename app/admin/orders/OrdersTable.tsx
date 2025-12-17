"use client";

import { useOptimistic, useState } from "react";
import { updateOrderStatus, updatePaymentStatus, deleteOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  CreditCard,
  User,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function OrdersTable({ orders }: { orders: any[] }) {
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Управление заказами</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Все заказы системы ({orders.length})
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Заказов пока нет</h3>
            <p className="text-muted-foreground text-center">
              Как только пользователи начнут создавать заказы, они появятся
              здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <OrdersList orders={orders} />
      )}
    </div>
  );
}

function OrdersList({ orders }: { orders: any[] }) {
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        label: "Ожидает",
        icon: <Package className="w-3 h-3 mr-1" />,
      },
      processing: {
        variant: "default" as const,
        label: "Обработка",
        icon: <Package className="w-3 h-3 mr-1" />,
      },
      completed: {
        variant: "outline" as const,
        label: "Завершен",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      cancelled: {
        variant: "destructive" as const,
        label: "Отменен",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPaymentBadge = (status: string) => {
    const variants = {
      unpaid: {
        variant: "destructive" as const,
        label: "Не оплачен",
        icon: <CreditCard className="w-3 h-3 mr-1" />,
      },
      pending: {
        variant: "secondary" as const,
        label: "Ожидает оплаты",
        icon: <CreditCard className="w-3 h-3 mr-1" />,
      },
      paid: {
        variant: "outline" as const,
        label: "Оплачен",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      refunded: {
        variant: "secondary" as const,
        label: "Возврат",
        icon: <CreditCard className="w-3 h-3 mr-1" />,
      },
    };
    return variants[status as keyof typeof variants] || variants.unpaid;
  };

  const canAccessChat = (order: any) => {
    return order.status !== "cancelled" && order.status !== "completed";
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    try {
      // Используем Server Action
      const result = await deleteOrder(orderId);

      if (result.success) {
        toast.success(result.message || "Заказ успешно удален");

        // Удаляем из локального состояния
        setLocalOrders((prev) => prev.filter((order) => order.id !== orderId));

        console.log(
          `✅ Заказ ${orderId} удален. Осталось: ${localOrders.length - 1}`
        );
      } else {
        toast.error(result.message || "Ошибка при удалении заказа");
        console.error("Ошибка удаления:", result);
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Ошибка при удалении заказа");
    } finally {
      setDeletingOrderId(null);
    }
  };

  // Функция для получения имени пользователя
  const getUserName = (order: any) => {
    if (order.profiles?.full_name) return order.profiles.full_name;
    if (order.user_profile?.full_name) return order.user_profile.full_name;
    return "Без имени";
  };

  // Функция для получения email пользователя
  const getUserEmail = (order: any) => {
    if (order.profiles?.email) return order.profiles.email;
    if (order.user_profile?.email) return order.user_profile.email;
    return "Нет email";
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Список заказов</CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">Клиент</TableHead>
                <TableHead className="whitespace-nowrap">Сумма</TableHead>
                <TableHead className="whitespace-nowrap">Статус</TableHead>
                <TableHead className="whitespace-nowrap">Оплата</TableHead>
                <TableHead className="whitespace-nowrap">Создан</TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {localOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const paymentBadge = getPaymentBadge(order.payment_status);
                const chatAvailable = canAccessChat(order);

                return (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono font-medium">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm">
                          #{order.id.slice(0, 8)}
                        </span>
                        {(order.status === "cancelled" ||
                          order.status === "completed") && (
                          <Badge variant="outline" className="text-xs w-fit">
                            Архив
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <div className="font-medium text-sm">
                            {getUserName(order)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">
                            {getUserEmail(order)}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-sm sm:text-base">
                      {order.total_amount.toLocaleString("ru-RU")} ₽
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <Badge
                          variant={statusBadge.variant}
                          className="gap-1 text-xs w-fit"
                        >
                          {statusBadge.icon}
                          {statusBadge.label}
                        </Badge>
                        <OrderStatusSelect
                          order={order}
                          onUpdate={(newStatus) => {
                            setLocalOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id
                                  ? { ...o, status: newStatus }
                                  : o
                              )
                            );
                          }}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <Badge
                          variant={paymentBadge.variant}
                          className="gap-1 text-xs w-fit"
                        >
                          {paymentBadge.icon}
                          {paymentBadge.label}
                        </Badge>
                        <PaymentStatusSelect
                          order={order}
                          onUpdate={(newStatus) => {
                            setLocalOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id
                                  ? { ...o, payment_status: newStatus }
                                  : o
                              )
                            );
                          }}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-xs sm:text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          title={
                            chatAvailable
                              ? "Перейти в чат заказа"
                              : "Чат недоступен для завершенных/отмененных заказов"
                          }
                        >
                          <a href={`/orders/${order.id}`}>
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                          </a>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={deletingOrderId === order.id}
                              title="Удалить заказ"
                            >
                              {deletingOrderId === order.id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Удаление заказа
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm">
                                Вы уверены, что хотите удалить заказ #
                                {order.id.slice(0, 8)}?
                                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                                  <strong>Будет удалено:</strong>
                                  <ul className="list-disc ml-4 mt-1 space-y-1">
                                    <li>Данные заказа</li>
                                    <li>Товары в заказе</li>
                                    <li>История сообщений в чате</li>
                                  </ul>
                                </div>
                                <p className="mt-2 text-red-600 font-semibold">
                                  Это действие невозможно отменить!
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="mt-0">
                                Отмена
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingOrderId === order.id}
                              >
                                {deletingOrderId === order.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Удаление...
                                  </>
                                ) : (
                                  "Удалить заказ"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderStatusSelect({
  order,
  onUpdate,
}: {
  order: any;
  onUpdate?: (status: string) => void;
}) {
  const [status, setStatus] = useOptimistic(
    order.status,
    (_, value: string) => value
  );

  const handleChange = async (value: string) => {
    setStatus(value);
    if (onUpdate) onUpdate(value);
    try {
      await updateOrderStatus(order.id, value);
      toast.success(
        `Статус заказа изменен на: ${
          value === "pending"
            ? "Ожидает"
            : value === "processing"
            ? "В обработке"
            : value === "completed"
            ? "Завершен"
            : "Отменен"
        }`
      );
    } catch (error) {
      toast.error("Ошибка при изменении статуса");
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full border rounded px-2 py-1 text-xs bg-background cursor-pointer"
    >
      <option value="pending">Ожидает</option>
      <option value="processing">В обработке</option>
      <option value="completed">Завершен</option>
      <option value="cancelled">Отменен</option>
    </select>
  );
}

function PaymentStatusSelect({
  order,
  onUpdate,
}: {
  order: any;
  onUpdate?: (status: string) => void;
}) {
  const [status, setStatus] = useOptimistic(
    order.payment_status,
    (_, value: string) => value
  );

  const handleChange = async (value: string) => {
    setStatus(value);
    if (onUpdate) onUpdate(value);
    try {
      await updatePaymentStatus(order.id, value);
      toast.success(
        `Статус оплаты изменен на: ${
          value === "unpaid"
            ? "Не оплачен"
            : value === "pending"
            ? "Ожидает оплаты"
            : value === "paid"
            ? "Оплачен"
            : "Возврат"
        }`
      );
    } catch (error) {
      toast.error("Ошибка при изменении статуса оплаты");
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full border rounded px-2 py-1 text-xs bg-background cursor-pointer"
    >
      <option value="unpaid">Не оплачен</option>
      <option value="pending">Ожидает оплаты</option>
      <option value="paid">Оплачен</option>
      <option value="refunded">Возврат</option>
    </select>
  );
}
