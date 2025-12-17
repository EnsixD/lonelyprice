"use client";

import { useState, useRef, useEffect, ChangeEvent, useCallback } from "react";
import { useOrderChat } from "@/hooks/useOrderChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  X,
  Download,
  Maximize2,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OrderChat({
  orderId,
  currentUser,
  orderStatus = "pending",
  paymentStatus = "unpaid",
}: {
  orderId?: string;
  currentUser?: any;
  orderStatus?: string;
  paymentStatus?: string;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottomRef = useRef(true);

  // Проверка доступности чата
  const isChatDisabled =
    orderStatus === "cancelled" || orderStatus === "completed";

  if (!orderId || !currentUser?.id) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <div className="text-muted-foreground mb-1">Чат недоступен</div>
        <div className="text-sm text-muted-foreground/70">
          Нет данных для отображения
        </div>
      </div>
    );
  }

  const { messages, sendMessage, connectionStatus, isLoading, uploading } =
    useOrderChat(orderId, currentUser);

  // Функция для плавной прокрутки вниз
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (scrollAreaRef.current && shouldScrollToBottomRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior,
        });
      }
    }
  }, []);

  // Автопрокрутка при новых сообщениях
  useEffect(() => {
    if (messages.length > 0) {
      const scrollArea = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        const isAtBottom =
          scrollArea.scrollHeight -
            scrollArea.scrollTop -
            scrollArea.clientHeight <
          100;
        shouldScrollToBottomRef.current = isAtBottom;

        if (isAtBottom) {
          scrollToBottom("auto");
        }
      }
    }
  }, [messages.length, scrollToBottom]);

  // Обработчик скролла
  const handleScroll = useCallback(() => {
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollArea) {
      const isAtBottom =
        scrollArea.scrollHeight -
          scrollArea.scrollTop -
          scrollArea.clientHeight <
        100;
      shouldScrollToBottomRef.current = isAtBottom;
    }
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles
        .filter((file) => file.size <= 10 * 1024 * 1024)
        .slice(0, 5);

      setFiles((prev) => [...prev, ...validFiles]);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && files.length === 0) || isChatDisabled) return;

    try {
      const result = await sendMessage(text, files);
      if (result) {
        setText("");
        setFiles([]);
        setTimeout(() => {
          shouldScrollToBottomRef.current = true;
          scrollToBottom("smooth");
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <div className="text-sm text-muted-foreground">
          Загрузка сообщений...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Диалог для просмотра изображений */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Просмотр изображения"
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <DialogClose className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
                <X className="w-5 h-5" />
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col h-full">
        {/* Заголовок чата */}
        <div className="border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm sm:text-base">
              Чат по заказу #{orderId.slice(0, 8)}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {connectionStatus === "connected" ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Предупреждение если чат отключен */}
        {isChatDisabled && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 p-3">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Чат недоступен для{" "}
                {orderStatus === "cancelled" ? "отмененных" : "завершенных"}{" "}
                заказов
              </span>
            </div>
          </div>
        )}

        {/* Сообщения */}
        <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-3 sm:p-4" ref={scrollAreaRef}>
            <div
              ref={messagesContainerRef}
              className="space-y-3 sm:space-y-4 pb-4"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <div className="text-muted-foreground mb-1 text-sm sm:text-base">
                    Нет сообщений
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground/70">
                    Начните общение первым
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUser.id;
                  const isTemp = msg.id.startsWith("temp-");
                  const senderName = isOwn
                    ? "Вы"
                    : msg.profiles?.full_name || "Пользователь";
                  const senderInitials = senderName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      } gap-2 sm:gap-3`}
                    >
                      {!isOwn && (
                        <Avatar className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                          <AvatarImage src={msg.profiles?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {senderInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[85%] ${isOwn ? "text-right" : ""}`}
                      >
                        {!isOwn && (
                          <div className="text-xs text-muted-foreground mb-1 ml-1">
                            {senderName}
                          </div>
                        )}

                        <div
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm ${
                            isTemp
                              ? "bg-muted opacity-70"
                              : isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          } ${isOwn ? "rounded-br-none" : "rounded-bl-none"}`}
                        >
                          {msg.message && (
                            <div className="break-words whitespace-pre-wrap mb-2">
                              {msg.message}
                            </div>
                          )}

                          {/* Вложения */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((url, index) => {
                                const isImage = url.match(
                                  /\.(jpg|jpeg|png|gif|webp|bmp)$/i
                                );

                                return (
                                  <div key={index} className="relative group">
                                    {isImage ? (
                                      <div className="relative">
                                        <div
                                          className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => setSelectedImage(url)}
                                        >
                                          <Image
                                            src={url}
                                            alt="Прикрепленное фото"
                                            width={192}
                                            height={192}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                          />
                                        </div>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="absolute top-1 sm:top-2 right-1 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => setSelectedImage(url)}
                                        >
                                          <Maximize2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            window.open(url, "_blank");
                                          }}
                                        >
                                          <Download className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs sm:text-sm truncate">
                                            {url.split("/").pop() ||
                                              `Файл ${index + 1}`}
                                          </p>
                                        </div>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            window.open(url, "_blank")
                                          }
                                          className="h-7 w-7 sm:h-8 sm:w-8"
                                        >
                                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div
                            className={`mt-2 text-xs flex items-center gap-1 opacity-80 ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isTemp && (
                              <>
                                <span>
                                  {formatDistanceToNow(
                                    new Date(msg.created_at),
                                    {
                                      addSuffix: true,
                                      locale: ru,
                                    }
                                  )}
                                </span>
                                {isOwn && (
                                  <span className="ml-1">
                                    {msg.is_read ? (
                                      <CheckCheck className="w-3 h-3 inline" />
                                    ) : (
                                      <Check className="w-3 h-3 inline" />
                                    )}
                                  </span>
                                )}
                              </>
                            )}
                            {isTemp && (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Отправка...</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isOwn && (
                        <Avatar className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                          <AvatarImage
                            src={currentUser.user_metadata?.avatar_url}
                          />
                          <AvatarFallback className="text-xs">
                            {senderInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Выбранные файлы */}
        {files.length > 0 && (
          <div className="border-t border-b p-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прикрепленные файлы:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Очистить
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => {
                const isImage = file.type.startsWith("image/");

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-white dark:bg-gray-800 rounded-lg border text-xs sm:text-sm"
                  >
                    {isImage ? (
                      <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span className="truncate max-w-[100px] sm:max-w-[150px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-5 w-5 sm:h-6 sm:w-6"
                    >
                      <X className="w-2 h-2 sm:w-3 sm:h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Форма отправки */}
        <form onSubmit={handleSubmit} className="border-t p-3 bg-background">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isChatDisabled}
              title="Прикрепить файл"
              className="h-10 w-10 flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isChatDisabled ? "Чат недоступен" : "Введите сообщение..."
              }
              disabled={isChatDisabled}
              className="flex-1 text-sm sm:text-base"
            />
            <Button
              type="submit"
              disabled={
                (!text.trim() && files.length === 0) ||
                isChatDisabled ||
                uploading
              }
              size="icon"
              className="h-10 w-10 flex-shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex justify-between">
            <span className="hidden sm:inline">Макс. 5 файлов, 2MB каждый</span>
            <span className="sm:hidden">Макс. 5 файлов</span>
            {connectionStatus === "disconnected" && (
              <span className="text-red-500 text-xs">Нет соединения</span>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
