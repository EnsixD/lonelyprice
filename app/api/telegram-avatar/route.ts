import { NextRequest, NextResponse } from "next/server";

// Кэширование на 1 день
export const revalidate = 86400; // 24 часа в секундах

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const refresh = searchParams.get("refresh") === "true";

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Проверяем кэш
  const cacheKey = `telegram-avatar-${username}`;

  // Если не запрошено обновление, можно проверить кэш
  if (!refresh) {
    // Здесь можно добавить логику проверки кэша, если используете внешний кэш
  }

  try {
    // Получаем страницу Telegram
    const response = await fetch(`https://t.me/${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
      next: { revalidate: refresh ? 0 : 86400 }, // Кэширование в Next.js
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Telegram page: ${response.status}`);
    }

    const html = await response.text();

    // Парсинг HTML для поиска аватара
    // Ищем разные варианты селекторов, которые использует Telegram
    const avatarPatterns = [
      /<img[^>]*class="tgme_page_photo_image"[^>]*src="([^"]*)"/,
      /<img[^>]*class="tgme_page_photo_image"[^>]*srcset="[^"]*1x[^"]*?\s+([^"]*)/,
      /property="og:image"[^>]*content="([^"]*)"/,
      /<meta[^>]*content="([^"]*)"[^>]*property="og:image"/,
    ];

    let avatarUrl = null;

    for (const pattern of avatarPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        avatarUrl = match[1];
        // Убираем параметры масштабирования если есть
        avatarUrl = avatarUrl.replace(/_\d+x\d+/g, "");
        break;
      }
    }

    // Также ищем в JSON-LD данных
    if (!avatarUrl) {
      const jsonLdMatch = html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
      );
      if (jsonLdMatch) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1]);
          if (jsonData.image) {
            avatarUrl = jsonData.image;
          }
        } catch (e) {
          console.error("Error parsing JSON-LD:", e);
        }
      }
    }

    if (avatarUrl) {
      // Проксируем через наш сервер, чтобы избежать проблем с CORS
      const proxyUrl = new URL("/api/proxy-image", request.nextUrl.origin);
      proxyUrl.searchParams.set("url", avatarUrl);

      return NextResponse.redirect(proxyUrl.toString());

      // Или возвращаем напрямую (может быть проблемы с CORS)
      // return NextResponse.redirect(avatarUrl);
    }

    // Если аватар не найден, генерируем fallback
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=random&color=fff&bold=true&length=1&size=256`;
    return NextResponse.redirect(fallbackUrl);
  } catch (error) {
    console.error("Error fetching Telegram avatar:", error);

    // Fallback на генерацию аватара
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=random&color=fff&bold=true&length=1&size=256`;
    return NextResponse.redirect(fallbackUrl);
  }
}
