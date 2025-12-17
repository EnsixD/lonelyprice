// lonely-price/components/payment/PaymentDetails.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Building,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentDetailsProps {
  orderId: string;
  amount: number;
}

const paymentMethods = [
  {
    id: "phone",
    name: "По номеру телефона",
    icon: <Smartphone className="w-5 h-5" />,
    details: "+79527985736",
    description: "Перевод на номер телефона (ВТБ)",
  },
  {
    id: "card",
    name: "По номеру карты",
    icon: <CreditCard className="w-5 h-5" />,
    details: "2200 7000 1234 5678",
    description: "Карта ВТБ (Юлия А.)",
  },
  {
    id: "bank",
    name: "Банковский перевод",
    icon: <Building className="w-5 h-5" />,
    details: "ВТБ (ПАО)",
    description: "БИК 044525187, к/с 30101810700000000187",
  },
];

export function PaymentDetails({ orderId, amount }: PaymentDetailsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Скопировано в буфер обмена");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-primary" />
          Реквизиты для оплаты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Информация о заказе */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Сумма к оплате</p>
              <p className="text-2xl font-bold text-primary">
                {amount.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Номер заказа</p>
              <p className="text-lg font-mono">#{orderId.slice(0, 8)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Комментарий к платежу</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded flex-1">
                  Заказ #{orderId.slice(0, 8)} Lonely PRICE
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      `Заказ #${orderId.slice(0, 8)} Lonely PRICE`,
                      "comment"
                    )
                  }
                  className="h-10 w-10"
                >
                  {copiedId === "comment" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Способы оплаты */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Выберите удобный способ оплаты:
          </p>

          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(method.details, method.id)}
                  className="h-9 w-9"
                >
                  {copiedId === method.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="font-mono text-lg text-center">
                  {method.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Инструкция */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Инструкция по оплате:</p>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>Скопируйте реквизиты удобным способом</li>
                <li>Переведите сумму {amount.toLocaleString("ru-RU")} ₽</li>
                <li>
                  В комментарии укажите:{" "}
                  <strong>Заказ #{orderId.slice(0, 8)}</strong>
                </li>
                <li>Отправьте фото чека в чат для подтверждения</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
