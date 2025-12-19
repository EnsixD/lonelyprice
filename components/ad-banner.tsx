// components/ad-banner.tsx
"use client";

import { useState } from "react";
import { X, Coffee, Clock, Package, Star, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 right-0 z-[100]"
        >
          <div className="bg-black/95 backdrop-blur-sm border-t border-emerald-800/30">
            {/* Тонкая акцентная линия */}
            <div className="h-px w-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-700" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {/* Левая часть - основная информация */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* Иконка */}
                  <div className="flex-shrink-0 mt-1 sm:mt-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-900/20 to-teal-900/10 border border-emerald-800/40 flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>

                  {/* Текстовая информация */}
                  <div className="flex flex-col min-w-0 flex-1 gap-2">
                    {/* Основной заголовок и скидка */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        Tasty Coffee • Свежая обжарка
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-800/40">
                          <span className="text-xs font-medium text-emerald-300">
                            -15% на первую покупку
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Преимущества */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-300">
                          Обжарка daily
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-300">
                          Доставка входит в стоимость покупки кофе
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-300">
                          4.5 ★ по отзывам
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-300">
                          Organic зерна
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Правая часть - кнопки и цена */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Ценовая информация */}
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-400 line-through">
                        769₽
                      </span>
                      <span className="text-base font-semibold text-white">
                        649₽
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">за 250г</span>
                  </div>

                  {/* Кнопки */}
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="h-9 px-4 font-medium bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white border border-emerald-700/50 rounded transition-colors duration-150"
                    >
                      <a
                        target="_blank"
                        rel="nofollow noopener noreferrer sponsored"
                        href="https://dkfrh.com/g/800vlob2z4046dfda6eb9ebcee8c5e/?i=4&erid=2bL9aMPo2e49hMef4pgUXbXvDx"
                        className="flex items-center gap-2"
                      >
                        <Coffee className="h-4 w-4" />
                        <span>Выбрать сорт</span>
                      </a>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsVisible(false)}
                      className="h-8 w-8 text-gray-500 hover:text-gray-300 hover:bg-gray-900/50"
                      aria-label="Закрыть"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="border-t border-gray-900/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                  <span className="text-[10px] text-gray-500">
                    Хани • Колумбия Уила • Эфиопия
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Бесплатная доставка
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Самовывоз из 40+ точек
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
