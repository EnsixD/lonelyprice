"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm mb-6 sm:mb-8">
      {/* Decorative elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/5 blur-xl" />

      <div className="relative p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-1 bg-primary/20 rounded-md text-xs font-medium text-primary">
                Партнерская реклама
              </div>
              <div className="px-2 py-1 bg-green-500/20 rounded-md text-xs font-medium text-green-500">
                Скидка 15%
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              Вкусный кофе от Tasty Coffee
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              Насладитесь ароматным кофе с доставкой на дом. Специальное
              предложение для наших пользователей!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 cursor-pointer"
              >
                <a
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  href="https://dkfrh.com/g/800vlob2z4046dfda6eb9ebcee8c5e/?i=4&erid=2bL9aMPo2e49hMef4pgUXbXvDx"
                >
                  Перейти в магазин
                </a>
              </Button>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="cursor-pointer"
              >
                <a
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  href="https://dkfrh.com/g/800vlob2z4046dfda6eb9ebcee8c5e/?i=4&erid=2bL9aMPo2e49hMef4pgUXbXvDx"
                ></a>
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 flex-shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
