"use client";

import { ExternalLink, Users, Zap, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const telegramChannels = [
  {
    name: "Lonely Paradise",
    username: "lonelyparad1se",
    description: "Официальный канал проекта с новостями, обновлениями.",
    url: "https://t.me/lonelyparad1se",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    subscribers: "8К+",
    features: ["Новости", "розыгрыши", "Анонсы"],
    avatar: "/telegram-avatars/lonely.jpg", // Путь к файлу в public
  },
  {
    name: "Phantomic",
    username: "phantomic_300iq",
    description: "Аналитика и стратегии для продвинутых пользователей.",
    url: "https://t.me/phantomic_300iq",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    subscribers: "7K+",
    features: ["Аналитика", "Стратегии", "Инсайды"],
    avatar: "/telegram-avatars/phantomic.jpg", // Путь к файлу в public
  },
];

// Функция для получения fallback цвета
function getFallbackColor(username: string) {
  const colors = {
    lonely: "bg-gradient-to-br from-amber-500/20 to-amber-600/20",
    phantomic: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20",
  };

  if (username.includes("lonely")) return colors.lonely;
  if (username.includes("phantomic")) return colors.phantomic;
  return "bg-gradient-to-br from-gray-500/20 to-gray-600/20";
}

// Компонент для аватара
function TelegramAvatar({
  avatar,
  username,
  channelName,
}: {
  avatar: string;
  username: string;
  channelName: string;
}) {
  const [avatarError, setAvatarError] = useState(false);
  const fallbackChar = username.charAt(0).toUpperCase();
  const fallbackBg = getFallbackColor(username);

  return (
    <div className="relative">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-border/50">
        {!avatarError ? (
          <Image
            src={avatar}
            alt={`Аватар канала ${channelName}`}
            fill
            className="object-cover"
            sizes="56px"
            onError={() => setAvatarError(true)}
            priority={false}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${fallbackBg} text-white text-lg font-medium`}
          >
            {fallbackChar}
          </div>
        )}
      </div>

      {/* Иконка Telegram */}
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border border-white">
        <svg
          className="w-3 h-3 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.25-.02-.1.02-1.79 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.27-.24-1.89-.44-.76-.24-1.36-.37-1.31-.78.03-.24.29-.48.8-.73 3.14-1.37 5.24-2.27 6.29-2.72 2.96-1.26 3.57-1.48 3.97-1.48.09 0 .29.02.42.12.1.08.13.19.14.27-.01.06.01.28 0 0" />
        </svg>
      </div>
    </div>
  );
}

export function TelegramChannels() {
  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/5 to-emerald-500/5 border border-amber-500/10">
          <MessageCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-medium text-foreground tracking-tight">
            Telegram каналы
          </h2>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          Присоединяйтесь к нашим каналам, чтобы быть в курсе всех новостей и
          обновлений
        </p>
      </div>

      {/* Карточки каналов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {telegramChannels.map((channel, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border bg-gradient-to-b from-background to-background/95 transition-all duration-300 hover:shadow-md hover:border-amber-500/30"
            style={{ borderColor: channel.borderColor }}
          >
            <div className="relative p-6 space-y-5">
              {/* Верхний блок - фиксированной высоты */}
              <div className="space-y-4">
                {/* Заголовок и аватар */}
                <div className="flex items-start gap-4">
                  <TelegramAvatar
                    avatar={channel.avatar}
                    username={channel.username}
                    channelName={channel.name}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1.5 line-clamp-1">
                          {channel.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          @{channel.username}
                        </p>

                        {/* Особенности канала */}
                        <div className="flex flex-wrap gap-1.5">
                          {channel.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-amber-500/5 to-emerald-500/5 text-amber-600 border border-amber-500/10"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Подписчики */}
                      <div className="flex flex-col items-end flex-shrink-0 pt-1">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/5 to-emerald-500/5">
                          <Users className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">
                            {channel.subscribers}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Описание - фиксированной высоты */}
                <div className="h-12">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {channel.description}
                  </p>
                </div>
              </div>

              {/* Кнопка подписки - всегда внизу */}
              <div className="pt-4 border-t border-border/50">
                <Button
                  asChild
                  size="sm"
                  className={`w-full cursor-pointer bg-gradient-to-r ${channel.color} hover:opacity-90 hover:shadow-sm transition-all duration-200 text-white border-0 shadow-none`}
                >
                  <Link
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Подписаться на канал</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-80" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Акцентный угол */}
            <div
              className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl ${channel.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
            />
          </Card>
        ))}
      </div>

      {/* Минималистичный футер */}
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500/5 via-amber-500/2 to-emerald-500/5 border border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/10 to-emerald-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Всегда актуально
              </p>
              <p className="text-xs text-muted-foreground">
                Первыми получайте важные обновления
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-border/50" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Онлайн поддержка</span>
          </div>
        </div>
      </div>
    </div>
  );
}
