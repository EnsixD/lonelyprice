// lonely-price/hooks/useOrderChat.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  attachments?: string[];
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_admin?: boolean;
  };
}

export function useOrderChat(orderId: string, currentUser: any) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const [uploading, setUploading] = useState(false);
  const channelRef = useRef<any>(null);
  const pendingMessagesRef = useRef<Set<string>>(new Set());

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      const senderIds = Array.from(
        new Set(messagesData?.map((msg) => msg.sender_id) || [])
      );

      let profilesData: any[] = [];
      if (senderIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin")
          .in("id", senderIds);

        if (profilesError) throw profilesError;
        profilesData = profiles || [];
      }

      const messagesWithProfiles =
        messagesData?.map((message) => {
          const profile = profilesData?.find((p) => p.id === message.sender_id);

          // Конвертируем attachments из JSONB/массива в массив строк
          let attachments: string[] = [];
          if (message.attachments) {
            if (Array.isArray(message.attachments)) {
              attachments = message.attachments;
            } else if (typeof message.attachments === "object") {
              // Если это JSONB объект
              attachments = Object.values(message.attachments).filter(
                (v) => typeof v === "string"
              );
            }
          }

          return {
            ...message,
            profiles: profile,
            attachments: attachments,
          };
        }) || [];

      console.log("Загружено сообщений:", messagesWithProfiles.length);
      console.log(
        "Первое сообщение attachments:",
        messagesWithProfiles[0]?.attachments
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, supabase]);

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        try {
          console.log(
            "Начинаю загрузку файла:",
            file.name,
            "размер:",
            file.size
          );

          // Проверяем размер файла
          if (file.size > 10 * 1024 * 1024) {
            throw new Error("Файл слишком большой. Максимум 10MB");
          }

          // Генерируем уникальное имя файла
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}.${fileExt}`;
          const filePath = `chat/${orderId}/${fileName}`;

          console.log("Путь для загрузки:", filePath);

          // Загружаем файл в Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("chat-attachments")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Ошибка загрузки в storage:", uploadError);
            throw uploadError;
          }

          // Получаем публичный URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);

          console.log("Файл успешно загружен, URL:", publicUrl);
          resolve(publicUrl);
        } catch (error: any) {
          console.error("Ошибка при загрузке файла:", error);
          reject(error);
        }
      });
    },
    [orderId, supabase]
  );

  const sendMessage = useCallback(
    async (text: string, files?: File[]) => {
      if (!currentUser?.id) {
        console.log("Нет пользователя");
        return null;
      }

      // Проверяем, есть ли хоть что-то для отправки
      const hasText = text && text.trim().length > 0;
      const hasFiles = files && files.length > 0;

      if (!hasText && !hasFiles) {
        console.log("Нечего отправлять");
        return null;
      }

      console.log(
        "Отправка сообщения:",
        text || "(без текста)",
        "файлы:",
        files?.length
      );

      // Устанавливаем состояние загрузки
      setUploading(true);

      try {
        let attachments: string[] = [];

        // Загружаем файлы если есть
        if (hasFiles && files) {
          console.log("Начинаю загрузку файлов...");
          setUploading(true);

          const uploadPromises = files.map(async (file) => {
            try {
              console.log("Загружаю файл:", file.name);
              const fileUrl = await uploadFile(file);
              console.log("Файл загружен:", file.name, "URL:", fileUrl);
              return fileUrl;
            } catch (error) {
              console.error("Ошибка загрузки файла:", file.name, error);
              throw error;
            }
          });

          try {
            const uploadedUrls = await Promise.all(uploadPromises);
            attachments = uploadedUrls.filter((url) => url) as string[];
            console.log("Всего успешно загружено файлов:", attachments.length);
          } catch (error) {
            console.error("Ошибка при загрузке файлов:", error);
            // Не прерываем отправку, если есть текст
            if (!hasText) {
              setUploading(false);
              throw error;
            }
          }
        }

        const tempId = `temp-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Создаем текст сообщения
        let messageText = text.trim();
        if (!messageText && attachments.length > 0) {
          messageText = "📎 Файл(ы)";
        }

        const tempMessage: Message = {
          id: tempId,
          order_id: orderId,
          sender_id: currentUser.id,
          message: messageText,
          is_read: false,
          created_at: new Date().toISOString(),
          attachments: attachments,
          profiles: {
            id: currentUser.id,
            full_name: "Вы",
            is_admin: currentUser.is_admin || false,
          },
        };

        console.log("Временное сообщение:", tempMessage);

        setMessages((prev) => [...prev, tempMessage]);
        pendingMessagesRef.current.add(tempId);

        // Подготавливаем данные для отправки
        const messageData: any = {
          order_id: orderId,
          sender_id: currentUser.id,
          message: messageText,
          is_read: false,
        };

        // Добавляем attachments только если они есть
        if (attachments.length > 0) {
          messageData.attachments = attachments;
        }

        console.log("Отправляю данные в БД:", messageData);

        const { data, error } = await supabase
          .from("messages")
          .insert(messageData)
          .select()
          .single();

        if (error) {
          console.error("Ошибка отправки в БД:", error);
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          pendingMessagesRef.current.delete(tempId);
          setUploading(false);
          return null;
        }

        console.log("Сообщение сохранено в БД:", data);

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin")
          .eq("id", currentUser.id)
          .single();

        const finalMessage: Message = {
          ...data,
          attachments: attachments,
          profiles: profile || {
            id: currentUser.id,
            full_name: "Вы",
            is_admin: currentUser.is_admin || false,
          },
        };

        console.log("Финальное сообщение:", finalMessage);

        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.id !== tempId);
          pendingMessagesRef.current.delete(tempId);

          if (!newMessages.some((msg) => msg.id === finalMessage.id)) {
            return [...newMessages, finalMessage];
          }
          return newMessages;
        });

        setUploading(false);
        return finalMessage;
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        setUploading(false);
        return null;
      }
    },
    [orderId, supabase, currentUser, uploadFile]
  );

  const setupRealtime = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`order-${orderId}-messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          console.log("Получено новое сообщение через realtime:", payload.new);

          if (pendingMessagesRef.current.has(payload.new.id)) {
            console.log("Пропускаем сообщение в обработке");
            return;
          }

          if (payload.new.sender_id === currentUser?.id) {
            console.log("Пропускаем свое сообщение");
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, is_admin")
            .eq("id", payload.new.sender_id)
            .single();

          // Конвертируем attachments
          let attachments: string[] = [];
          if (payload.new.attachments) {
            if (Array.isArray(payload.new.attachments)) {
              attachments = payload.new.attachments;
            } else if (typeof payload.new.attachments === "object") {
              attachments = Object.values(payload.new.attachments).filter(
                (v) => typeof v === "string"
              );
            }
          }

          const newMessage: Message = {
            ...payload.new,
            attachments: attachments,
            profiles: profile,
          };

          console.log("Добавляю сообщение в чат:", newMessage);

          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log("Статус realtime:", status);
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR" || status === "CLOSED") {
          setConnectionStatus("disconnected");
        }
      });

    channelRef.current = channel;

    return () => {
      console.log("Очистка realtime канала");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      pendingMessagesRef.current.clear();
    };
  }, [orderId, supabase, currentUser?.id]);

  useEffect(() => {
    console.log("Инициализация чата для orderId:", orderId);
    loadMessages();
    const cleanup = setupRealtime();

    return () => {
      cleanup();
    };
  }, [loadMessages, setupRealtime]);

  return {
    messages,
    loadMessages,
    sendMessage,
    uploadFile,
    connectionStatus,
    isLoading,
    uploading,
  };
}
